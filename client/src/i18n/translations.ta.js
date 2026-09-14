export const ta = {
  common: {
    select: "தேர்வு செய்யவும்",
    machine: "மெஷின்",
    selectMachine: "மெஷினைத் தேர்வு செய்யவும்",
    part: "பார்ட்",
    selectPart: "பார்ட்டைத் தேர்வு செய்யவும்",
    reason: "காரணம்",
    selectReason: "காரணத்தைத் தேர்வு செய்யவும்",
    qty: "எண்ணிக்கை",
    weightKg: "எடை (kg)",
    saving: "சேமிக்கிறது…",
    save: "சேமி",
    cancel: "ரத்து செய்",
    yes: "ஆம்",
    no: "இல்லை",
    remarksOptional: "குறிப்பு (விருப்பம்)",
    findingNextBag: "அடுத்த பேக் தேடுகிறது…",
    bagLabel: "பேக் {{code}}",
    baseWeightMachine: "அடிப்படை எடை {{wt}} kg · மெஷின் {{machine}}",
    readingSaved: "ரீடிங் சேமிக்கப்பட்டது.",
    saveReading: "ரீடிங்கை சேமி",
    yesCloseBag: "ஆம், பேக்கை முடி"
  },
  layout: {
    attendance: "அட்டெண்டன்ஸ்",
    notifications: "அறிவிப்புகள்",
    markAllRead: "அனைத்தையும் படித்ததாகக் குறை",
    noNotifications: "இதுவரை அறிவிப்புகள் இல்லை.",
    changePin: "PIN மாற்று",
    signOut: "வெளியேறு",
    offlineMessage: "நீங்கள் ஆஃப்லைனில் உள்ளீர்கள். பதிவுகள் இணைக்கப்பட்டதும் ஒத்திசைக்கப்படும்.",
    syncingMessage: "பதிவுகள் ஒத்திசைக்கப்படுகின்றன…",
    syncedMessage: "அனைத்து பதிவுகளும் ஒத்திசைக்கப்பட்டன.",
    pending: "நிலுவை",
    syncNow: "இப்போது ஒத்திசை",
    menu: {
      profile: "எனது சுயவிவரம் & HR",
      staff: "பணியாளர்கள் & லாகின் மேலாண்மை",
      reports: "தினசரி அறிக்கைகள்",
      attendance: "வருகைப்பதிவு & ஜியோஃபென்ஸ்",
      language: "மொழியை மாற்று"
    },
    nav: {
      home: "முகப்பு",
      mouldSetup: "மோல்டு செட்டப்",
      entry: "பதிவு",
      log: "இன்றைய பதிவு"
    }
  },
  login: {
    title: "SHRP MES",
    subtitle: "உங்கள் யூசர்நேம் மற்றும் PIN மூலம் உள்நுழையவும்",
    username: "யூசர்நேம்",
    pin: "PIN",
    signingIn: "உள்நுழைகிறது…",
    signIn: "உள்நுழை"
  },
  home: {
    welcome: "வணக்கம், {{name}}",
    subtitle: "ஷிப்ட் டாஷ்போர்டு",
    sections: {
      production: {
        title: "உற்பத்திப் பிரிவு",
        tagline: "மோல்டு செட்டப் · மணிநேரப் பதிவு · பேக்கிங் · லாக்"
      },
      quality: {
        title: "தரக்கட்டுப்பாடு & ஃபினிஷிங்",
        tagline: "ட்ரிம்மிங் · இன்ஸ்பெக்ஷன் · பேக்கிங் · டிஸ்பாட்ச்"
      },
      materials: {
        title: "மூலப்பொருட்கள் & கலவை",
        tagline: "உள்வரும் சோதனை · ஸ்டாக் பதிவேடு · கலவை சூத்திரம்"
      },
      tooling: {
        title: "மெஷின்கள் & மோல்டுகள்",
        tagline: "மெஷின் நிலை · மோல்டு ஆயுள் · பார்ட் மாஸ்டர்"
      },
      staff_hr: {
        title: "பணியாளர்கள் & மனிதவளம் (HR)",
        tagline: "பணியாளர் மேலாண்மை · சுயவிவரம் · விடுப்பு விண்ணப்பம்"
      }
    },
    tiles: {
      rm_inward: { label: "உள்வரும் மூலப்பொருள்", hint: "வரவேற்பு & IATF 16949 ஆய்வு" },
      rm_stock: { label: "ஸ்டாக் பதிவேடு", hint: "மூலப்பொருள் இருப்பு & விநியோகம்" },
      recipes: { label: "கலவை சூத்திரம்", hint: "இரட்டை அடுக்கு மூலப்பொருள் கலவை" },
      profile: { label: "எனது சுயவிவரம் & HR", hint: "வங்கி விவரம், விடுப்பு & நேரம்" },
      attendance_menu: { label: "வருகைப்பதிவு", hint: "ஷிப்ட் இன் / அவுட்" },
      change_pin_menu: { label: "PIN மாற்றம்", hint: "ரகசிய குறியீடு மாற்றம்" },
      mould_setup: { label: "மோல்டு செட்டப்", hint: "மெஷினுக்கு பார்ட் ஒதுக்கு" },
      entry: { label: "புரொடக்ஷன் பதிவு", hint: "ஒவ்வொரு மணி நேர கவுன்ட் பதிவு" },
      bag_entry: { label: "பேக் பதிவு", hint: "பேட்சிற்கு பேக் பதிவு செய்" },
      trimming: { label: "ட்ரிம்மிங்", hint: "அடுத்த பேக், FIFO" },
      inspection: { label: "இன்ஸ்பெக்ஷன்", hint: "அடுத்த பேக், FIFO" },
      packing: { label: "பேக்கிங்", hint: "அடுத்த பேக், FIFO" },
      dispatch: { label: "டிஸ்பாட்ச்", hint: "வாடிக்கையாளர் டிஸ்பாட்ச், FIFO" },
      rework: { label: "ரீவொர்க்", hint: "மறுவேலை பணிகள்" },
      approvals: { label: "ஒப்புகை", hint: "நிலுவையிலுள்ள மோல்டு செட்டப்" },
      parts: { label: "பார்ட் மாஸ்டர்", hint: "பார்ட் மாஸ்டரைச் சேர் / திருத்து" },
      users: { label: "பணியாளர்கள் & HR", hint: "கணக்குகள் & பக்க அணுகல்" },
      reports: { label: "அறிக்கைகள்", hint: "தினசரி அறிக்கைகள் & வரைபடங்கள்" },
      machines: { label: "மெஷின்கள் & TPM", hint: "மெஷின் நிலை, MTBF & பழுதுகள்" },
      moulds: { label: "மோல்டுகள் & ஆயுள்", hint: "ஷாட் கவுண்ட், PM & வரலாறு" }
    }
  }
};
