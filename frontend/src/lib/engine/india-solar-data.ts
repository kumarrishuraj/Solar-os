// =============================================================================
// SolarOS — India solar planning constants
//
// Every constant used by the engines lives here with a source note. Values are
// planning-grade approximations for pre-sales sizing, not bankable yield
// figures: detailed design should use site-specific irradiance (PVGIS / NREL
// NSRDB / NIWE SRRA) and the DISCOM's actual tariff order.
//
// Backend parity: DEFAULT_PEAK_SUN_HOURS, DEFAULT_PERFORMANCE_RATIO and
// FALLBACK_MODULE_AREA_SQM mirror backend/app/ai/solar_recommendation.py.
// See docs/engineering-rules.md for the full rule book.
// =============================================================================

// --- Irradiance -----------------------------------------------------------------

/**
 * Mirrors backend `DEFAULT_PEAK_SUN_HOURS_PER_DAY` — used when the state cannot
 * be resolved.
 */
export const DEFAULT_PEAK_SUN_HOURS = 4.5;

/**
 * Annual-average peak sun hours (kWh/m²/day of global horizontal irradiance)
 * by state / union territory.
 *
 * Source: rounded state-level averages consistent with the MNRE / NIWE Solar
 * Radiation Resource Assessment (SRRA) network and NREL NSRDB India data
 * (typical 4.0–6.0 kWh/m²/day across India). Approximate; use site data for
 * detailed design.
 */
export const PEAK_SUN_HOURS_BY_STATE: Readonly<Record<string, number>> = {
  // States
  "Andhra Pradesh": 5.3,
  "Arunachal Pradesh": 4.0,
  Assam: 4.2,
  Bihar: 4.7,
  Chhattisgarh: 5.1,
  Goa: 5.2,
  Gujarat: 5.5,
  Haryana: 5.0,
  "Himachal Pradesh": 4.4,
  Jharkhand: 4.8,
  Karnataka: 5.3,
  Kerala: 4.6,
  "Madhya Pradesh": 5.2,
  Maharashtra: 5.2,
  Manipur: 4.3,
  Meghalaya: 4.1,
  Mizoram: 4.3,
  Nagaland: 4.2,
  Odisha: 4.8,
  Punjab: 4.9,
  Rajasthan: 5.6,
  Sikkim: 4.0,
  "Tamil Nadu": 5.2,
  Telangana: 5.3,
  Tripura: 4.4,
  "Uttar Pradesh": 4.9,
  Uttarakhand: 4.4,
  "West Bengal": 4.6,
  // Union territories
  "Andaman and Nicobar Islands": 4.6,
  Chandigarh: 4.9,
  "Dadra and Nagar Haveli and Daman and Diu": 5.4,
  Delhi: 5.0,
  "Jammu and Kashmir": 4.4,
  // High-altitude cold desert with some of the highest irradiance in India.
  Ladakh: 5.5,
  Lakshadweep: 5.0,
  Puducherry: 5.1,
};

/** Alternate spellings and official long names → canonical state name. */
const STATE_ALIASES: Readonly<Record<string, string>> = {
  orissa: "Odisha",
  pondicherry: "Puducherry",
  "nct of delhi": "Delhi",
  "national capital territory of delhi": "Delhi",
  "new delhi": "Delhi",
  "delhi ncr": "Delhi",
  "j&k": "Jammu and Kashmir",
  "j and k": "Jammu and Kashmir",
  "jammu & kashmir": "Jammu and Kashmir",
  "jammu kashmir": "Jammu and Kashmir",
  uttaranchal: "Uttarakhand",
  bengal: "West Bengal",
  tamilnadu: "Tamil Nadu",
  telengana: "Telangana",
  chattisgarh: "Chhattisgarh",
  chhatisgarh: "Chhattisgarh",
  "andaman & nicobar islands": "Andaman and Nicobar Islands",
  "andaman and nicobar": "Andaman and Nicobar Islands",
  "andaman & nicobar": "Andaman and Nicobar Islands",
  "a&n islands": "Andaman and Nicobar Islands",
  "dadra and nagar haveli": "Dadra and Nagar Haveli and Daman and Diu",
  "daman and diu": "Dadra and Nagar Haveli and Daman and Diu",
};

