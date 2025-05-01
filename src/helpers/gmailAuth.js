const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENTID);

async function verifyGoogleToken(idToken) {
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENTID,
    // audience: "113768591418-megq0ob8rnmb7v21jm7ebfp045kri1j1.apps.googleusercontent.com",
  });

  const payload = ticket.getPayload();
  console.log("[payload from gmail verification]:", payload);

  return payload;   
}

module.exports = { verifyGoogleToken };
