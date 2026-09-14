export const en = {
  "common": {
    "select": "Select",
    "machine": "Machine",
    "selectMachine": "Select machine",
    "part": "Part",
    "selectPart": "Select part",
    "reason": "Reason",
    "selectReason": "Select reason",
    "qty": "Qty",
    "weightKg": "Weight (kg)",
    "saving": "Saving…",
    "save": "Save",
    "cancel": "Cancel",
    "yes": "Yes",
    "no": "No",
    "remarksOptional": "Remarks (optional)",
    "findingNextBag": "Finding next bag…",
    "bagLabel": "Bag {{code}}",
    "baseWeightMachine": "Base weight {{wt}} kg · Machine {{machine}}",
    "readingSaved": "Reading saved.",
    "saveReading": "Save reading",
    "yesCloseBag": "Yes, close bag"
  },
  "layout": {
    "attendance": "Attendance",
    "notifications": "Notifications",
    "markAllRead": "Mark all read",
    "noNotifications": "No notifications yet.",
    "changePin": "Change PIN",
    "signOut": "Sign out",
    "offlineMessage": "You are offline. Entries will be saved and synced when connected.",
    "syncingMessage": "Syncing offline entries…",
    "syncedMessage": "All offline entries synced successfully.",
    "pending": "pending",
    "syncNow": "Sync now",
    "nav": {
      "home": "Home",
      "mouldSetup": "Mould Setup",
      "entry": "Entry",
      "log": "Today's Log"
    }
  },
  "login": {
    "title": "SHRP Shop Floor",
    "subtitle": "Sign in with your username and PIN",
    "username": "Username",
    "pin": "PIN",
    "signingIn": "Signing in…",
    "signIn": "Sign in"
  },
  "home": {
    "welcome": "Welcome, {{name}}",
    "subtitle": "Shift dashboard",
    "tiles": {
      "mould_setup": {
        "label": "Mould Setup",
        "hint": "Assign part to machine"
      },
      "entry": {
        "label": "Production Entry",
        "hint": "Log hourly count"
      },
      "bag_entry": {
        "label": "Bag Entry",
        "hint": "Log a bag against a batch"
      },
      "trimming": {
        "label": "Trimming",
        "hint": "Next bag, FIFO"
      },
      "inspection": {
        "label": "Inspection",
        "hint": "Next bag, FIFO"
      },
      "packing": {
        "label": "Packing",
        "hint": "Next bag, FIFO"
      },
      "dispatch": {
        "label": "Dispatch",
        "hint": "Customer dispatch, FIFO"
      },
      "approvals": {
        "label": "Approvals",
        "hint": "Pending mould setups"
      },
      "parts": {
        "label": "Parts",
        "hint": "Add / edit part master"
      },
      "users": {
        "label": "Users",
        "hint": "Accounts & page access"
      },
      "log": {
        "label": "Today's Log",
        "hint": "All entries today"
      }
    }
  },
  "mouldSetup": {
    "title": "Mould Setup",
    "subtitle": "Assign a part to a machine. Requires supervisor approval before Production Entry can use it.",
    "currentlyRunning": "Currently running",
    "noApprovedPart": "No approved part assigned yet",
    "newPart": "New part",
    "loadStarted": "Mould loading started",
    "notes": "Notes (optional)",
    "submitForApproval": "Submit for approval",
    "submitting": "Submitting…",
    "submittedSuccess": "Submitted for supervisor approval.",
    "runningNow": "Running now",
    "approved": "Approved",
    "loadingStartedLabel": "Loading started: {{time}}",
    "firstOkPart": "1st OK part: {{time}}",
    "correctTime": "Correct time",
    "correctedLabel": "Corrected 1st OK part time",
    "firstOkPartTimeHint": "1st OK part time (if not marked right now, set the real time it happened)",
    "saving": "Saving…",
    "saveCorrectedTime": "Save corrected time",
    "markFirstOk": "Mark 1st OK part taken",
    "cancel": "Cancel"
  },
  "entry": {
    "title": "Production Entry",
    "shiftHour": "Shift {{shift}} · Hour {{hour}}",
    "assignedPart": "Assigned part",
    "noneAssigned": "None — submit a Mould Setup request first",
    "checkingStatus": "Checking machine status…",
    "checkingCheckSheet": "Checking today's check sheet…",
    "completeCheckSheet": "Complete today's check sheet for this machine before starting.",
    "checkSheetLabel": "Check sheet",
    "remarksNgPlaceholder": "Remarks (required for NG)",
    "submitCheckSheet": "Submit check sheet",
    "submitting": "Submitting…",
    "answerAllItems": "Answer every check item before submitting.",
    "remarksRequiredForNg": "Add remarks for any item marked NG.",
    "checkSheetCompletedBy": "Completed by {{name}} at {{time}}",
    "startCountLabel": "Start count (confirm counter reading)",
    "starting": "Starting…",
    "startMachine": "Start Machine",
    "machineStartedAt": "Machine started at {{time}}.",
    "runningSince": "Running since",
    "startedBy": "{{time}} · started by {{name}}",
    "lockedMessage": "This machine is running under {{name}}. You can't log entries or switch it off from your login — pick a different machine, or ask {{name}} (or a supervisor) to close it out first.",
    "efficiencyLabel": "Efficiency: {{pct}}%",
    "remarksRequired": "Remarks (required)",
    "saveWithRemarks": "Save with remarks",
    "saving": "Saving…",
    "machineCountNow": "Machine count now",
    "lastCount": "Last count: {{count}}",
    "lastCountAt": " at {{time}}",
    "rejects": "Rejects",
    "reasonPlaceholder": "Reason",
    "qtyPlaceholder": "Qty",
    "addRejectReason": "+ Add reject reason",
    "downtime": "Downtime",
    "minutesPlaceholder": "Minutes",
    "addDowntimeReason": "+ Add downtime reason",
    "remarksOptional": "Remarks (optional)",
    "saveEntry": "Save entry",
    "hourLogged": "Hour {{hour}} logged.",
    "efficiencySuffix": " · Efficiency {{pct}}%",
    "lastEntry": "Last entry — Hour {{hour}}",
    "lastEntryDetail": "Good {{good}} · Reject {{reject}} · Downtime {{downtime}}min",
    "offMachine": "Off Machine",
    "cancel": "Cancel",
    "offReason": "Reason",
    "selectReasonOption": "Select reason",
    "offReasons": {
      "mould_change": "Mould Change",
      "shift_completed": "Shift Completed",
      "breakdown": "Breakdown",
      "operator_change": "Change Operator",
      "other": "Other"
    },
    "finalCount": "Final count",
    "confirmOffMachine": "Confirm Off Machine",
    "machineSwitchedOff": "Machine switched off ({{reason}}).",
    "selectOffReasonError": "Select a reason for switching the machine off."
  },
  "bagEntry": {
    "title": "Bag Entry",
    "subtitle": "Log a bag of material against a batch",
    "printLabel": "Print label",
    "assignedPart": "Assigned part",
    "noneAssigned": "None assigned",
    "productionDate": "Production date",
    "shift": "Shift",
    "batchNo": "Batch no.",
    "bagType": "Bag type",
    "bagTypePart": "Part",
    "bagTypeRunner": "Runner (sprue waste)",
    "weighedWithRunner": "Weighed with runner (shot weight)",
    "usingShotWeight": "Using shot weight {{wt}} g × {{cavities}} cavities",
    "usingPartWeight": "Using part weight {{wt}} g (runner weighed separately)",
    "qtyPcs": "Qty (pcs)",
    "saveBag": "Save bag",
    "saving": "Saving…",
    "createdBag": "Created bag {{code}}",
    "bagsOnBatch": "Bags on batch {{batch}}",
    "colBag": "Bag",
    "colType": "Type",
    "colWt": "Wt",
    "colQty": "Qty",
    "colStatus": "Status",
    "colLabel": "Label",
    "noApprovedPartError": "No approved part assigned to this machine.",
    "batchNotReadyError": "Batch details not ready yet."
  },
  "trimming": {
    "title": "Trimming",
    "subtitle": "Oldest bag ready for trimming is picked automatically",
    "remainingWeight": "Remaining weight (kg)",
    "saving": "Saving…",
    "bagMarkedTrimmed": "Bag {{code}} marked TRIMMED."
  },
  "inspection": {
    "title": "Inspection",
    "subtitle": "Oldest bag ready for inspection is picked automatically",
    "remainingWt": "Remaining wt (kg)",
    "rejectWt": "Reject wt (kg)",
    "rejectReason": "Reject reason",
    "saving": "Saving…",
    "bagMarkedInspected": "Bag {{code}} marked INSPECTED."
  },
  "packing": {
    "title": "Packing",
    "subtitle": "Oldest bag ready for packing is picked automatically",
    "bagReadout": "Base weight {{wt}} kg · Qty {{qty}} · Machine {{machine}}",
    "packedQty": "Packed qty",
    "packedWt": "Packed wt (kg)",
    "saving": "Saving…",
    "bagMarkedPacked": "Bag {{code}} marked PACKED."
  },
  "dispatch": {
    "title": "Dispatch",
    "subtitle": "Verify FIFO and dispatch packed bags to customers",
    "dispatchedQty": "Dispatched Qty (Nos)",
    "dispatchedWt": "Dispatched Wt (Kg)",
    "saving": "Saving…",
    "bagMarkedDispatched": "Bag {{code}} marked DISPATCHED."
  },
  "attendance": {
    "title": "Attendance",
    "subtitle": "Check in and out using your phone's location.",
    "loadingToday": "Loading today's status…",
    "today": "Today",
    "checkedInAt": "Checked in at {{time}}",
    "checkedInSuccess": "Checked in at {{time}}.",
    "checkedOutAt": "Checked out at {{time}}.",
    "notCheckedIn": "Not checked in yet",
    "checkedOutAtSuffix": " · Checked out at {{time}}",
    "gettingLocation": "Getting location…",
    "checkIn": "Check In",
    "checkOut": "Check Out",
    "allDone": "You're all done for today.",
    "teamRoster": "Team roster",
    "date": "Date",
    "colName": "Name",
    "colCheckIn": "Check in",
    "colCheckOut": "Check out",
    "colWithinSite": "Within site?",
    "noRecords": "No attendance recorded for this date.",
    "factoryLocation": "Factory location (geofence)",
    "currentCenter": "Current center: {{lat}}, {{lng}} · radius {{radius}}m",
    "notSetYet": "Not set yet - operators can check in from anywhere until this is configured.",
    "newCenterReady": "New center ready: {{lat}}, {{lng}}",
    "useMyLocation": "Use my current location",
    "radius": "Radius (meters)",
    "saveFactoryLocation": "Save factory location",
    "saving": "Saving…",
    "factoryLocationSaved": "Factory location saved.",
    "setFactoryLocationError": "Set the factory location first - tap \"Use my current location\" while standing at the site.",
    "locationUnavailable": "Location is not available on this device/browser.",
    "locationError": "Could not get your location. Enable location permission and try again."
  }
};