/** ISO 3166-2:IN / common vehicle-registration codes, matched only as a whole value. */
const STATE_CODES: Readonly<Record<string, string>> = {
  ap: "Andhra Pradesh",
  ar: "Arunachal Pradesh",
  as: "Assam",
  br: "Bihar",
  cg: "Chhattisgarh",
  ct: "Chhattisgarh",
  ga: "Goa",
  gj: "Gujarat",
  hr: "Haryana",
  hp: "Himachal Pradesh",
  jh: "Jharkhand",
  ka: "Karnataka",
  kl: "Kerala",
  mp: "Madhya Pradesh",
  mh: "Maharashtra",
  mn: "Manipur",
  ml: "Meghalaya",
  mz: "Mizoram",
  nl: "Nagaland",
  od: "Odisha",
  or: "Odisha",
  pb: "Punjab",
  rj: "Rajasthan",
  sk: "Sikkim",
  tn: "Tamil Nadu",
  ts: "Telangana",
  tg: "Telangana",
  tr: "Tripura",
  up: "Uttar Pradesh",
  uk: "Uttarakhand",
  ut: "Uttarakhand",
  wb: "West Bengal",
  an: "Andaman and Nicobar Islands",
  ch: "Chandigarh",
  dn: "Dadra and Nagar Haveli and Daman and Diu",
  dd: "Dadra and Nagar Haveli and Daman and Diu",
  dh: "Dadra and Nagar Haveli and Daman and Diu",
  dl: "Delhi",
  jk: "Jammu and Kashmir",
  la: "Ladakh",
  ld: "Lakshadweep",
  py: "Puducherry",
};

/** Common cities → state, so a city typed into the "state" field still resolves. */
const CITY_TO_STATE: Readonly<Record<string, string>> = (() => {
  const byState: Record<string, string[]> = {
    Maharashtra: [
      "mumbai", "pune", "nagpur", "nashik", "thane", "navi mumbai", "aurangabad",
      "chhatrapati sambhajinagar", "solapur", "kolhapur", "amravati", "nanded", "sangli",
      "satara", "jalgaon", "akola", "latur", "ahmednagar", "pimpri chinchwad", "kalyan", "vasai",
    ],
    Karnataka: [
      "bengaluru", "bangalore", "mysuru", "mysore", "mangaluru", "mangalore", "hubballi",
      "hubli", "dharwad", "belagavi", "belgaum", "kalaburagi", "gulbarga", "davanagere",
      "ballari", "bellary", "shivamogga", "tumakuru", "udupi",
    ],
    Telangana: ["hyderabad", "secunderabad", "warangal", "karimnagar", "nizamabad", "khammam"],
    "Andhra Pradesh": [
      "visakhapatnam", "vizag", "vijayawada", "guntur", "nellore", "tirupati", "kakinada",
      "rajahmundry", "kurnool", "anantapur", "amaravati",
    ],
    "Tamil Nadu": [
      "chennai", "coimbatore", "madurai", "tiruchirappalli", "trichy", "salem", "tirunelveli",
      "erode", "vellore", "thoothukudi", "tiruppur", "hosur",
    ],
    Kerala: [
      "kochi", "cochin", "ernakulam", "thiruvananthapuram", "trivandrum", "kozhikode",
      "calicut", "thrissur", "kollam", "kannur", "palakkad",
    ],
    Gujarat: [
      "ahmedabad", "surat", "vadodara", "baroda", "rajkot", "gandhinagar", "bhavnagar",
      "jamnagar", "junagadh", "anand", "bhuj", "morbi", "mehsana",
    ],
    Rajasthan: ["jaipur", "jodhpur", "udaipur", "kota", "bikaner", "ajmer", "jaisalmer", "bhilwara", "alwar", "sikar"],
    "Madhya Pradesh": ["bhopal", "indore", "gwalior", "jabalpur", "ujjain", "sagar", "rewa", "satna"],
    Chhattisgarh: ["raipur", "bhilai", "bilaspur", "durg", "korba"],
    Delhi: ["delhi", "dwarka"],
    Haryana: ["gurugram", "gurgaon", "faridabad", "panipat", "ambala", "karnal", "hisar", "rohtak", "sonipat", "panchkula"],
    "Uttar Pradesh": [
      "lucknow", "kanpur", "noida", "greater noida", "ghaziabad", "agra", "varanasi",
      "prayagraj", "allahabad", "meerut", "bareilly", "aligarh", "gorakhpur", "moradabad",
      "jhansi", "mathura", "ayodhya",
    ],
    Punjab: ["ludhiana", "amritsar", "jalandhar", "patiala", "bathinda", "mohali"],
    Chandigarh: ["chandigarh"],
    Bihar: ["patna", "gaya", "bhagalpur", "muzaffarpur", "darbhanga", "purnia"],
    Jharkhand: ["ranchi", "jamshedpur", "dhanbad", "bokaro", "hazaribagh"],
    Odisha: ["bhubaneswar", "cuttack", "rourkela", "puri", "sambalpur", "berhampur"],
    "West Bengal": ["kolkata", "calcutta", "howrah", "durgapur", "asansol", "siliguri", "kharagpur"],
    Assam: ["guwahati", "dibrugarh", "silchar", "jorhat", "tezpur"],
    Meghalaya: ["shillong"],
    Manipur: ["imphal"],
    Mizoram: ["aizawl"],
    Nagaland: ["kohima", "dimapur"],
    Tripura: ["agartala"],
    "Arunachal Pradesh": ["itanagar"],
    Sikkim: ["gangtok"],
    "Himachal Pradesh": ["shimla", "dharamshala", "manali", "solan", "mandi"],
    Uttarakhand: ["dehradun", "haridwar", "rishikesh", "nainital", "haldwani", "roorkee"],
    "Jammu and Kashmir": ["srinagar", "jammu"],
    Ladakh: ["leh", "kargil"],
    Goa: ["panaji", "panjim", "margao", "vasco da gama", "mapusa"],
    "Dadra and Nagar Haveli and Daman and Diu": ["daman", "diu", "silvassa"],
    "Andaman and Nicobar Islands": ["port blair"],
    Lakshadweep: ["kavaratti"],
  };
  const map: Record<string, string> = {};
  for (const [state, cities] of Object.entries(byState)) {
    for (const city of cities) map[city] = state;
  }
  return map;
})();

