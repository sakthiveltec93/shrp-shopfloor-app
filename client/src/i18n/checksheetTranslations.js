// Multilingual dictionary for Daily Shift Checksheet items and specifications.
// Supports English (en), Tamil (ta), and English-script Odia (or) as requested.

export const CHECKSHEET_TRANSLATIONS = {
  machine_cleaning: {
    icon: 'ti-wash',
    en: {
      name: 'Machine Cleaning',
      spec: 'No dirt, grease or foreign particles on machine body & tie bars',
    },
    ta: {
      name: 'இயந்திர சுத்தம் (Machine Cleaning)',
      spec: 'இயந்திரத்தின் மீது எந்தவித அழுக்கு, தூசி அல்லது பிளாஸ்டிக் துண்டுகள் இருக்கக்கூடாது',
    },
    or: {
      name: 'Machine Safa Kariba (Machine Cleaning)',
      spec: 'Machine upare kichhi bhi dhuli, tela ba moila rahiba nahi',
    },
  },
  gate_safety: {
    icon: 'ti-shield',
    en: {
      name: 'Gate Safety Interlock',
      spec: 'Mould must never close while operator safety door is open',
    },
    ta: {
      name: 'பாதுகாப்பு கதவு லாக் (Gate Safety)',
      spec: 'பாதுகாப்பு கதவு திறந்திருக்கும் போது மோல்டு மூடக்கூடாது',
    },
    or: {
      name: 'Safety Gate Check (Gate Safety)',
      spec: 'Gate khola thiba bele mould band heba nahi',
    },
  },
  oil_level: {
    icon: 'ti-droplet',
    en: {
      name: 'Hydraulic Oil Level',
      spec: 'Oil level must be between MIN and MAX sight glass marks',
    },
    ta: {
      name: 'ஹைட்ராலிக் ஆயில் அளவு (Oil Level)',
      spec: 'ஆயில் அளவு குறைந்தபட்ச (MIN) அளவுக்கு கீழே போகக்கூடாது',
    },
    or: {
      name: 'Hydraulic Oil Level Check',
      spec: 'Oil level MIN mark tala ku rahiba nahi',
    },
  },
  hyd_oil_temp: {
    icon: 'ti-thermometer',
    en: {
      name: 'Hyd-Oil Temp (Max 40°C)',
      spec: 'Oil temperature gauge must not exceed 40°C',
    },
    ta: {
      name: 'ஆயில் வெப்பநிலை (Hyd-Oil Temp Max 40°C)',
      spec: 'ஆயில் வெப்பநிலை 40°C-க்கு மேல் செல்லக்கூடாது',
    },
    or: {
      name: 'Oil Temperature Check (Max 40°C)',
      spec: 'Oil temperature 40°C ru adhika heba nahi',
    },
  },
  oil_leakage: {
    icon: 'ti-droplet-off',
    en: {
      name: 'Oil Leakage Check',
      spec: 'No hydraulic oil leakage from hoses, fittings or cylinders',
    },
    ta: {
      name: 'ஆயில் கசிவு சோதனை (Oil Leakage)',
      spec: 'ஹோஸ், வால்வு அல்லது சிலிண்டர்களில் ஆயில் கசிவு இருக்கக்கூடாது',
    },
    or: {
      name: 'Oil Leakage Check',
      spec: 'Hose, pipe ba valve ru kouthi bhi oil leak heba nahi',
    },
  },
  water_valve: {
    icon: 'ti-refresh',
    en: {
      name: 'Water Cooling Valve',
      spec: 'No water leakage, mould cooling inlet & outlet valves fully open',
    },
    ta: {
      name: 'கூலிங் வாட்டர் வால்வு (Water Valve)',
      spec: 'நீர் கசிவு இல்லை, மோல்டு கூலிங் வால்வு முழுமையாக திறந்திருக்க வேண்டும்',
    },
    or: {
      name: 'Cooling Water Valve Check',
      spec: 'Pani leak heba nahi, cooling valve pura khola rahiba',
    },
  },
  pump_noise: {
    icon: 'ti-volume',
    en: {
      name: 'Pump Sound & Vibration',
      spec: 'No abnormal screeching, cavitation or excessive pump vibration',
    },
    ta: {
      name: 'பம்ப் சத்தம் & அதிர்வு (Pump Noise)',
      spec: 'பம்ப்பில் அசாதாரண சத்தம் அல்லது அதிக அதிர்வு இருக்கக்கூடாது',
    },
    or: {
      name: 'Pump Aawaz & Vibration Check',
      spec: 'Pump ru kounasi kharap aawaz ba vibration asiba nahi',
    },
  },
  emergency_switch: {
    icon: 'ti-alert-octagon',
    en: {
      name: 'Emergency Stop Button',
      spec: 'Emergency switch must immediately cut power/stop machine when hit',
    },
    ta: {
      name: 'எமர்ஜென்சி சுவிட்ச் (Emergency Switch)',
      spec: 'சுவிட்சை அழுத்தும்போது மெஷின் உடனடியாக நிற்க வேண்டும்',
    },
    or: {
      name: 'Emergency Stop Switch Check',
      spec: 'Emergency button dabaile machine sangey sangey band heba',
    },
  },
  hopper_preheating: {
    icon: 'ti-flame',
    en: {
      name: 'Hopper Dryer & Preheating',
      spec: 'Hopper dryer heater, PID controller & blower must work at set temp',
    },
    ta: {
      name: 'ஹாப்பர் ப்ரீஹீட்டிங் (Hopper Preheating)',
      spec: 'ஹாப்பர் ஹீட்டர் மற்றும் ப்ளோவர் நிர்ணயிக்கப்பட்ட வெப்பநிலையில் வேலை செய்ய வேண்டும்',
    },
    or: {
      name: 'Hopper Heater & Dryer Check',
      spec: 'Hopper heater au blower set temperature re chaliba',
    },
  },
  unbearable_noise: {
    icon: 'ti-ear',
    en: {
      name: 'Abnormal / Unbearable Noise',
      spec: 'No abnormal grinding, knocking or bearing noise during operation',
    },
    ta: {
      name: 'அசாதாரண சத்தம் (Abnormal Noise)',
      spec: 'மெஷினில் கடுமையான உரசும் அல்லது மோதும் சத்தம் எதுவும் வரக்கூடாது',
    },
    or: {
      name: 'Machine Kharap Aawaz Check',
      spec: 'Machine chaliba bele kounasi asahaniya aawaz asiba nahi',
    },
  },
  poka_yoke: {
    icon: 'ti-shield-check',
    en: {
      name: 'Poka-Yoke & Sensor Validation',
      spec: 'Part drop sensor, core interlock & safety limit switches must function',
    },
    ta: {
      name: 'போகா-யோக் சோதனை (Poka-Yoke)',
      spec: 'பார்ட் சென்சார் மற்றும் பாதுகாப்பு சுவிட்சுகள் சரியாக இயங்க வேண்டும்',
    },
    or: {
      name: 'Poka-Yoke & Sensor Check',
      spec: 'Part drop sensor au safety interlock thik bhabare kaam kariba',
    },
  },
};

