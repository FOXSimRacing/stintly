// Deterministically synthesizes a plausible member summary for any cust_id
// that isn't one of the hand-written fixtures in members.ts, so the mock
// works for every driver a team actually registers (arbitrary iracingId
// values), not just the five curated fictitious cust_ids. Same cust_id
// always yields the same synthetic member.

const FIRST_NAMES = [
  "Lucas", "Mateus", "Gabriel", "Rafael", "Bruno", "Felipe", "Thiago", "Eduardo",
  "Carlos", "André", "Renato", "Vinicius", "Leonardo", "Rodrigo", "Fernando",
  "Camila", "Juliana", "Larissa", "Beatriz", "Amanda", "Isabela", "Patricia",
  "Mariana", "Fernanda", "Gustavo",
];

const LAST_NAMES = [
  "Silva", "Santos", "Oliveira", "Souza", "Costa", "Pereira", "Almeida",
  "Ribeiro", "Carvalho", "Gomes", "Martins", "Rocha", "Barbosa", "Araujo",
  "Nascimento", "Lima", "Moreira", "Cardoso", "Teixeira", "Correia",
];

const SAFETY_CLASSES = ["R", "D", "C", "B", "A", "Pro"] as const;

// mulberry32: small, fast, deterministic PRNG — fine for fixture generation,
// not for anything security-sensitive.
function mulberry32(seed: number) {
  let a = seed;
  return function random() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Spreads nearby cust_ids into unrelated seeds so e.g. 100006 and 100007
// don't produce visually similar sequences.
function hashCustId(custId: number) {
  return Math.imul(custId ^ 0x9e3779b9, 2654435761) >>> 0;
}

export function synthesizeMemberSummary(custId: number) {
  const rand = mulberry32(hashCustId(custId));

  const firstName = FIRST_NAMES[Math.floor(rand() * FIRST_NAMES.length)];
  const lastName = LAST_NAMES[Math.floor(rand() * LAST_NAMES.length)];
  const irating = 350 + Math.floor(rand() * 7650);
  const safetyClass = SAFETY_CLASSES[Math.floor(rand() * SAFETY_CLASSES.length)];
  const safetyNumber = (rand() * 4.99).toFixed(2);

  return {
    cust_id: custId,
    display_name: `${firstName} ${lastName}`,
    irating,
    safety_rating: `${safetyClass} ${safetyNumber}`,
  };
}