const CANONICAL_BY_KEY: Readonly<Record<string, string>> = Object.fromEntries(
  Object.keys(PEAK_SUN_HOURS_BY_STATE).map((state) => [normalizeLocationKey(state), state]),
);

function normalizeLocationKey(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z&\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function resolvePart(part: string, allowCodes: boolean): string | undefined {
  const key = normalizeLocationKey(part);
  if (!key) return undefined;
  return (
    CANONICAL_BY_KEY[key] ??
    STATE_ALIASES[key] ??
    (allowCodes ? STATE_CODES[key] : undefined) ??
    CITY_TO_STATE[key]
  );
}

/**
 * Resolves a state, union territory, alias, state code or common city name to
 * the canonical state name used in {@link PEAK_SUN_HOURS_BY_STATE}.
 * Accepts composite values such as "Pune, Maharashtra" or "Kothrud, Pune".
 */
export function resolveIndianState(location: string | null | undefined): string | undefined {
  if (!location) return undefined;
  const whole = resolvePart(location, true);
  if (whole) return whole;
  const parts = location.split(/[,/|-]/).map((part) => part.trim()).filter(Boolean);
  // Prefer an explicit state match anywhere, then a city match.
  for (const part of parts) {
    const key = normalizeLocationKey(part);
    const state = CANONICAL_BY_KEY[key] ?? STATE_ALIASES[key] ?? STATE_CODES[key];
    if (state) return state;
  }
  for (const part of parts) {
    const city = CITY_TO_STATE[normalizeLocationKey(part)];
    if (city) return city;
  }
  return undefined;
}

export interface PeakSunHoursLookup {
  peak_sun_hours: number;
  /** Canonical state name when the location resolved. */
  state?: string;
  source: "state_average" | "default";
}

/** Peak sun hours for a state or city; falls back to {@link DEFAULT_PEAK_SUN_HOURS}. */
export function getPeakSunHours(location: string | null | undefined): PeakSunHoursLookup {
  const state = resolveIndianState(location);
  if (state && PEAK_SUN_HOURS_BY_STATE[state] !== undefined) {
    return { peak_sun_hours: PEAK_SUN_HOURS_BY_STATE[state], state, source: "state_average" };
  }
  return { peak_sun_hours: DEFAULT_PEAK_SUN_HOURS, source: "default" };
}

// --- Seasonal generation profile --------------------------------------------------

export const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
] as const;

/**
 * Typical monthly yield of a fixed-tilt rooftop array in India (kWh per kWp),
 * peaking in the clear pre-monsoon months (Mar–May) and dipping in the
 * south-west monsoon (Jul–Aug). Shape based on PVGIS / PVWatts runs for
 * central and western Indian cities; only the shape is used.
 */
const MONTHLY_YIELD_SHAPE = [128, 132, 152, 152, 150, 118, 98, 100, 112, 128, 122, 120] as const;

