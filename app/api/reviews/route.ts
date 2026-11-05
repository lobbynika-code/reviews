import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { z } from "zod";

export const runtime = "nodejs";

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  experience: z.string().trim().min(5).max(3000),
  improvement: z.string().trim().max(3000).default(""),
  customerName: z.string().trim().max(120).default(""),
  phone: z.string().trim().max(40).default(""),
  requestCallback: z.boolean().default(false),
  website: z.string().max(500).optional().default(""),
});

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character] as string);
}

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();
    const parsed = reviewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Please check the required fields and try again." }, { status: 400 });
    }

    const review = parsed.data;
    // Silently accept bot submissions caught by the honeypot.
    if (review.website) return NextResponse.json({ ok: true });

    if (review.requestCallback && !review.phone) {
      return NextResponse.json({ error: "Please provide a phone number for the callback." }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const resendKey = process.env.RESEND_API_KEY;
    const managerEmail = process.env.REVIEW_MANAGER_EMAIL;
    const fromEmail = process.env.RESEND_FROM_EMAIL;

    if (!supabaseUrl || !serviceRoleKey || !resendKey || !managerEmail || !fromEmail) {
      console.error("Review service is missing required environment configuration.");
      return NextResponse.json({ error: "The review service is not configured yet. Please try again later." }, { status: 503 });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data, error: databaseError } = await supabase
      .from("reviews")
      .insert({
        rating: review.rating,
        experience: review.experience,
        improvement: review.improvement || null,
        customer_name: review.customerName || null,
        phone: review.phone || null,
        request_callback: review.requestCallback,
      })
      .select("id, created_at")
      .single();

    if (databaseError) {
      console.error("Could not save review:", databaseError.message);
      return NextResponse.json({ error: "We couldn't save your review. Please try again." }, { status: 500 });
    }

    const resend = new Resend(resendKey);
    const callbackText = review.requestCallback
      ? `<p><strong>Callback requested:</strong> Yes</p><p><strong>Customer name:</strong> ${escapeHtml(review.customerName || "Not provided")}</p><p><strong>Phone:</strong> ${escapeHtml(review.phone)}</p>`
      : "<p><strong>Callback requested:</strong> No</p>";

    const { error: emailError } = await resend.emails.send({
      from: fromEmail,
      to: [managerEmail],
      subject: `New Nafass B. customer review — ${review.rating}/5 stars`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:640px;margin:auto;color:#20231f">
          <h2>New customer review</h2>
          <p><strong>Rating:</strong> ${"★".repeat(review.rating)} (${review.rating}/5)</p>
          <h3>Customer experience</h3><p style="white-space:pre-wrap">${escapeHtml(review.experience)}</p>
          <h3>Suggested improvements</h3><p style="white-space:pre-wrap">${escapeHtml(review.improvement || "None provided")}</p>
          ${callbackText}
          <hr/><p style="color:#777;font-size:12px">Review ID: ${escapeHtml(String(data.id))} · Submitted: ${escapeHtml(String(data.created_at))}</p>
        </div>`,
    });

    if (emailError) {
      // The review is safely stored even if the notification provider is temporarily unavailable.
      console.error("Review saved but manager notification failed:", emailError);
      return NextResponse.json({ ok: true, notificationSent: false });
    }

    return NextResponse.json({ ok: true, notificationSent: true });
  } catch (error) {
    console.error("Review submission failed:", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
