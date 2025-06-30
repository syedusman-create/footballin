const admin = require('firebase-admin');
const csv = require('csvtojson');
const path = require('path');
const serviceAccount = require('./serviceAccountKey.json'); // Download from Firebase Console

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function uploadFixtures() {
  const filePath = path.join(__dirname, 'data', 'football_fixtures.csv');
  const fixturesArray = await csv().fromFile(filePath);

  for (const fixture of fixturesArray) {
    await db.collection('fixtures').doc(fixture.id).set(fixture);
    console.log(`Uploaded fixture: ${fixture.id}`);
  }
  console.log('All fixtures uploaded!');
}

uploadFixtures();