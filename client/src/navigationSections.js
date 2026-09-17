export const ERP_SECTIONS = [
  {
    id: 'production',
    sectionKey: 'production',
    title: 'Shopfloor Production',
    tagline: 'Mould Setup · Hourly Entries · Bagging · Shift Log',
    icon: '🏭',
    accentColor: '#f59e0b', // amber
    badgeBg: 'rgba(245, 158, 11, 0.15)',
    tiles: [
      { key: 'mould_setup', to: '/mould-setup', icon: '⚙', label: 'Mould Setup', hint: 'Assign part & mould to machine', supervisorOnly: true },
      { key: 'entry', to: '/entry', icon: '📝', label: 'Hourly Production Entry', hint: 'Log hourly count, scrap & machine runs' },
      { key: 'bag_entry', to: '/bag-entry', icon: '◧', label: 'Bag Entry', hint: 'Log bag weight against active batch' },
      { key: 'log', to: '/log', icon: '📋', label: 'Shift Log', hint: 'Today\'s machine entries & production log' },
      { key: 'approvals', to: '/approvals', icon: '✓', label: 'Approvals & Gates', hint: 'Pending mould setups & deletions', supervisorOnly: true },
    ],
  },
  {
    id: 'quality',
    sectionKey: 'quality',
    title: 'Quality & Finishing Stages',
    tagline: 'Trimming · Inspection · Packing · Dispatch · Rework',
    icon: '⚡',
    accentColor: '#10b981', // emerald
    badgeBg: 'rgba(16, 185, 129, 0.15)',
    tiles: [
      { key: 'trimming', to: '/trimming', icon: '✂', label: 'Trimming', hint: 'Next bag in queue, FIFO' },
      { key: 'inspection', to: '/inspection', icon: '◎', label: 'Inspection', hint: 'Quality checks & visual inspection' },
      { key: 'rework', to: '/rework', icon: '🛠️', label: 'Rework Pool', hint: 'Rework task list & recovery' },
      { key: 'packing', to: '/packing', icon: '▧', label: 'Packing', hint: 'Standard box packing & label verification' },
      { key: 'dispatch', to: '/dispatch', icon: '🚚', label: 'Dispatch', hint: 'Customer finished goods dispatch, FIFO' },
    ],
  },
  {
    id: 'planning',
    sectionKey: 'planning',
    title: 'Planning & Schedule',
    tagline: 'MPS · Daily Schedules · Milestones · Plan vs Actual',
    icon: '📊',
    accentColor: '#38bdf8', // sky blue
    badgeBg: 'rgba(56, 189, 248, 0.15)',
    tiles: [
      { key: 'planning_mps', to: '/planning', icon: '📊', label: 'Master Production Schedule (MPS)', hint: 'Monthly customer demand & firm targets', supervisorOnly: true },
      { key: 'planning_variance', to: '/planning', icon: '📈', label: 'Plan vs Actual', hint: 'Monthly dispatch & target variance', supervisorOnly: true },
      { key: 'planning_schedules', to: '/planning', icon: '📅', label: 'Daily Schedules', hint: 'Shift machine allocations & daily targets', supervisorOnly: true },
      { key: 'planning_milestones', to: '/planning', icon: '🎯', label: 'Delivery Milestones', hint: 'Customer delivery milestones & tracking', supervisorOnly: true },
    ],
  },
  {
    id: 'materials',
    sectionKey: 'materials',
    title: 'Materials & Compounding',
    tagline: 'RM Inward QA · Stock Register · Blend Recipes',
    icon: '📦',
    accentColor: '#3b82f6', // blue
    badgeBg: 'rgba(59, 130, 246, 0.15)',
    tiles: [
      { key: 'rm_inward', to: '/rm-inward', icon: '📥', label: 'RM Inward QA', hint: 'Receipt & IATF 16949 test report inspection', supervisorOnly: true },
      { key: 'rm_stock', to: '/rm-stock', icon: '📦', label: 'RM Stock Register', hint: 'Virgin, regrind & WIP pool tracking', supervisorOnly: true },
      { key: 'recipes', to: '/recipes', icon: '🧪', label: 'Blend Recipes', hint: 'Part compounding & allowable regrind limits', supervisorOnly: true },
    ],
  },
  {
    id: 'tooling_mgmt',
    sectionKey: 'tooling',
    title: 'Tooling, TPM & Management',
    tagline: 'Fleet Status · Tool Life · Reports · Part Master',
    icon: '⚙️',
    accentColor: '#a855f7', // purple
    badgeBg: 'rgba(168, 85, 247, 0.15)',
    tiles: [
      { key: 'machines', to: '/machines', icon: '🖥️', label: 'Machines & TPM', hint: 'Machine fleet status, MTBF & breakdowns', supervisorOnly: true },
      { key: 'moulds', to: '/moulds', icon: '⚙️', label: 'Moulds & Tool Life', hint: 'Cumulative shots, PM overdue & storage', supervisorOnly: true },
      { key: 'masters_hub', to: '/masters', icon: '🗂️', label: 'Item & Masters Hub', hint: 'Part Master, RM, Gauges, Customers, Tooling', supervisorOnly: true },
    ],
  },
  {
    id: 'commercial',
    sectionKey: 'commercial',
    title: 'Commercial & Orders',
    tagline: 'Purchase · Quotations · Invoicing · Customer Dispatch',
    icon: '💼',
    accentColor: '#14b8a6', // teal
    badgeBg: 'rgba(20, 184, 166, 0.15)',
    tiles: [
      { key: 'comm_dispatch', to: '/dispatch', icon: '🚚', label: 'Customer Dispatch', hint: 'Finished goods dispatch & DC tracking' },
      { key: 'comm_purchase', to: null, icon: '🛒', label: 'Purchase Orders', hint: 'RM & Consumables PO (Upcoming ERP)', isPlaceholder: true, adminOnly: true },
      { key: 'comm_quote', to: null, icon: '📑', label: 'Quotations & Costing', hint: 'Customer RFQ & Part Costing (Upcoming ERP)', isPlaceholder: true, adminOnly: true },
      { key: 'comm_invoicing', to: null, icon: '🧾', label: 'Sales Invoicing', hint: 'Tax invoice & e-way bill (Upcoming ERP)', isPlaceholder: true, adminOnly: true },
    ],
  },
  {
    id: 'reports',
    sectionKey: 'reports',
    title: 'Reports & Analytics',
    tagline: 'Daily Production Reports · Shift Summary · OEE',
    icon: '📑',
    accentColor: '#f97316', // orange
    badgeBg: 'rgba(249, 115, 22, 0.15)',
    tiles: [
      { key: 'reports_daily', to: '/reports', icon: '📊', label: 'Daily Reports', hint: 'Shift summary, hourly rates & rejection graphs', supervisorOnly: true },
      { key: 'reports_analytics', to: '/reports', icon: '📈', label: 'Production Analytics', hint: 'OEE, efficiency & monthly exports', supervisorOnly: true },
    ],
  },
  {
    id: 'staff_hr',
    sectionKey: 'staff_hr',
    title: 'Staff, HR & Organization',
    tagline: 'User Accounts · Staff Attendance · HR Profile · Access',
    icon: '👥',
    accentColor: '#ec4899', // pink
    badgeBg: 'rgba(236, 72, 153, 0.15)',
    tiles: [
      { key: 'users', to: '/users', icon: '👥', label: 'Staff & Logins', hint: 'User accounts, roles & page access permissions', adminOnly: true },
      { key: 'profile', to: '/profile', icon: '👤', label: 'My Profile & HR', hint: 'Bank details, leave request & personal statistics' },
      { key: 'attendance_menu', to: '/attendance', icon: '🕒', label: 'Attendance & Geofence', hint: 'Shift check-in / check-out with GPS & selfie' },
      { key: 'change_pin_menu', to: '/change-pin', icon: '🔑', label: 'Change PIN', hint: 'Update 4-digit security login PIN' },
    ],
  },
];
