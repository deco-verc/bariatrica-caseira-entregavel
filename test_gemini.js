const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

async function testGemini() {
  const envPath = path.resolve(__dirname, '.env.local');
  const envContent = fs.readFileSync(envPath, 'utf8');
  const env = {};
  envContent.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) env[parts[0].trim()] = parts.slice(1).join('=').trim();
  });

  const apiKey = env.GEMINI_API_KEY;
  const modelName = env.GEMINI_MODEL || 'gemini-2.0-flash';

  console.log('Testing Gemini with key:', apiKey?.substring(0, 5) + '...');
  
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent('Olá, diga ok se estiver funcionando');
    console.log('Gemini Response:', result.response.text());
  } catch (err) {
    console.error('GEMINI ERROR:', err.message);
  }
}

testGemini();
