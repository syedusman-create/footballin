const admin = require('firebase-admin');
const csv = require('csvtojson');
const path = require('path');
const serviceAccount = require('./serviceAccountKey.json'); // Download from Firebase Console

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function uploadNews() {
  const filePath = path.join(__dirname, 'data', 'football_league_news.csv');
  const newsArray = await csv().fromFile(filePath);

  for (const news of newsArray) {
    // Use news.id as document ID
    await db.collection('news').doc(news.id).set(news);
    console.log(`Uploaded news: ${news.id}`);
  }
  console.log('All news uploaded!');
}

uploadNews();