export function getLocalizedCheckItem(item, lang = 'en') {
  if (!item) return { name: '', spec: '', icon: '' };
  const rawName = (item.item_name || item.name || '').toLowerCase();

  let matchKey = null;
  if (rawName.includes('clean') || rawName.includes('wash') || rawName.includes('सफाई') || rawName.includes('சுத்தம்') || rawName.includes('safa')) {
    matchKey = 'machine_cleaning';
  } else if (rawName.includes('gate') || rawName.includes('गेट') || rawName.includes('கதவு')) {
    matchKey = 'gate_safety';
  } else if (rawName.includes('level') || rawName.includes('आयल लेवल') || rawName.includes('அளவு')) {
    matchKey = 'oil_level';
  } else if (rawName.includes('temp') || rawName.includes('टेम्प्रेचर') || rawName.includes('வெப்பநிலை')) {
    matchKey = 'hyd_oil_temp';
  } else if (rawName.includes('leak') || rawName.includes('लीकेज') || rawName.includes('கசிவு')) {
    matchKey = 'oil_leakage';
  } else if (rawName.includes('valve') || rawName.includes('वाल्व') || rawName.includes('வால்வு') || rawName.includes('water')) {
    matchKey = 'water_valve';
  } else if (rawName.includes('pump') || rawName.includes('पम्प') || rawName.includes('பம்ப்')) {
    matchKey = 'pump_noise';
  } else if (rawName.includes('emergency') || rawName.includes('एमर्जेन्सी') || rawName.includes('எமர்ஜென்சி') || rawName.includes('சுவிட்ச்')) {
    matchKey = 'emergency_switch';
  } else if (rawName.includes('hopper') || rawName.includes('हॉपर') || rawName.includes('ஹாப்பர்')) {
    matchKey = 'hopper_preheating';
  } else if (rawName.includes('noise') || rawName.includes('आवाज') || rawName.includes('சத்தம்') || rawName.includes('sound') || rawName.includes('unbearable')) {
    matchKey = 'unbearable_noise';
  } else if (rawName.includes('poka') || rawName.includes('पोका') || rawName.includes('போகா')) {
    matchKey = 'poka_yoke';
  }

  if (matchKey && CHECKSHEET_TRANSLATIONS[matchKey]) {
    const entry = CHECKSHEET_TRANSLATIONS[matchKey];
    const target = entry[lang] || entry.en;
    return {
      name: target.name || item.item_name,
      spec: target.spec || item.specification || '',
      icon: item.icon || entry.icon || '',
    };
  }

  // Fallback for custom user-created checksheet items
  return {
    name: item.item_name || item.name || '',
    spec: item.specification || item.local_label || '',
    icon: item.icon || 'ti-check',
  };
}