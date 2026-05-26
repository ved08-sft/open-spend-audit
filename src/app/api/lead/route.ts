// src/app/api/lead/route.ts
import { NextRequest, NextResponse } from "next/server";
import { DatabaseService } from "../../../utils/database";

// Keep a simple in-memory cache for IP-based rate limiting
const ipCache = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
const MAX_SUBMISSIONS_PER_WINDOW = 5;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = ipCache.get(ip);

  if (!record) {
    ipCache.set(ip, { count: 1, lastReset: now });
    return false;
  }

  if (now - record.lastReset > RATE_LIMIT_WINDOW) {
    ipCache.set(ip, { count: 1, lastReset: now });
    return false;
  }

  if (record.count >= MAX_SUBMISSIONS_PER_WINDOW) {
    return true;
  }

  record.count++;
  return false;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { auditId, email, companyName, role, teamSize, honeypot } = body;

    // 1. Honeypot Anti-Spam protection: if the hidden field is filled, silently discard but return successful response
    if (honeypot && honeypot.trim() !== "") {
      console.warn("Honeypot triggered. Silently ignoring bot submission.");
      return NextResponse.json({ success: true, message: "Lead captured successfully (mocked)." });
    }

    if (!auditId || !email) {
      return NextResponse.json({ error: "Missing required audit ID or email" }, { status: 400 });
    }

    // 2. Rate Limiting Protection
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many submissions. Please try again in an hour." },
        { status: 429 }
      );
    }

    // 3. Get the corresponding audit details to populate email contents
    const auditRecord = await DatabaseService.getAudit(auditId);
    if (!auditRecord) {
      return NextResponse.json({ error: "Associated audit not found" }, { status: 404 });
    }

    const { totalMonthlySavings, totalAnnualSavings, totalCurrentSpend, totalRecommendedSpend } = auditRecord.result;

    // 4. Save lead details securely in the database
    const leadId = await DatabaseService.saveLead({
      auditId,
      email,
      companyName,
      role,
      teamSize: teamSize ? parseInt(teamSize) : undefined
    });

    // 5. Send Transactional Email via Resend REST API
    const resendKey = process.env.RESEND_API_KEY;
    let emailSent = false;
    let emailStatus = "unconfigured";

    if (resendKey) {
      try {
        const reportUrl = `${req.nextUrl.origin}/report/${auditId}`;
        const consultationText = totalMonthlySavings >= 500
          ? `<div style="margin-top: 25px; padding: 20px; background-color: #1e1b4b; border: 1px solid #4f46e5; border-radius: 12px;">
               <h3 style="color: #c7d2fe; margin-top: 0;">🎉 High Savings Opportunity Identified!</h3>
               <p style="color: #94a3b8; font-size: 14px; line-height: 1.5;">Because your team stands to save <b>$${totalMonthlySavings.toFixed(2)}/mo</b> ($${totalAnnualSavings.toFixed(2)}/yr), you qualify for the exclusive <b>Credex Discounted AI Infrastructure Program</b>.</p>
               <p style="color: #94a3b8; font-size: 14px; line-height: 1.5;">We help startups secure deep credits on Cursor, Claude Pro, ChatGPT Enterprise, and raw APIs from companies that overforecasted.</p>
               <a href="https://calendly.com/credex-audit" style="display: inline-block; background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; margin-top: 10px;">Book a Free Credex Consultation</a>
             </div>`
          : `<div style="margin-top: 25px; padding: 15px; background-color: #0f172a; border: 1px solid #1e293b; border-radius: 12px; text-align: center;">
               <p style="color: #94a3b8; font-size: 13px; margin: 0;">We'll notify you automatically when new AI tool discount pools or structural optimizations apply to your stack.</p>
             </div>`;

        const emailHtml = `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #020617; color: #f1f5f9; padding: 40px 20px; max-width: 600px; margin: 0 auto; border-radius: 16px; border: 1px solid #1e293b;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h2 style="color: #4f46e5; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; margin: 0;">SPENDOPTIMA</h2>
              <p style="color: #64748b; font-size: 12px; margin-top: 4px; text-transform: uppercase; font-weight: bold; tracking: 1px;">AI spend audit by Credex</p>
            </div>
            
            <div style="background-color: #0b0f19; border: 1px solid #1e293b; border-radius: 12px; padding: 25px; margin-bottom: 25px;">
              <p style="color: #94a3b8; font-size: 15px; margin-top: 0;">Hello,</p>
              <p style="color: #94a3b8; font-size: 15px; line-height: 1.6;">Thank you for auditing your AI subscription budget. Our SpendOptima engine has completed analyzing your reported stack footprint.</p>
              
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 25px 0; padding: 15px; background-color: #020617; border-radius: 10px; border: 1px solid #1e293b;">
                <div style="padding: 10px; text-align: center;">
                  <div style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: bold;">Monthly Savings</div>
                  <div style="font-size: 22px; color: #10b981; font-weight: 800; margin-top: 4px;">$${totalMonthlySavings.toFixed(2)}</div>
                </div>
                <div style="padding: 10px; text-align: center;">
                  <div style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: bold;">Annual Savings</div>
                  <div style="font-size: 22px; color: #f59e0b; font-weight: 800; margin-top: 4px;">$${totalAnnualSavings.toFixed(2)}</div>
                </div>
              </div>

              <table style="width: 100%; border-collapse: collapse; margin: 20px 0; color: #94a3b8; font-size: 13px;">
                <tr>
                  <td style="padding: 6px 0; color: #64748b;">Current Monthly Spend:</td>
                  <td style="padding: 6px 0; text-align: right; font-weight: bold; color: #ef4444;">$${totalCurrentSpend.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #64748b;">Optimized Target Spend:</td>
                  <td style="padding: 6px 0; text-align: right; font-weight: bold; color: #38bdf8;">$${totalRecommendedSpend.toFixed(2)}</td>
                </tr>
              </table>

              <div style="text-align: center; margin-top: 30px; margin-bottom: 10px;">
                <a href="${reportUrl}" style="display: inline-block; background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px;">View Full Interactive CFO Report</a>
              </div>
            </div>

            ${consultationText}

            <div style="text-align: center; margin-top: 35px; border-t: 1px solid #1e293b; padding-t: 20px; font-size: 11px; color: #475569;">
              <p style="margin: 0 0 5px 0;">SpendOptima © 2026 is powered by Credex.</p>
              <p style="margin: 0;">Unsubscribe from notification alerts by replying to this email.</p>
            </div>
          </div>
        `;

        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${resendKey}`
          },
          body: JSON.stringify({
            from: "SpendOptima Audit <onboarding@resend.dev>",
            to: [email],
            subject: `Your Startup AI Spend Audit Report - $${totalMonthlySavings.toFixed(0)} Saved!`,
            html: emailHtml
          })
        });

        if (response.ok) {
          emailSent = true;
          emailStatus = "sent";
        } else {
          const errMsg = await response.text();
          console.error("Resend API error response:", response.status, errMsg);
          emailStatus = `failed_${response.status}`;
        }
      } catch (err) {
        console.error("Failed to transmit email via Resend:", err);
        emailStatus = "exception";
      }
    }

    return NextResponse.json({
      success: true,
      leadId,
      emailSent,
      emailStatus
    });
  } catch (error: any) {
    console.error("POST /api/lead server error:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}
