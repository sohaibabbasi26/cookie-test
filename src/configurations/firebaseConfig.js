const admin = require("firebase-admin");
const serviceAccount = require("../../brainflow-video-firebase-adminsdk-fbsvc-5b432194df.json");

const firebaseAdmin = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

module.exports = firebaseAdmin;