const MONTHLY_YIELD_TOTAL = MONTHLY_YIELD_SHAPE.reduce((sum, value) => sum + value, 0);

/** 12 weights (January → December) summing to 1. */
export const MONTHLY_GENERATION_PROFILE: readonly number[] = MONTHLY_YIELD_SHAPE.map(
  (value) => value / MONTHLY_YIELD_TOTAL,
);

/**
 * Splits an annual figure into 12 whole-number months that add up exactly to
 * the rounded annual value (largest-remainder rounding).
 */
export function distributeMonthly(annualKwh: number): number[] {
  const total = Math.max(0, Math.round(annualKwh));
  const raw = MONTHLY_GENERATION_PROFILE.map((weight) => weight * total);
  const floors = raw.map((value) => Math.floor(value));
  let remainder = total - floors.reduce((sum, value) => sum + value, 0);
  const order = raw
    .map((value, index) => ({ index, fraction: value - Math.floor(value) }))
    .sort((a, b) => b.fraction - a.fraction || a.index - b.index);
  for (const { index } of order) {
    if (remainder <= 0) break;
    floors[index] += 1;
    remainder -= 1;
  }
  return floors;
}

// --- System performance -------------------------------------------------------------

/**
 * Mirrors backend `DEFAULT_PERFORMANCE_RATIO`: wiring, inverter, temperature,
 * soiling and mismatch losses. Shading is applied on top: PR × (1 − shading).
 */
export const DEFAULT_PERFORMANCE_RATIO = 0.82;

/** Shading inputs are clamped to this range (fraction of energy lost). */
export const MAX_SHADING_FACTOR = 0.6;

// --- Tariffs & savings ----------------------------------------------------------------

/**
 * Average blended tariff (energy + fixed + fuel adjustment charges) per kWh.
 * Assumption — Indian DISCOM tariffs are slab-based and vary by state;
 * override with the customer's actual tariff whenever it is known.
 */
export const DEFAULT_TARIFF_PER_KWH = {
  residential: 7.5,
  commercial: 9.5,
} as const;

/**
 * Net metering is assumed: generation up to the annual consumption offsets
 * grid purchases at the full tariff; the annual surplus is credited at this
 * fraction of the tariff (state net-metering / net-billing rules differ; the
 * settlement rate is usually close to the DISCOM's average power purchase cost).
 */
export const SURPLUS_EXPORT_CREDIT_FRACTION = 0.5;

// --- PM Surya Ghar: Muft Bijli Yojana -----------------------------------------------

/**
 * Indicative central financial assistance (CFA) for residential grid-connected
 * rooftop systems under PM Surya Ghar: Muft Bijli Yojana (MNRE, 2024).
 * Not available for commercial, industrial or off-grid systems. The CFA is
 * calculated on the lower of module (DC) and inverter (AC) capacity, needs DCR
 * (domestic content) modules from the ALMM list and an empanelled vendor, and is
 * always subject to DISCOM and National Portal approval.
 */
export const PM_SURYA_GHAR = {
  first_slab_kw: 2,
  first_slab_per_kw: 30_000,
  second_slab_kw: 1,
  second_slab_per_kw: 18_000,
  max_amount: 78_000,
  /** 10% higher CFA for special category states and UTs. */
  special_category: {
    first_slab_per_kw: 33_000,
    second_slab_per_kw: 19_800,
    max_amount: 85_800,
  },
  special_category_states: [
    "Arunachal Pradesh",
    "Assam",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Sikkim",
    "Tripura",
    "Himachal Pradesh",
    "Uttarakhand",
    "Jammu and Kashmir",
    "Ladakh",
    "Andaman and Nicobar Islands",
    "Lakshadweep",
  ] as readonly string[],
  approval_note: "Subject to DISCOM and National Portal approval",
} as const;

export interface SubsidyEstimate {
  amount: number;
  eligible_kw: number;
  special_category: boolean;
}

