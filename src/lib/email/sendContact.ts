/**
 * Server-side helper to send a contact form submission via Resend.
 *
 * STATUS: dormant — not imported anywhere. The form is in demo mode.
 * To activate (when client signs off):
 *   1. Add `output: "server"` (or `"hybrid"`) + `@astrojs/vercel` adapter to astro.config.mjs
 *   2. Create src/pages/api/contact.ts (template at the bottom of this file)
 *   3. Set RESEND_API_KEY and CLIENT_EMAIL env vars in Vercel
 *   4. Replace the setTimeout block in ContactForm.tsx with a fetch to /api/contact
 */

import { Resend } from "resend";
import { z } from "zod";

export const contactSchema = z.object({
  nom: z.string().min(2),
  email: z.string().email(),
  telephone: z.string().optional().or(z.literal("")),
  secteur: z.string().min(2),
  message: z.string().min(20),
});

export type ContactPayload = z.infer<typeof contactSchema>;

export type SendResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

export async function sendContactEmail(
  payload: ContactPayload,
  env: { RESEND_API_KEY?: string; CLIENT_EMAIL?: string }
): Promise<SendResult> {
  if (!env.RESEND_API_KEY || !env.CLIENT_EMAIL) {
    return { ok: false, error: "Missing RESEND_API_KEY or CLIENT_EMAIL" };
  }

  const resend = new Resend(env.RESEND_API_KEY);

  const html = `
    <div style="font-family: Inter, system-ui, sans-serif; color: #111; line-height: 1.6;">
      <h2 style="color: #D4AF37; border-bottom: 1px solid #eee; padding-bottom: 8px;">
        Nouvelle demande — Groupe Kara
      </h2>
      <p><strong>Nom :</strong> ${escape(payload.nom)}</p>
      <p><strong>Courriel :</strong> <a href="mailto:${escape(payload.email)}">${escape(payload.email)}</a></p>
      ${payload.telephone ? `<p><strong>Téléphone :</strong> ${escape(payload.telephone)}</p>` : ""}
      <p><strong>Secteur :</strong> ${escape(payload.secteur)}</p>
      <p><strong>Message :</strong></p>
      <blockquote style="border-left: 3px solid #D4AF37; padding-left: 12px; margin-left: 0; color: #444;">
        ${escape(payload.message).replace(/\n/g, "<br/>")}
      </blockquote>
    </div>
  `;

  const result = await resend.emails.send({
    from: "Groupe Kara <noreply@groupekara.ca>",
    to: env.CLIENT_EMAIL,
    replyTo: payload.email,
    subject: `Nouvelle demande — ${payload.nom} (${payload.secteur})`,
    html,
  });

  if (result.error) return { ok: false, error: result.error.message };
  if (!result.data) return { ok: false, error: "No data returned from Resend" };
  return { ok: true, id: result.data.id };
}

function escape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/* ────────────────────────────────────────────────────────────────────────────
   ENDPOINT TEMPLATE — copy to `src/pages/api/contact.ts` to activate.
   Requires `output: "server"` (or `"hybrid"`) + `@astrojs/vercel` in astro.config.mjs.

   import type { APIRoute } from "astro";
   import { contactSchema, sendContactEmail } from "@/lib/email/sendContact";

   export const prerender = false;

   export const POST: APIRoute = async ({ request, locals }) => {
     try {
       const body = await request.json();
       const parsed = contactSchema.safeParse(body);
       if (!parsed.success) {
         return new Response(JSON.stringify({ ok: false, error: "Invalid payload" }), { status: 400 });
       }
       const result = await sendContactEmail(parsed.data, {
         RESEND_API_KEY: import.meta.env.RESEND_API_KEY,
         CLIENT_EMAIL: import.meta.env.CLIENT_EMAIL,
       });
       return new Response(JSON.stringify(result), {
         status: result.ok ? 200 : 500,
         headers: { "content-type": "application/json" },
       });
     } catch {
       return new Response(JSON.stringify({ ok: false, error: "Server error" }), { status: 500 });
     }
   };
   ──────────────────────────────────────────────────────────────────────────── */
