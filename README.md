# Nafass B. Customer Reviews

A mobile-friendly customer feedback form. Customers can submit a rating, describe their experience, suggest improvements, and optionally request a manager callback with their phone number. The app saves each review in Supabase and emails the manager through Resend. Customers do not need to provide or use an email address.

## Stack
- Next.js App Router
- Supabase Postgres for review storage
- Resend for server-side manager email notifications
- Zod for request validation

## Local setup
1. Install Node.js 20 or newer.
2. Run `npm install`.
3. Copy `.env.example` to `.env.local` and fill in the values below.
4. Run the SQL in `supabase/schema.sql` in the Supabase SQL Editor.
5. Run `npm run dev` and open http://localhost:3000.

## Environment variables
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL.
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service-role key. Server only; never expose it to the browser.
- `RESEND_API_KEY`: Resend API key.
- `REVIEW_MANAGER_EMAIL`: Manager inbox that receives notifications.
- `RESEND_FROM_EMAIL`: Verified sender address in Resend, e.g. a verified address on your company domain.

The customer never enters an email address. Notifications are sent from the configured company sender to the configured manager inbox.

## Deployment
Deploy the repository to Vercel (or another Next.js host), add all environment variables to the hosting project, and deploy. Run the SQL setup once in Supabase. Verify the sender domain in Resend before expecting email delivery.

## Notes
- Reviews are saved before the email notification is sent. If Resend is temporarily unavailable, the review remains in the database; the API response records that the notification was not sent.
- This first version provides the customer submission flow and manager email notifications. A private review-management dashboard should be added with manager authentication before exposing review records in a browser.
- Add an appropriate privacy notice and retention policy before production use. Consider adding rate limiting and CAPTCHA/Turnstile before publishing the public form widely.
