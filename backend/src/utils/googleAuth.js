/**
 * @file googleAuth.js
 * @description Google OAuth helper for verifying ID tokens.
 */

const https = require('https');

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

/**
 * Verifies a Google ID token.
 * @param {string} idToken - The Google ID token.
 * @returns {Promise<Object>} Decoded user profile { googleId, email, name, picture }.
 */
const verifyGoogleToken = (idToken) => {
  return new Promise((resolve, reject) => {
    const url = `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`;

    https.get(url, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const parsedData = JSON.parse(data);
          
          if (parsedData.error) {
            return reject(new Error(`Google token verification failed: ${parsedData.error_description || parsedData.error}`));
          }
          
          if (GOOGLE_CLIENT_ID && parsedData.aud !== GOOGLE_CLIENT_ID) {
            return reject(new Error('Google Client ID mismatch (aud check failed).'));
          }

          resolve({
            googleId: parsedData.sub,
            email: parsedData.email,
            name: parsedData.name,
            picture: parsedData.picture,
          });
        } catch (error) {
          reject(new Error('Failed to parse Google token info response.'));
        }
      });
    }).on('error', (error) => {
      reject(new Error(`HTTPS request failed: ${error.message}`));
    });
  });
};

module.exports = {
  verifyGoogleToken,
};
