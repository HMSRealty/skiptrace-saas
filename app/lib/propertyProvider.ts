// ─── PROPERTY-LIST PROVIDER (Idea #7: List-pull marketplace) ─────────────
// Owns the step *before* skip tracing: building a targeted property list that
// then flows straight into a trace. The app talks to a PropertyListProvider
// interface, so swapping the built-in demo source for a real data vendor
// (ATTOM, RapidAPI real-estate, etc.) is a single new file + one line in
// getProvider() — no UI or API changes required.

export interface ListFilters {
  state: string;
  city: string;
  zip: string;
  minEquityPct: number;      // e.g. 40 => owners with >= 40% equity
  ownerType: 'any' | 'absentee' | 'owner-occupied';
  propertyType: 'any' | 'single-family' | 'multi-family' | 'condo' | 'land';
  limit: number;             // how many records to pull
}

// One row per property/owner. Field names are chosen to map cleanly onto the
// skip-trace column mapping (see PROVIDER_COLUMN_MAP below).
export interface PropertyRecord {
  'First Name': string;
  'Last Name': string;
  'Property Address': string;
  'City': string;
  'State': string;
  'Zip': string;
  'Mailing Address': string;
  'Mailing City': string;
  'Mailing State': string;
  'Mailing Zip': string;
  'Owner Type': string;
  'Property Type': string;
  'Est. Equity %': string;
}

export interface PropertyListProvider {
  readonly name: string;
  estimateCount(filters: ListFilters): Promise<number>;
  search(filters: ListFilters): Promise<PropertyRecord[]>;
}

// Column mapping that NewTraceView/skiptrace expect for provider-pulled lists.
export const PROVIDER_COLUMN_MAP = {
  firstName: 'First Name', lastName: 'Last Name',
  street: 'Property Address', city: 'City', state: 'State', zip: 'Zip',
  mailingStreet: 'Mailing Address', mailingCity: 'Mailing City',
  mailingState: 'Mailing State', mailingZip: 'Mailing Zip',
};

// ── Built-in demo provider ───────────────────────────────────────────────
// Generates realistic, deterministic-ish sample rows so the whole list →
// trace → dial funnel is demoable today without a paid data contract.
const FIRST = ['James', 'Mary', 'Robert', 'Patricia', 'John', 'Jennifer', 'Michael', 'Linda', 'David', 'Elizabeth', 'William', 'Barbara', 'Maria', 'Carlos', 'Aisha', 'Wei'];
const LAST  = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Wilson', 'Anderson', 'Nguyen', 'Patel'];
const STREETS = ['Oak', 'Maple', 'Cedar', 'Pine', 'Elm', 'Washington', 'Lake', 'Hill', 'Sunset', 'Park', 'Highland', 'Magnolia', 'Birch', 'Willow'];
const SUFFIX = ['St', 'Ave', 'Dr', 'Ln', 'Rd', 'Ct', 'Way', 'Blvd'];
const PROP_TYPES: Record<string, string> = {
  'single-family': 'Single Family', 'multi-family': 'Multi Family', 'condo': 'Condo', 'land': 'Vacant Land',
};

function rand<T>(arr: T[], r: () => number): T { return arr[Math.floor(r() * arr.length)]; }
function mulberry32(seed: number) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

class DemoProvider implements PropertyListProvider {
  readonly name = 'Demo Data';

  async estimateCount(filters: ListFilters): Promise<number> {
    // A plausible-looking "market size" derived from the filters.
    let base = filters.zip ? 1800 : filters.city ? 14000 : 120000;
    if (filters.ownerType === 'absentee') base = Math.round(base * 0.34);
    if (filters.ownerType === 'owner-occupied') base = Math.round(base * 0.62);
    if (filters.propertyType !== 'any') base = Math.round(base * 0.4);
    base = Math.round(base * (1 - filters.minEquityPct / 160));
    return Math.max(filters.limit, base);
  }

  async search(filters: ListFilters): Promise<PropertyRecord[]> {
    const seedStr = `${filters.state}|${filters.city}|${filters.zip}|${filters.ownerType}|${filters.propertyType}|${filters.minEquityPct}`;
    let seed = 0;
    for (let i = 0; i < seedStr.length; i++) seed = (seed * 31 + seedStr.charCodeAt(i)) | 0;
    const r = mulberry32(seed || 1);

    const count = Math.min(Math.max(1, filters.limit), 5000);
    const city = filters.city || rand(['Atlanta', 'Dallas', 'Phoenix', 'Tampa', 'Columbus'], r);
    const state = (filters.state || 'GA').toUpperCase();
    const zip = filters.zip || String(30000 + Math.floor(r() * 9999));

    const rows: PropertyRecord[] = [];
    for (let i = 0; i < count; i++) {
      const first = rand(FIRST, r);
      const last  = rand(LAST, r);
      const num   = 100 + Math.floor(r() * 9800);
      const propAddr = `${num} ${rand(STREETS, r)} ${rand(SUFFIX, r)}`;

      const ownerType = filters.ownerType === 'any'
        ? (r() > 0.5 ? 'Absentee' : 'Owner Occupied')
        : (filters.ownerType === 'absentee' ? 'Absentee' : 'Owner Occupied');

      // Absentee owners get a different mailing address (out-of-area).
      const absentee = ownerType === 'Absentee';
      const mailNum = 100 + Math.floor(r() * 9800);
      const mailAddr = absentee ? `${mailNum} ${rand(STREETS, r)} ${rand(SUFFIX, r)}` : propAddr;
      const mailCity = absentee ? rand(['Chicago', 'Denver', 'Seattle', 'Boston', 'Austin'], r) : city;
      const mailState = absentee ? rand(['IL', 'CO', 'WA', 'MA', 'TX'], r) : state;
      const mailZip = absentee ? String(10000 + Math.floor(r() * 89999)) : zip;

      const equity = Math.min(100, Math.round(filters.minEquityPct + r() * (100 - filters.minEquityPct)));
      const propType = filters.propertyType === 'any'
        ? rand(Object.values(PROP_TYPES), r)
        : PROP_TYPES[filters.propertyType];

      rows.push({
        'First Name': first,
        'Last Name': last,
        'Property Address': propAddr,
        'City': city,
        'State': state,
        'Zip': zip,
        'Mailing Address': mailAddr,
        'Mailing City': mailCity,
        'Mailing State': mailState,
        'Mailing Zip': mailZip,
        'Owner Type': ownerType,
        'Property Type': propType,
        'Est. Equity %': `${equity}%`,
      });
    }
    return rows;
  }
}

// Swap this out (or branch on an env var) to plug in a real vendor later.
export function getProvider(): PropertyListProvider {
  return new DemoProvider();
}
