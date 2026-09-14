export const en = {
  common: {
    select: "Select",
    machine: "Machine",
    selectMachine: "Select machine",
    part: "Part",
    selectPart: "Select part",
    reason: "Reason",
    selectReason: "Select reason",
    qty: "Qty",
    weightKg: "Weight (kg)",
    saving: "Saving…",
    save: "Save",
    cancel: "Cancel",
    yes: "Yes",
    no: "No",
    remarksOptional: "Remarks (optional)",
    findingNextBag: "Finding next bag…",
    bagLabel: "Bag {{code}}",
    baseWeightMachine: "Base wt {{wt}} kg · Machine {{machine}}",
    readingSaved: "Reading saved.",
    saveReading: "Save Reading",
    yesCloseBag: "Yes, Close Bag"
  },
  layout: {
    attendance: "Attendance",
    notifications: "Notifications",
    markAllRead: "Mark all read",
    noNotifications: "No notifications yet.",
    changePin: "Change PIN",
    signOut: "Sign Out",
    offlineMessage: "You are offline. Entries will sync when reconnected.",
    syncingMessage: "Syncing entries…",
    syncedMessage: "All entries synced.",
    pending: "pending",
    syncNow: "Sync Now",
    menu: {
      profile: "My Profile & HR Portal",
      staff: "Staff & Logins Management",
      reports: "Daily Reports & Analytics",
      attendance: "Attendance & Geofence",
      language: "Language"
    },
    nav: {
      home: "Home",
      mouldSetup: "Mould Setup",
      entry: "Entry",
      log: "Shift Log"
    }
  },
  login: {
    title: "SHRP MES",
    subtitle: "Sign in with your username and PIN",
    username: "Username",
    pin: "PIN",
    signingIn: "Signing in…",
    signIn: "Sign In"
  },
  home: {
    welcome: "Welcome, {{name}}",
    subtitle: "Shift Dashboard",
    sections: {
      production: {
        title: "Shopfloor Production",
        tagline: "Mould Setup · Hourly Entries · Bagging · Shift Log"
      },
      quality: {
        title: "Quality & Finishing Stages",
        tagline: "Trimming · Inspection · Packing · Dispatch · Rework"
      },
      materials: {
        title: "Materials & Compounding",
        tagline: "RM Inward QA · Stock Register · Blend Recipes"
      },
      tooling: {
        title: "Tooling, TPM & Management",
        tagline: "Fleet Status · Tool Life · Reports · Part Master"
      },
      staff_hr: {
        title: "Staff, HR & Organization",
        tagline: "User Accounts · Staff Attendance · HR Profile · Access"
      }
    },
    tiles: {
      rm_inward: { label: "RM Inward & QA", hint: "SHRP/QA/R/01 Rev.02 receipt & inspection" },
      rm_stock: { label: "RM Stock Register", hint: "Virgin, regrind & WIP pool" },
      recipes: { label: "Compounding Recipes", hint: "Dual-layer blend ratios" },
      profile: { label: "My Profile & HR", hint: "Bank details, leave request & stats" },
      attendance_menu: { label: "Attendance", hint: "Shift check-in / check-out" },
      change_pin_menu: { label: "Change PIN", hint: "Security PIN update" },
      mould_setup: { label: "Mould Setup", hint: "Assign part to machine" },
      entry: { label: "Hourly Production Entry", hint: "Log hourly count & scrap" },
      bag_entry: { label: "Bag Entry", hint: "Log bag against batch" },
      trimming: { label: "Trimming", hint: "Next bag in queue, FIFO" },
      inspection: { label: "Inspection", hint: "Next bag in queue, FIFO" },
      packing: { label: "Packing", hint: "Next bag in queue, FIFO" },
      dispatch: { label: "Dispatch", hint: "Customer dispatch, FIFO" },
      rework: { label: "Rework", hint: "Rework task list" },
      approvals: { label: "Approvals", hint: "Pending mould setups" },
      parts: { label: "Part Master", hint: "Add / edit part details" },
      users: { label: "Staff & Logins", hint: "Accounts & page access" },
      reports: { label: "Daily Reports", hint: "Shift summary & graphs" },
      machines: { label: "Machines & TPM", hint: "Machine status, MTBF & breakdowns" },
      moulds: { label: "Moulds & Tool Life", hint: "Shot count, PM & history" }
    }
  }
};
