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

export default function Home() {
  const { user } = useAuth();
  const { t } = useLanguage();

  const isSupervisorOrAdmin = user.role === 'admin' || user.role === 'supervisor';
  const isAdmin = user.role === 'admin';

  const isTileVisible = (tile) => {
    if (tile.adminOnly && !isAdmin) return false;
    if (tile.supervisorOnly && !isSupervisorOrAdmin) return false;
    if (isSupervisorOrAdmin) return true;
    // Always visible to operators
    if (['machines', 'moulds', 'rework', 'rm_inward', 'rm_stock'].includes(tile.key)) return true;
    // Check specific assigned pages
    return Array.isArray(user.pages) && user.pages.includes(tile.key);
  };

  return (
    <div className="screen max-w-7xl mx-auto px-2 py-4">
      {/* Welcome Banner */}
      <div className="mb-6 flex flex-wrap justify-between items-end bg-gradient-to-r from-slate-900 to-slate-800 text-white p-5 rounded-2xl shadow-md">
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-1">SHRP Manufacturing Execution System</div>
          <h1 className="text-2xl font-black">{t('home.welcome', { name: user.full_name.split(' ')[0] })}</h1>
          <p className="text-xs text-slate-300 mt-1">{t('home.subtitle')} · Plant & Shopfloor Operational Control</p>
        </div>
        <div className="text-right mt-2 sm:mt-0">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-white/10 backdrop-blur-sm border border-white/20 text-white uppercase">
            Role: {user.role}
          </span>
        </div>
      </div>

      {/* Sectioned ERP Grid */}
      <div className="space-y-6">
        {ERP_SECTIONS.map((section) => {
          const visibleTiles = section.tiles.filter(isTileVisible);
          if (visibleTiles.length === 0) return null;

          return (
            <div key={section.id} className="bg-white/70 backdrop-blur-xs p-4 rounded-xl border border-slate-200/80 shadow-xs">
              <div className="mb-3">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  {section.title}
                </h2>
                <p className="text-[11px] text-slate-500">{section.subtitle}</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {visibleTiles.map((tile) => (
                  <Link
                    key={tile.key}
                    to={tile.to}
                    className="tile transition-all hover:scale-[1.02] hover:shadow-md active:scale-98 p-3 rounded-xl border border-slate-200 bg-white flex flex-col justify-between"
                    style={{ minHeight: '92px' }}
                  >
                    <div className="flex items-center justify-between mb-1.5">
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
          );
        })}
      </div>
    </div>
  );
}
