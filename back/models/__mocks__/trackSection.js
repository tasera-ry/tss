// In-memory sections. `setPeaks` stands in for the bookings: the most lanes
// booked at once per day, which the real model reads from track_reservation.
let sections = [];
let peaks = {};
let asked = [];

const fields = ['id', 'track_id', 'position', 'lane_count', 'name', 'description', 'description_sv', 'description_en'];
const pick = section => Object.fromEntries(fields.map(f => [f, section[f] ?? null]));
const peaksFrom = (id, from) => (peaks[id] || []).filter(day => day.date >= from);

const model = {
  read: async function readSection(key) {
    return sections.filter(section =>
      Object.keys(key).every(field => section[field] === key[field])
    );
  },

  create: async function createSection(section) {
    const last = Math.max(0, ...sections.filter(s => s.track_id === section.track_id).map(s => s.position));
    const row = { ...section, id: Math.max(0, ...sections.map(s => s.id)) + 1, position: last + 1 };
    sections.push(row);
    return pick(row);
  },

  update: async function updateSection(id, changes, from) {
    asked.push({ id, from });
    const section = sections.find(s => s.id === id);
    if (!section) return {};
    if (changes.lane_count !== undefined && changes.lane_count < section.lane_count) {
      const refused = peaksFrom(id, from).filter(day => day.booked > changes.lane_count);
      if (refused.length > 0) return { refused };
    }
    Object.assign(section, changes);
    return { section: pick(section) };
  },

  delete: async function deleteSection(id, from) {
    asked.push({ id, from });
    const section = sections.find(s => s.id === id);
    if (!section) return {};
    if (sections.filter(s => s.track_id === section.track_id).length <= 1) return { last: true };
    const refused = peaksFrom(id, from);
    if (refused.length > 0) return { refused };
    sections = sections.filter(s => s.id !== id);
    return { deleted: true };
  },

  setPeaks: (id, days) => { peaks[id] = days; },
  asked: () => asked,

  seed: async function seed(rows) {
    sections = rows.map(row => ({ ...row }));
  },

  clear: async function clear() {
    sections = [];
    peaks = {};
    asked = [];
  }
};

module.exports = model;
