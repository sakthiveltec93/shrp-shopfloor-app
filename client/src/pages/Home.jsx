import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useLanguage } from '../i18n/LanguageContext';

const ERP_SECTIONS = [
  {
    id: 'production',
    title: '🏭 Shopfloor Production',
    subtitle: 'Mould setup, hourly entries, batch bagging & shift logs',
    tiles: [
      { key: 'mould_setup', to: '/mould-setup', icon: '⚙' },
      { key: 'entry', to: '/entry', icon: '▤' },
      { key: 'bag_entry', to: '/bag-entry', icon: '◧' },
      { key: 'log', to: '/log', icon: '≣' },
      { key: 'approvals', to: '/approvals', icon: '✓', supervisorOnly: true },
    ],
  },
  {
    id: 'quality',
    title: '⚡ Quality & Finishing Stages',
    subtitle: 'Trimming, final inspection, packing, dispatch & rework pool',
    tiles: [
      { key: 'trimming', to: '/trimming', icon: '✂' },
      { key: 'inspection', to: '/inspection', icon: '◎' },
      { key: 'packing', to: '/packing', icon: '▧' },
      { key: 'dispatch', to: '/dispatch', icon: '🚚' },
      { key: 'rework', to: '/rework', icon: '🛠️' },
    ],
  },
  {
    id: 'materials',
    title: '📦 Materials & Inventory',
    subtitle: 'Raw material inward QA, stock registers, dual-layer recipes & WIP pool',
    tiles: [
      { key: 'rm_inward', to: '/rm-inward', icon: '📥' },
      { key: 'rm_stock', to: '/rm-stock', icon: '📦' },
      { key: 'recipes', to: '/recipes', icon: '🧪' },
    ],
  },
  {
    id: 'tooling_mgmt',
    title: '⚙️ Tooling, TPM & Management',
    subtitle: 'Fleet status, tool life tracking, masters, users & analytics',
    tiles: [
      { key: 'machines', to: '/machines', icon: '🖥️' },
      { key: 'moulds', to: '/moulds', icon: '⚙️' },
      { key: 'parts', to: '/parts', icon: '📋', supervisorOnly: true },
      { key: 'reports', to: '/reports', icon: '📊', supervisorOnly: true },
      { key: 'users', to: '/users', icon: '👤', adminOnly: true },
    ],
  },
];

const STORAGE_KEY = 'shrp_erp_expanded_sections';

