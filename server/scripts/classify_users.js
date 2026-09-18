const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const pool = require('../db/pool');

async function classifyUsers() {
  const client = await pool.connect();
  try {
    const canonicalRoster = [
      { username: 'admin', full_name: 'Administrator', role: 'admin' },
      { username: 'ambika', full_name: 'AMBIKA', role: 'operator' },
      { username: 'priya', full_name: 'BANU PRIYA', role: 'operator' },
      { username: 'bharath', full_name: 'BHARATH', role: 'operator' },
      { username: 'bibrath', full_name: 'BIBRATH', role: 'operator' },
      { username: 'bijoy', full_name: 'BIJOY', role: 'operator' },
      { username: 'dhatchayani', full_name: 'DHATCHAYANI', role: 'operator' },
      { username: 'jaganath', full_name: 'JAGANATH BISWAL', role: 'operator' },
      { username: 'jiban', full_name: 'JIBAN', role: 'operator' },
      { username: 'jitan', full_name: 'JITAN BISWAL', role: 'operator' },
      { username: 'mathi', full_name: 'MATHI', role: 'operator' },
      { username: 'mohan', full_name: 'MOHANRAJ', role: 'operator' },
      { username: 'muthu', full_name: 'MUTHUPANDI', role: 'supervisor' },
      { username: 'pandiyan', full_name: 'PANDIYAN', role: 'supervisor' },
      { username: 'parameshwar', full_name: 'PARAMESHWAR', role: 'operator' },
      { username: 'reethu', full_name: 'REETHU', role: 'operator' },
      { username: 'sakthivel', full_name: 'SAKTHIVEL', role: 'admin' },
      { username: 'shanthi', full_name: 'SHANTHI', role: 'operator' },
      { username: 'soni', full_name: 'SONI DEVI', role: 'operator' },
      { username: 'subhankar', full_name: 'SUBHANKAR BISWAL', role: 'operator' },
      { username: 'subrath', full_name: 'SUBRATH', role: 'operator' },
      { username: 'sujatha', full_name: 'SUJATHA', role: 'operator' },
      { username: 'thilaka', full_name: 'THILAKA', role: 'operator' },
      { username: 'vidhya', full_name: 'VIDHYA', role: 'admin' },
      { username: 'vijaya', full_name: 'VIJAYA', role: 'operator' }
    ];

    const allUsers = (await client.query(`
      SELECT u.id, u.username, u.full_name, u.role, u.active, u.pin_hash, u.deleted_at,
        to_char(u.created_at, 'YYYY-MM-DD HH24:MI') as created_at,
        (SELECT count(*) FROM production_entries WHERE operator_user_id = u.id) AS pe_count,
        (SELECT count(*) FROM bags WHERE operator_user_id = u.id) AS bag_count,
        (SELECT count(*) FROM trim_entries WHERE operator_user_id = u.id) AS trim_count,
        (SELECT count(*) FROM inspection_entries WHERE operator_user_id = u.id) AS insp_count,
        (SELECT count(*) FROM packing_entries WHERE operator_user_id = u.id) AS pack_count,
        (SELECT count(*) FROM login_history WHERE user_id = u.id) AS login_count,
        (SELECT count(*) FROM user_page_access WHERE user_id = u.id) AS page_access_count,
        (SELECT count(*) FROM machine_assignments WHERE set_by_user_id = u.id OR approved_by_user_id = u.id) AS mach_assign_count,
        (SELECT count(*) FROM attendance WHERE user_id = u.id) AS att_count,
        (SELECT count(*) FROM user_activity_log WHERE user_id = u.id) AS act_count
      FROM users u
      ORDER BY lower(u.username), u.id
    `)).rows;

    console.log(`Total users in DB: ${allUsers.length}`);

    // Let's identify the 25 Canonical survivors.
    // For each of the 25 canonical names, find the best survivor row:
    // Criteria: active=true, has page_access or login_count or real PIN or the main uppercase/lowercase row created during seed.
    const canonicalSurvivors = [];
    const duplicatesWithHistory = [];
    const duplicatesToDelete = [];

    for (const canon of canonicalRoster) {
      const matches = allUsers.filter(u => {
        const uLower = u.username.toLowerCase();
        const fLower = u.full_name.toLowerCase();
        const cUserLower = canon.username.toLowerCase();
        const cFullLower = canon.full_name.toLowerCase();
        
        return uLower === cUserLower ||
               fLower === cFullLower ||
               uLower.startsWith(cUserLower + '_del') ||
               (cUserLower === 'jitan' && (uLower === 'jithen' || fLower === 'jithen')) ||
               (cUserLower === 'priya' && (uLower === 'priya' || fLower.includes('priya'))) ||
               (cUserLower === 'mohan' && (uLower === 'mohan' || fLower.includes('mohan'))) ||
               (cUserLower === 'muthu' && (uLower === 'muthu' || fLower.includes('muthu'))) ||
               (cUserLower === 'soni' && (uLower === 'soni' || fLower.includes('soni'))) ||
               (cUserLower === 'jaganath' && (uLower === 'jaganath' || fLower.includes('jaganath'))) ||
               (cUserLower === 'subhankar' && (uLower === 'subhankar' || fLower.includes('subhankar')));
      });

      // Pick survivor:
      // If admin, id=1 (or username=admin).
      // Otherwise prefer active=true with canonical username (lowercase) or uppercase active=true.
      let survivor = null;
      if (canon.username === 'admin') {
        survivor = matches.find(u => u.id === 1) || matches[0];
      } else {
        // Look for active=true
        const activeMatches = matches.filter(u => u.active && !u.username.includes('_del'));
        if (activeMatches.length === 1) {
          survivor = activeMatches[0];
        } else if (activeMatches.length > 1) {
          // Prefer one with login/page_access or lowercase
          survivor = activeMatches.find(u => u.username === canon.username) ||
                     activeMatches.find(u => parseInt(u.login_count) > 0) ||
                     activeMatches[0];
        } else {
          // No active match, pick best inactive
          survivor = matches.find(u => u.username === canon.username) || matches[0];
        }
      }

      canonicalSurvivors.push({
        canon,
        survivor,
        matchedRows: matches
      });
    }

    // Now map all other rows
    const survivorIds = new Set(canonicalSurvivors.map(c => c.survivor ? c.survivor.id : null).filter(Boolean));

    for (const u of allUsers) {
      if (survivorIds.has(u.id)) continue;

      const totalHistory = parseInt(u.pe_count) + parseInt(u.bag_count) + parseInt(u.trim_count) +
                           parseInt(u.insp_count) + parseInt(u.pack_count) + parseInt(u.login_count) +
                           parseInt(u.mach_assign_count) + parseInt(u.att_count) + parseInt(u.act_count);

      // Find which canonical user this maps to
      let targetCanon = canonicalSurvivors.find(c => c.matchedRows.some(m => m.id === u.id));
      
      // Fallback fuzzy match if not matched above
      if (!targetCanon) {
        const uLower = u.username.toLowerCase();
        if (uLower.includes('janani')) {
          // JANANI is not in 25 canonical roster!
          targetCanon = null;
        }
      }

      if (totalHistory > 0 && targetCanon) {
        duplicatesWithHistory.push({
          user: u,
          relinkTo: targetCanon.survivor,
          canonUser: targetCanon.canon,
          totalHistory
        });
      } else {
        duplicatesToDelete.push({
          user: u,
          relinkTo: targetCanon ? targetCanon.survivor : null,
          canonUser: targetCanon ? targetCanon.canon : null,
          totalHistory
        });
      }
    }

    console.log('\n--- CLASSIFICATION RESULTS ---');
    console.log(`Canonical Survivors: ${canonicalSurvivors.length}`);
    console.log(`Duplicates with History to Relink: ${duplicatesWithHistory.length}`);
    console.log(`Duplicates Safe to Delete directly (0 history): ${duplicatesToDelete.length}`);

    fs.writeFileSync(path.join(__dirname, 'users_classification.json'), JSON.stringify({
      canonicalSurvivors,
      duplicatesWithHistory,
      duplicatesToDelete
    }, null, 2));

  } catch (err) {
    console.error(err);
  } finally {
    client.release();
    await pool.end();
  }
}

classifyUsers();
