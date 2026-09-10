// Quick test script to verify Spotify credentials
const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

async function testSpotifyCredentials() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  console.log('\n🔍 Testing Spotify API Credentials...\n');
  console.log('📋 Client ID:', clientId ? `${clientId.substring(0, 10)}...` : '❌ NOT SET');
  console.log('📋 Client Secret:', clientSecret ? `${clientSecret.substring(0, 10)}...` : '❌ NOT SET');
  
  if (!clientId || !clientSecret) {
    console.log('\n❌ ERROR: Credentials not found!');
    console.log('\n📝 TO FIX:');
    console.log('1. Edit .env.local file');
    console.log('2. Replace SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET with your actual values');
    console.log('3. Get them from: https://developer.spotify.com/dashboard');
    process.exit(1);
  }

  if (clientId.includes('YOUR_') || clientId.includes('EXAMPLE')) {
    console.log('\n⚠️  WARNING: Looks like placeholder values!');
    console.log('Please replace with actual credentials from Spotify Dashboard');
    process.exit(1);
  }

  try {
    console.log('\n⏳ Attempting to get access token...\n');
    
    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      'grant_type=client_credentials',
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
        },
      }
    );

    console.log('✅ SUCCESS! Spotify credentials are valid!');
    console.log('🎉 Access token received');
    console.log('⏰ Token expires in:', response.data.expires_in, 'seconds');
    console.log('\n🚀 You can now start the dev server: npm run dev\n');
    
  } catch (error) {
    console.log('\n❌ FAILED to authenticate with Spotify!');
    
    if (error.response?.status === 401) {
      console.log('🔴 Invalid credentials - please check:');
      console.log('   1. Client ID is correct');
      console.log('   2. Client Secret is correct (click "View client secret" in dashboard)');
      console.log('   3. No extra spaces or quotes in .env.local file');
    } else if (error.response?.status === 400) {
      console.log('🟡 Bad request - credentials format may be wrong');
      console.log('   Make sure there are no quotes around the values');
    } else {
      console.log('🔴 Error:', error.response?.data || error.message);
    }
    
    console.log('\n📝 Get credentials from: https://developer.spotify.com/dashboard\n');
    process.exit(1);
  }
}

testSpotifyCredentials();