export default function Home() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [search, setSearch] = useState('');

  // Persist expanded/collapsed state in localStorage
  const [expanded, setExpanded] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch { /* ignore */ }
    // Default: all sections expanded initially
    return {
      production: true,
      quality: true,
      materials: true,
      tooling_mgmt: true,
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
    const all = { production: true, quality: true, materials: true, tooling_mgmt: true };
    setExpanded(all);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(all)); } catch { /* ignore */ }
  };

  const collapseAll = () => {
    const all = { production: false, quality: false, materials: false, tooling_mgmt: false };
    setExpanded(all);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(all)); } catch { /* ignore */ }
  };

  const isSupervisorOrAdmin = user.role === 'admin' || user.role === 'supervisor';
  const isAdmin = user.role === 'admin';

  const isTileVisible = (tile) => {
    if (tile.adminOnly && !isAdmin) return false;
    if (tile.supervisorOnly && !isSupervisorOrAdmin) return false;
    if (isSupervisorOrAdmin) return true;
    if (['machines', 'moulds', 'rework', 'rm_inward', 'rm_stock'].includes(tile.key)) return true;
    return Array.isArray(user.pages) && user.pages.includes(tile.key);
  };

  const matchesSearch = (tile) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const label = t(`home.tiles.${tile.key}.label`).toLowerCase();
    const hint = t(`home.tiles.${tile.key}.hint`).toLowerCase();
    return label.includes(q) || hint.includes(q) || tile.key.includes(q);
  };

  return (
    <div className="screen max-w-7xl mx-auto px-2 py-4">
      {/* Welcome & ERP Header */}
      <div className="mb-4 flex flex-wrap justify-between items-center bg-gradient-to-r from-slate-900 to-slate-800 text-white p-5 rounded-2xl shadow-md">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-widest text-emerald-400 mb-1">
            SHRP Manufacturing Execution System · ERP
          </div>
          <h1 className="text-2xl font-black">{t('home.welcome', { name: user.full_name.split(' ')[0] })}</h1>
          <p className="text-xs text-slate-300 mt-0.5">{t('home.subtitle')} · Plant & Operations Control</p>
        </div>
        <div className="flex items-center gap-2 mt-3 sm:mt-0">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-white/10 backdrop-blur-sm border border-white/20 text-white uppercase">
            Role: {user.role}
          </span>
        </div>
      </div>

      {/* Action / Search Bar */}
      <div className="flex flex-wrap gap-2 justify-between items-center mb-4 bg-white/80 p-2.5 rounded-xl border border-slate-200/80 shadow-xs">
        <div className="relative flex-1 min-w-[220px]">
          <input
            type="text"
            placeholder="🔍 Search modules, operations, stages..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-3 pr-8 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-600 transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1.5 text-slate-400 hover:text-slate-600 text-xs font-bold"
            >
              ×
            </button>
          )}
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={expandAll}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            title="Expand all tree sections"
          >
            ▼ Expand All
          </button>
          <button
            onClick={collapseAll}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            title="Collapse all tree sections"
          >
            ▶ Collapse All
          </button>
        </div>
      </div>

      {/* Drop Tree Expandable Sections */}
      <div className="space-y-3">
        {ERP_SECTIONS.map((section) => {
          const visibleTiles = section.tiles.filter((t) => isTileVisible(t) && matchesSearch(t));
          if (visibleTiles.length === 0 && search.trim()) return null;
          if (section.tiles.filter(isTileVisible).length === 0) return null;

          // If searching, auto-expand
          const isOpen = search.trim() ? true : !!expanded[section.id];

          return (
            <div
              key={section.id}
              className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden transition-all"
            >
              {/* Collapsible Drop-Tree Header Bar */}
              <button
                type="button"
                onClick={() => toggleSection(section.id)}
                className="w-full text-left p-3.5 flex items-center justify-between hover:bg-slate-50/80 transition-colors select-none focus:outline-none"
              >
                <div className="flex items-center gap-2.5">
                  {/* Expand/Collapse Line / 3-Dots indicator */}
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-transform duration-200 ${
                      isOpen
                        ? 'bg-slate-800 text-white shadow-xs rotate-90'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                    title={isOpen ? 'Click to collapse' : 'Click to expand'}
                  >
                    ⋮
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      {section.title}
                    </h2>
                    <p className="text-[11px] text-slate-500 line-clamp-1">{section.subtitle}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                    {visibleTiles.length} {visibleTiles.length === 1 ? 'module' : 'modules'}
                  </span>
                  <span className={`text-slate-400 text-xs transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </div>
              </button>

              {/* Expandable Tile Grid (Drop Tree Body) */}
              {isOpen && (
                <div className="p-3.5 pt-0 border-t border-slate-100">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 mt-3">
                    {visibleTiles.map((tile) => (
                      <Link
                        key={tile.key}
                        to={tile.to}
                        className="tile transition-all hover:scale-[1.02] hover:shadow-md active:scale-98 p-3 rounded-xl border border-slate-200/90 bg-white hover:border-slate-300 flex flex-col justify-between"
                        style={{ minHeight: '90px' }}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xl">{tile.icon}</span>
                          <span className="text-slate-300 text-xs">→</span>
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-800 leading-tight mb-0.5">
                            {t(`home.tiles.${tile.key}.label`)}
                          </div>
                          <div className="text-[10px] text-slate-400 line-clamp-1 leading-snug">
                            {t(`home.tiles.${tile.key}.hint`)}
                          </div>
                        </div>
                      </Link>
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
