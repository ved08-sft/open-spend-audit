// scripts/test-keys.ts
import path from "path";
import fs from "fs";

// Manually parse .env.local to remove dependencies on 'dotenv'
const envPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  try {
    const content = fs.readFileSync(envPath, "utf8");
    const lines = content.split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      // Skip comments or empty lines
      if (!trimmed || trimmed.startsWith("#")) continue;
      const equalsIdx = trimmed.indexOf("=");
      if (equalsIdx === -1) continue;
      const key = trimmed.substring(0, equalsIdx).trim();
      const val = trimmed.substring(equalsIdx + 1).trim();
      process.env[key] = val;
    }
    console.log("Loaded configurations from .env.local\n");
  } catch (err: any) {
    console.error("Failed to read .env.local file:", err.message);
  }
} else {
  console.error("Missing .env.local file in the project root directory.");
  process.exit(1);
}

async function testGemini() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    console.log("🔴 Gemini API Key: MISSING in .env.local");
    return false;
  }
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: "Respond with the word SUCCESS." }] }]
        })
      }
    );
    if (response.ok) {
      const data = await response.json();
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
      console.log(`✅ Gemini API Connection: SUCCESS! (Model says: "${reply}")`);
      return true;
    } else {
      const errText = await response.text();
      console.log(`🔴 Gemini API Connection: FAILED (Status: ${response.status})`);
      console.log(`   Error details: ${errText}`);
      return false;
    }
  } catch (err: any) {
    console.log(`🔴 Gemini API Connection: EXCEPTION (Error: ${err.message})`);
    return false;
  }
}

async function testSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) {
    console.log("🔴 Supabase Credentials: MISSING in .env.local");
    return false;
  }
  try {
    const response = await fetch(`${url}/rest/v1/audits?select=*&limit=1`, {
      method: "GET",
      headers: {
        "apikey": key,
        "Authorization": `Bearer ${key}`
      }
    });
    if (response.ok) {
      console.log("✅ Supabase REST API Connection: SUCCESS! (Authenticated with tables successfully)");
      return true;
    } else if (response.status === 404) {
      console.log(`⚠️ Supabase REST API Connection: FAILED (Status: 404 - Table 'audits' not found)`);
      console.log(`   👉 Please run the Supabase SQL Schema setup in your Supabase SQL Editor first!`);
      return false;
    } else {
      const errText = await response.text();
      console.log(`🔴 Supabase REST API Connection: FAILED (Status: ${response.status})`);
      console.log(`   Error details: ${errText}`);
      return false;
    }
  } catch (err: any) {
    console.log(`🔴 Supabase REST API Connection: EXCEPTION (Error: ${err.message})`);
    return false;
  }
}

async function testResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.log("🔴 Resend API Key: MISSING in .env.local");
    return false;
  }
  if (key.startsWith("re_") && key.length > 10) {
    console.log("✅ Resend API Configuration: SUCCESS! (Key formatting looks correct: 're_...')");
    console.log("   👉 Note: To test actual email delivery, run a test audit form submission in the dashboard.");
    return true;
  } else {
    console.log("🔴 Resend API Configuration: FAILED (Key format is incorrect. Resend keys must start with 're_')");
    return false;
  }
}

async function runHealthCheck() {
  console.log("=================================================");
  console.log("📡 SPENDOPTIMA API KEYS HEALTH CHECK PIPELINE");
  console.log("=================================================\n");
  
  await testGemini();
  console.log("-------------------------------------------------");
  await testSupabase();
  console.log("-------------------------------------------------");
  await testResend();
  
  console.log("\n=================================================");
}

runHealthCheck();