/** Indicative PM Surya Ghar CFA for an eligible capacity (kW). */
export function pmSuryaGharSubsidy(capacityKw: number, state?: string): SubsidyEstimate {
  const special = state ? PM_SURYA_GHAR.special_category_states.includes(state) : false;
  const firstRate = special ? PM_SURYA_GHAR.special_category.first_slab_per_kw : PM_SURYA_GHAR.first_slab_per_kw;
  const secondRate = special ? PM_SURYA_GHAR.special_category.second_slab_per_kw : PM_SURYA_GHAR.second_slab_per_kw;
  const cap = special ? PM_SURYA_GHAR.special_category.max_amount : PM_SURYA_GHAR.max_amount;
  const kw = Math.max(0, Number.isFinite(capacityKw) ? capacityKw : 0);
  const firstKw = Math.min(kw, PM_SURYA_GHAR.first_slab_kw);
  const secondKw = Math.min(Math.max(kw - PM_SURYA_GHAR.first_slab_kw, 0), PM_SURYA_GHAR.second_slab_kw);
  const amount = Math.min(cap, Math.round(firstKw * firstRate + secondKw * secondRate));
  return { amount, eligible_kw: kw, special_category: special };
}

// --- Emissions ----------------------------------------------------------------------

/**
 * Weighted-average grid emission factor, kg CO2 per kWh. Approximation of the
 * Central Electricity Authority (CEA) CO2 Baseline Database (~0.71–0.72 t/MWh
 * in recent editions).
 */
export const GRID_EMISSION_FACTOR_KG_PER_KWH = 0.716;

// --- Layout -------------------------------------------------------------------------

/** Mirrors backend `AVERAGE_PANEL_AREA_SQM`; used only when module dimensions are missing. */
export const FALLBACK_MODULE_AREA_SQM = 2.15;

/** Module footprint multiplier for walkways, row spacing and edge setbacks. */
export const LAYOUT_ALLOWANCE_FACTOR = 1.2;

/** Nominal module used by the demo roof analysis when no datasheet is supplied. */
export const NOMINAL_MODULE_LENGTH_M = 2.0;
export const NOMINAL_MODULE_WIDTH_M = 1.0;

// --- Electrical design ------------------------------------------------------------------

/** Standard test conditions cell temperature, °C. */
export const STC_CELL_TEMP_C = 25;
/** Design minimum cell temperature for cold-morning Voc (assumption). */
export const DESIGN_CELL_TEMP_MIN_C = 5;
/** Design maximum cell temperature for hot-afternoon Vmp (assumption). */
export const DESIGN_CELL_TEMP_MAX_C = 70;

export const DC_AC_RATIO = {
  min: 0.9,
  max: 1.3,
  preferred_min: 1.1,
  preferred_max: 1.2,
  target: 1.15,
} as const;

/** Above this AC capacity many DISCOMs require a three-phase connection (varies 5–10 kW by state). */
export const SINGLE_PHASE_LIMIT_KW = 5;

/** Above this capacity a three-phase inverter is preferred on three-phase connections. */
export const THREE_PHASE_PREFERRED_ABOVE_KW = 5;

// --- Storage --------------------------------------------------------------------------

export const BATTERY_DEPTH_OF_DISCHARGE = 0.9;
export const DEFAULT_CRITICAL_LOAD_KW = 1;
export const DEFAULT_BACKUP_HOURS = 4;

// --- Balance of system ---------------------------------------------------------------

/** DC cable per string (positive + negative run from array to inverter), metres. Assumption. */
export const DC_CABLE_M_PER_STRING = 20;
/** AC cable from inverter to ACDB / meter, metres. Assumption. */
export const AC_CABLE_M = 15;
/** Typical earth pits: DC side, AC side and lightning arrester. Assumption. */
export const EARTH_PIT_COUNT = 3;

// --- Costs ------------------------------------------------------------------------------

/** Installation, civil and commissioning (labour, anchoring, transport, DISCOM liaison). Assumption. */
export const INSTALLATION_COST_PER_KW = 6_000;
export const INSTALLATION_COST_FIXED = 8_000;

/** Placeholder wattage used only when the catalog has no usable module (clearly flagged). */
export const PLACEHOLDER_PANEL_WATTAGE_W = 540;

/** Reference design size when neither consumption nor roof area is known. */
export const REFERENCE_SYSTEM_KW = {
  residential: 3,
  commercial: 10,
} as const;

// --- GST ----------------------------------------------------------------------------------

/**
 * GST on renewable-energy devices (solar modules, inverters / PCUs, batteries
 * for solar systems) was reduced from 12% to 5% with effect from 22 Sep 2025.
 * Other materials and services are charged at the standard 18% here — an
 * assumption; EPC contracts may follow the 70:30 goods/services valuation and
 * every rate stays editable per quotation line.
 */
export const GST_RENEWABLE_DEVICES_PERCENT = 5;
export const GST_STANDARD_PERCENT = 18;
export const INSTALLATION_GST_PERCENT = 18;
