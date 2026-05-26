// src/utils/database.ts
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { AuditPayload, AuditResult } from "../types/audit";

export interface DB_Audit {
  id: string;
  payload: AuditPayload;
  result: AuditResult;
  createdAt: string;
}

export interface DB_Lead {
  id: string;
  auditId: string;
  email: string;
  companyName?: string;
  role?: string;
  teamSize?: number;
  createdAt: string;
}

const LOCAL_DB_PATH = path.join(process.cwd(), "db.json");

// Helper to initialize and read local JSON database
function getLocalDB(): { audits: DB_Audit[]; leads: DB_Lead[] } {
  if (!fs.existsSync(LOCAL_DB_PATH)) {
    const initial = { audits: [], leads: [] };
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(initial, null, 2), "utf8");
    return initial;
  }
  try {
    const data = fs.readFileSync(LOCAL_DB_PATH, "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Failed to read local DB file, resetting:", err);
    return { audits: [], leads: [] };
  }
}

// Helper to write to local JSON database
function writeLocalDB(db: { audits: DB_Audit[]; leads: DB_Lead[] }) {
  try {
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(db, null, 2), "utf8");
  } catch (err) {
    console.error("Failed to write to local DB file:", err);
  }
}

// Check if Supabase envs are active
const isSupabaseConfigured = () => {
  return !!(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY);
};

// Database interface
export const DatabaseService = {
  /**
   * Save audit details and return the unique audit ID.
   */
  async saveAudit(payload: AuditPayload, result: AuditResult): Promise<string> {
    const auditId = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    if (isSupabaseConfigured()) {
      const url = `${process.env.SUPABASE_URL}/rest/v1/audits`;
      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": process.env.SUPABASE_ANON_KEY!,
            "Authorization": `Bearer ${process.env.SUPABASE_ANON_KEY!}`,
            "Prefer": "return=representation"
          },
          body: JSON.stringify({
            id: auditId,
            payload: JSON.stringify(payload),
            result: JSON.stringify(result),
            created_at: createdAt
          })
        });

        if (response.ok) {
          return auditId;
        } else {
          const errMsg = await response.text();
          console.error("Supabase Save Audit Error status:", response.status, errMsg);
        }
      } catch (err) {
        console.error("Supabase Save Audit Connection Error:", err);
      }
      console.warn("Supabase save failed or unconfigured, falling back to local storage...");
    }

    // Fallback: Local JSON database
    const db = getLocalDB();
    db.audits.push({
      id: auditId,
      payload,
      result,
      createdAt
    });
    writeLocalDB(db);
    return auditId;
  },

  /**
   * Fetch audit by ID.
   */
  async getAudit(auditId: string): Promise<DB_Audit | null> {
    if (isSupabaseConfigured()) {
      const url = `${process.env.SUPABASE_URL}/rest/v1/audits?id=eq.${auditId}&select=*`;
      try {
        const response = await fetch(url, {
          method: "GET",
          headers: {
            "apikey": process.env.SUPABASE_ANON_KEY!,
            "Authorization": `Bearer ${process.env.SUPABASE_ANON_KEY!}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            const rawAudit = data[0];
            return {
              id: rawAudit.id,
              payload: typeof rawAudit.payload === "string" ? JSON.parse(rawAudit.payload) : rawAudit.payload,
              result: typeof rawAudit.result === "string" ? JSON.parse(rawAudit.result) : rawAudit.result,
              createdAt: rawAudit.created_at
            };
          }
        }
      } catch (err) {
        console.error("Supabase Get Audit Error:", err);
      }
    }

    // Fallback: Local JSON database
    const db = getLocalDB();
    const audit = db.audits.find(a => a.id === auditId);
    return audit || null;
  },

  /**
   * Save a B2B lead connected to an audit.
   */
  async saveLead(lead: {
    auditId: string;
    email: string;
    companyName?: string;
    role?: string;
    teamSize?: number;
  }): Promise<string> {
    const leadId = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    if (isSupabaseConfigured()) {
      const url = `${process.env.SUPABASE_URL}/rest/v1/leads`;
      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": process.env.SUPABASE_ANON_KEY!,
            "Authorization": `Bearer ${process.env.SUPABASE_ANON_KEY!}`,
          },
          body: JSON.stringify({
            id: leadId,
            audit_id: lead.auditId,
            email: lead.email,
            company_name: lead.companyName || null,
            role: lead.role || null,
            team_size: lead.teamSize || null,
            created_at: createdAt
          })
        });

        if (response.ok) {
          return leadId;
        } else {
          const errMsg = await response.text();
          console.error("Supabase Save Lead Error status:", response.status, errMsg);
        }
      } catch (err) {
        console.error("Supabase Save Lead Connection Error:", err);
      }
    }

    // Fallback: Local JSON database
    const db = getLocalDB();
    db.leads.push({
      id: leadId,
      auditId: lead.auditId,
      email: lead.email,
      companyName: lead.companyName,
      role: lead.role,
      teamSize: lead.teamSize,
      createdAt
    });
    writeLocalDB(db);
    return leadId;
  }
};
