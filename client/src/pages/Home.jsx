import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import { ERP_SECTIONS } from '../navigationSections';

const STORAGE_KEY = 'shrp_erp_expanded_sections';

export default function Home() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [search, setSearch] = useState('');

  // Persist expanded state
  const [expanded, setExpanded] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch { /* ignore */ }
    // Default: first three sections open for quick one-tap access
    return {
      production: true,
      quality: true,
      planning: true,
      materials: false,
      tooling_mgmt: false,
      commercial: false,
      reports: false,
      staff_hr: false,
    };
  });

  const toggleSection = (id) => {
    setExpanded((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  };

  const expandAll = () => {
    const all = {};
    ERP_SECTIONS.forEach((s) => { all[s.id] = true; });
    setExpanded(all);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(all)); } catch { /* ignore */ }
  };

  const collapseAll = () => {
    const all = {};
    ERP_SECTIONS.forEach((s) => { all[s.id] = false; });
    setExpanded(all);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(all)); } catch { /* ignore */ }
  };

  const isSupervisorOrAdmin = user.role === 'admin' || user.role === 'supervisor';
  const isAdmin = user.role === 'admin';

  const isTileVisible = (tile) => {
    if (tile.adminOnly && !isAdmin) return false;
    if (tile.supervisorOnly && !isSupervisorOrAdmin) return false;
    if (isSupervisorOrAdmin) return true;
    if (['rework', 'dispatch'].includes(tile.key)) return true;
    return !tile.key || (Array.isArray(user.pages) && user.pages.includes(tile.key));
  };

  const matchesSearch = (tile) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const label = (t(`home.tiles.${tile.key}.label`) || tile.label || '').toLowerCase();
    const hint = (t(`home.tiles.${tile.key}.hint`) || tile.hint || '').toLowerCase();
    return label.includes(q) || hint.includes(q) || tile.key.includes(q);
  };

  return (
    <div className="screen" style={{ paddingBottom: 24 }}>
      {/* Sleek Dark Welcome Header */}
      <div
        style={{
          background: 'var(--panel)',
          border: '1px solid var(--line)',
          borderLeft: '4px solid var(--amber)',
          borderRadius: 8,
          padding: '14px 16px',
          marginBottom: 12,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--amber)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            SHRP MES · Injection Moulding
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', marginTop: 2 }}>
            {t('home.welcome', { name: user.full_name.split(' ')[0] })}
          </div>
        </div>
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            textTransform: 'uppercase',
            padding: '4px 8px',
            background: 'rgba(245, 158, 11, 0.12)',
            color: 'var(--amber)',
            borderRadius: 4,
            border: '1px solid rgba(245, 158, 11, 0.3)',
          }}
        >
          {user.role}
        </span>
      </div>

      {/* Compact Search & One-Touch Expand/Collapse Bar */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          alignItems: 'center',
          marginBottom: 14,
        }}
      >
        <div style={{ position: 'relative', flex: 1 }}>
          <input
            type="text"
            placeholder="🔍 Search modules..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 28px 8px 12px',
              fontSize: 13,
              background: 'var(--panel)',
              border: '1px solid var(--line)',
              borderRadius: 6,
              color: 'var(--text)',
              outline: 'none',
            }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{
                position: 'absolute',
                right: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: 14,
                padding: 0,
              }}
            >
              ×
            </button>
          )}
        </div>
        <button
          onClick={expandAll}
          style={{
            padding: '8px 10px',
            fontSize: 11,
            fontWeight: 700,
            background: 'var(--panel)',
            border: '1px solid var(--line)',
            borderRadius: 6,
            color: 'var(--text-muted)',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
          title="Expand All"
        >
          ▼ Expand
        </button>
        <button
          onClick={collapseAll}
          style={{
            padding: '8px 10px',
            fontSize: 11,
            fontWeight: 700,
            background: 'var(--panel)',
            border: '1px solid var(--line)',
            borderRadius: 6,
            color: 'var(--text-muted)',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
          title="Collapse All"
        >
          ▶ Collapse
        </button>
      </div>

      {/* One-Liner Drop-Tree Expandable Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {ERP_SECTIONS.map((section) => {
          const visibleTiles = section.tiles.filter((t) => isTileVisible(t) && matchesSearch(t));
          if (visibleTiles.length === 0 && search.trim()) return null;
          if (section.tiles.filter(isTileVisible).length === 0) return null;

          const isOpen = search.trim() ? true : !!expanded[section.id];

          return (
            <div
              key={section.id}
              style={{
                background: 'var(--panel)',
                border: `1px solid ${isOpen ? section.accentColor : 'var(--line)'}`,
                borderRadius: 8,
                overflow: 'hidden',
                transition: 'border-color 0.2s ease',
              }}
            >
              {/* One-Liner Row (Header) */}
              <button
                type="button"
                onClick={() => toggleSection(section.id)}
                style={{
                  width: '100%',
                  background: 'none',
                  border: 'none',
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  textAlign: 'left',
                  color: 'inherit',
                  outline: 'none',
                }}
              >
                {/* Left: Process Icon & One-Liner Titles */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 6,
                      background: section.badgeBg,
                      border: `1px solid ${section.accentColor}44`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 18,
                      flexShrink: 0,
                    }}
                  >
                    {section.icon}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)', lineHeight: 1.2 }}>
                      {t(`home.sections.${section.sectionKey}.title`) || section.title}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: 'var(--text-muted)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        marginTop: 2,
                      }}
                    >
                      {t(`home.sections.${section.sectionKey}.tagline`) || section.tagline}
                    </div>
                  </div>
                </div>

                {/* Right: Module Count & Chevron */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, marginLeft: 8 }}>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: isOpen ? section.accentColor : 'var(--text-muted)',
                      background: isOpen ? section.badgeBg : 'rgba(255, 255, 255, 0.05)',
                      padding: '3px 7px',
                      borderRadius: 12,
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                    }}
                  >
                    {visibleTiles.length}
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      color: isOpen ? section.accentColor : 'var(--text-muted)',
                      transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s ease',
                      display: 'inline-block',
                    }}
                  >
                    ▼
                  </span>
                </div>
              </button>

              {/* Expanded Drop-Tree Keypad Grid */}
              {isOpen && (
                <div
                  style={{
                    padding: '8px 12px 14px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                    background: 'rgba(0, 0, 0, 0.15)',
                  }}
                >
                  <div className="tile-grid" style={{ marginTop: 4 }}>
                    {visibleTiles.map((tile) => (
                      tile.to ? (
                        <Link
                          key={tile.key}
                          to={tile.to}
                          className="tile"
                          style={{
                            borderLeftColor: section.accentColor,
                            padding: '12px 10px',
                          }}
                        >
                          <span className="tile-icon" style={{ fontSize: 20, marginBottom: 4 }}>
                            {tile.icon}
                          </span>
                          <span className="tile-label" style={{ fontSize: 13, marginBottom: 2 }}>
                            {t(`home.tiles.${tile.key}.label`) || tile.label}
                          </span>
                          <span className="tile-hint" style={{ fontSize: 11 }}>
                            {t(`home.tiles.${tile.key}.hint`) || tile.hint}
                          </span>
                        </Link>
                      ) : (
                        <div
                          key={tile.key}
                          className="tile"
                          style={{
                            borderLeftColor: 'var(--line)',
                            padding: '12px 10px',
                            opacity: 0.65,
                            cursor: 'not-allowed',
                            background: 'rgba(255, 255, 255, 0.02)',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                            <span className="tile-icon" style={{ fontSize: 20, marginBottom: 4 }}>
                              {tile.icon}
                            </span>
                            <span style={{ fontSize: 9, fontWeight: 700, background: 'rgba(255, 255, 255, 0.1)', padding: '2px 5px', borderRadius: 4, color: 'var(--text-muted)' }}>
                              SOON
                            </span>
                          </div>
                          <span className="tile-label" style={{ fontSize: 13, marginBottom: 2 }}>
                            {t(`home.tiles.${tile.key}.label`) || tile.label}
                          </span>
                          <span className="tile-hint" style={{ fontSize: 11 }}>
                            {t(`home.tiles.${tile.key}.hint`) || tile.hint}
                          </span>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
