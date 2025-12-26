const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require("@google/generative-ai");

function loadEnv() {
    try {
        const envPath = path.join(__dirname, '.env.local');
        if (fs.existsSync(envPath)) {
            const envContent = fs.readFileSync(envPath, 'utf8');
            envContent.split('\n').forEach(line => {
                const match = line.match(/^([^=]+)=(.*)$/);
                if (match) {
                    const key = match[1].trim();
                    const value = match[2].trim().replace(/^["'](.*)["']$/, '$1');
                    process.env[key] = value;
                }
            });
        }
    } catch (e) {
        console.error("Error loading .env.local:", e);
    }
}

loadEnv();

async function listModels() {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
        console.error("GOOGLE_API_KEY is missing/undefined");
        return;
    }

    console.log("Using API Key:", apiKey.substring(0, 5) + "...");
    const genAI = new GoogleGenerativeAI(apiKey);

    try {
        console.log("Testing gemini-1.5-flash-001...");
        const modelFlash001 = genAI.getGenerativeModel({ model: "gemini-1.5-flash-001" });
        try {
            const resultFlash001 = await modelFlash001.generateContent("Hello");
            console.log("gemini-1.5-flash-001 success:", resultFlash001.response.text());
        } catch (e) {
            console.error("gemini-1.5-flash-001 failed:", e.message);
        }

        console.log("Testing gemini-pro...");
        const modelPro = genAI.getGenerativeModel({ model: "gemini-pro" });
        try {
            const resultPro = await modelPro.generateContent("Hello");
            console.log("gemini-pro success:", resultPro.response.text());
        } catch (e) {
            console.error("gemini-pro failed:", e.message);
        }

        console.log("Testing gemini-1.5-flash...");
        const modelFlash = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        try {
            const resultFlash = await modelFlash.generateContent("Hello");
            console.log("gemini-1.5-flash success:", resultFlash.response.text());
        } catch (e) {
            console.error("gemini-1.5-flash failed:", e.message);
        }

    } catch (error) {
        console.error("Global Error:", error.message);
    }
}

listModels();
