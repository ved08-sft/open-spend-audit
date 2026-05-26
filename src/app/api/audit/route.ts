// src/app/api/audit/route.ts
import { NextRequest, NextResponse } from "next/server";
import { AuditPayload } from "../../../types/audit";
import { calculateAudit } from "../../../utils/auditengine";
import { DatabaseService } from "../../../utils/database";

export async function POST(req: NextRequest) {
  try {
    const payload = (await req.json()) as AuditPayload;

    if (!payload || !payload.tools) {
      return NextResponse.json({ error: "Invalid audit payload data" }, { status: 400 });
    }

    // Run deterministic audit engine calculations
    const result = calculateAudit(payload);

    // Save calculation data anonymously to database
    const auditId = await DatabaseService.saveAudit(payload, result);

    return NextResponse.json({
      success: true,
      auditId,
      result
    });
  } catch (error: any) {
    console.error("POST /api/audit server error:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}
