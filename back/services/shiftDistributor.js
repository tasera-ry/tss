/*
  - Summation of all membership counts
  - Distribution of shifts per organization
  - Creation of an array with assigned shifts
  - Random shuffle of the final shift list
  - Pairing each shift with a date
  - Inserting results into the database
*/

// shiftDistributor.js

// Import your existing service that writes to DB
const raffleSupervisorsService = require('./raffleSupervisors');

// All organizations and their membership counts
const associations = [
  { id: 1, name: 'Insta Group oy', membershipCount: 14 },
  { id: 2, name: 'Kortemaan Eränkävijät ry', membershipCount: 12 },
  { id: 3, name: 'Lempäälän Ampujat ry', membershipCount: 67 },
  { id: 4, name: 'Lentokonetehtaan Erämiehet ry', membershipCount: 32 },
  { id: 5, name: 'Länsi-Lempäälän Erämiehet ry', membershipCount: 20 },
  { id: 6, name: 'MPK Hämeen maanpuolustuspiiri', membershipCount: 25 },
  { id: 7, name: 'Nokian Seudun Ampujat ry', membershipCount: 81 },
  { id: 8, name: 'Pirkanmaan Laskuvarjojääkärikilta ry', membershipCount: 5 },
  { id: 9, name: 'Pirkanmaan Rauhanturvaajat ry', membershipCount: 7 },
  { id: 10, name: 'Pirkanmaan Reserviläispiiri ry', membershipCount: 364 },
  { id: 11, name: 'Pirkanmaan Reserviupseeripiiri ry', membershipCount: 55 },
  { id: 12, name: 'Pirkanmaan Urheiluampujat ry', membershipCount: 18 },
  { id: 13, name: 'Pirkkalan Metsästysyhdistys ry', membershipCount: 22 },
  { id: 14, name: 'Pohjois-Hämeen Ampujat ry', membershipCount: 25 },
  { id: 15, name: 'Pohjois-Tampereen Reserviläiset ry', membershipCount: 24 },
  { id: 16, name: 'Poliisiammattikorkeakoulun opiskelijakunta', membershipCount: 0 },
  { id: 17, name: 'Raflatacin urheiluampujat ry', membershipCount: 41 },
  { id: 18, name: 'Säijän Metsästysseura ry', membershipCount: 28 },
  { id: 19, name: 'Tampereen Korkeakoulujen Reserviupseerit ry (TAKORU)', membershipCount: 107 },
  { id: 20, name: 'Tampereen Sotilaspoliisikilta ry', membershipCount: 14 },
  { id: 21, name: 'Tampereen Urheiluampujat ry', membershipCount: 33 },
  { id: 22, name: 'Tampereen Varuskunnan Metsästysyhdistys ry', membershipCount: 50 },
  { id: 23, name: 'Tampereen Varuskunnan Urheilijat ry', membershipCount: 25 },
  { id: 24, name: 'Tarkka-ampujakilta ry', membershipCount: 14 },
  { id: 25, name: 'Upseerien ampumayhdistys ry (Pirkanmaan alaosasto)', membershipCount: 21 }
];

// Simple function to shuffle arrays
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Main function:
 * 1) Calculate share of shifts for each organization.
 * 2) Build an array of { association_id } repeated X times.
 * 3) Shuffle it, then pair with your allDates array.
 * 4) Call raffleSupervisorsService.set(...) to save in DB.
 */
async function runDistribution(totalShifts, allDates) {
  // Sum total membership
  const totalMembership = associations.reduce((sum, o) => sum + o.membershipCount, 0);

  // For each organization, figure out how many shifts they get
  let leftover = totalShifts;
  const dist = associations.map(o => {
    const fraction = o.membershipCount / totalMembership;
    const count = Math.round(fraction * totalShifts);
    leftover -= count;
    return { ...o, assignedShifts: count };
  });

  // If rounding left leftover != 0, adjust first org for simplicity
  if (leftover !== 0 && dist.length > 0) {
    dist[0].assignedShifts += leftover; 
    leftover = 0;
  }

  // Build array of "raffle results" (no dates yet)
  let results = [];
  dist.forEach(o => {
    for (let i = 0; i < o.assignedShifts; i++) {
      results.push({ association_id: o.id });
    }
  });

  // Shuffle
  shuffleArray(results);

  // Attach dates (assuming allDates.length == totalShifts)
  results = results.map((r, i) => ({ ...r, date: allDates[i] }));

  // Save into DB via your existing service
  await raffleSupervisorsService.set(results);

  // Return final list if you want to see it
  return results;
}

module.exports = {
  runDistribution
};

const { runDistribution } = require('./shiftDistributor');

(async () => {
  // Suppose you have 250 shifts
  const totalShifts = 250;

  // Build an array of 250 dates (one for each shift)
  const start = new Date('2024-01-01');
  const allDates = [];
  for (let i = 0; i < totalShifts; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    allDates.push(d.toISOString().split('T')[0]); // e.g. "2024-01-01"
  }

  // Run it
  const finalAssignments = await runDistribution(totalShifts, allDates);
  console.log(finalAssignments);
})();