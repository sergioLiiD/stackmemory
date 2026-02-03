const axios = require('axios');

const TOKEN = process.argv[2];
const PROJECT_ID = process.argv[3];
const API_URL = 'https://stackmemory.app/api';

if (!TOKEN || !PROJECT_ID) {
    console.error('Usage: node test-auth.js <token> <project-id>');
    process.exit(1);
}

async function testAuth() {
    console.log(`Testing auth against ${API_URL}...`);
    try {
        // Try a simple authenticated endpoint if possible, or just the chat one with a ping
        const response = await axios.post(`${API_URL}/chat`, {
            query: 'ping',
            projectId: PROJECT_ID
        }, {
            headers: {
                'Authorization': `Bearer ${TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('Success! Status:', response.status);
        console.log('Response data:', response.data);
    } catch (e) {
        console.error('Error Status:', e.response?.status);
        console.error('Error Data:', e.response?.data);
        console.error('Full Error:', e.message);
    }
}

testAuth();
