# EKADANTA TRADERS website

React + Tailwind frontend, Node.js backend, and a **real enquiry system**: when a customer presses **SEND ENQUIRY**, the backend validates the form, sends an email to `ekadantatraders.0208@gmail.com`, and the website shows "submitted successfully" **only after the email provider has accepted the message**. If sending fails, the customer sees an error instead.

## 1. Project structure

```
ekadanta-traders/
├── package.json            Root: backend dependency (nodemailer) + scripts
├── .env.example            Copy to .env and fill in (never commit .env)
├── render.yaml             Optional one-click config for Render
├── server/
│   ├── src/
│   │   ├── index.js        Starts the server
│   │   ├── app.js          API (/api/contact, /api/health, /api/admin/enquiries) + serves the website
│   │   ├── config.js       Reads environment variables
│   │   ├── validate.js     Server-side validation + sanitising
│   │   ├── email.js        Email template + Gmail SMTP / Resend sending
│   │   ├── store.js        SQLite enquiry storage
│   │   ├── rateLimit.js    Spam / flood protection
│   │   └── turnstile.js    Cloudflare Turnstile CAPTCHA check (optional)
│   ├── scripts/check-email.js   "npm run check-email": sends one real test email
│   └── test/               Automated tests ("npm test")
└── client/                 The website (Vite + React + Tailwind)
    ├── index.html
    ├── tailwind.config.js, postcss.config.js, vite.config.js
    └── src/
        ├── App.jsx                     Wires every ENQUIRE NOW button to the form
        ├── config/site.js              Company details + the six services (edit text here)
        ├── lib/validate.js, api.js     Form validation + call to /api/contact
        └── components/                 Header, Hero, Services, ServiceCard, Contact,
                                        EnquiryForm, Turnstile, Footer, WhatsAppFloat, artwork
```

## 2. What you need installed

- **Node.js 22.13 or newer** (https://nodejs.org). Check with `node -v`.

## 3. Install and run locally

```bash
cd ekadanta-traders
npm install                      # backend dependency
npm --prefix client install      # website dependencies
cp .env.example .env             # then edit .env (see section 4 or 5)
```

Development (two terminals):

```bash
npm run dev:server               # API on http://localhost:3000
npm run dev:client               # website on http://localhost:5173
```

Production-style (one terminal, one address):

```bash
npm run build                    # builds the website into client/dist
npm start                        # website + API on http://localhost:3000
```

## 4. Connect your Gmail (Gmail SMTP with an App Password)

Use this when running on your own computer, a VPS, or any host that allows SMTP.
**Do not use your normal Gmail password. Never put the password in the code.**

1. Sign in to the Google account `ekadantatraders.0208@gmail.com`.
2. Turn on **2-Step Verification** (Google Account > Security). App Passwords only exist when it is on.
3. Open **App passwords** (Google Account > Security, or search "App passwords" in the account search box).
4. Type a name such as `Ekadanta website` and press **Create**.
5. Google shows a 16-character password like `abcd efgh ijkl mnop`. Copy it now; Google will not show it again.
6. In the project, open the file `.env` (copied from `.env.example`) and set:
   ```
   EMAIL_PROVIDER=gmail
   EMAIL_USER=ekadantatraders.0208@gmail.com
   EMAIL_PASSWORD=abcd efgh ijkl mnop
   ```
   (Spaces are fine; they are removed automatically.)
7. Check it: `npm run check-email`. You should see `SUCCESS` and a test email in the inbox (look in Spam too).

`.env` is listed in `.gitignore`, so it is not uploaded to GitHub. On a hosting dashboard you type the same values into "Environment Variables" instead of using a file.

SMTP settings used: host `smtp.gmail.com`, port `465` (SSL). To use port `587`, set `SMTP_PORT=587`.

> **Important for deployment:** many hosts block SMTP. For example Render blocks outbound SMTP ports (25, 465, 587) on free web services. If `npm run check-email` times out on your host, use Resend (section 5).

## 5. Alternative: Resend (works on every host, recommended for production)

Resend sends email over HTTPS, so hosts cannot block it.

1. Create a free account at https://resend.com **using `ekadantatraders.0208@gmail.com`**. This matters: without a verified domain, Resend's test sender can only deliver to the email address of your Resend account, which is exactly your enquiry inbox.
2. In Resend, open **API Keys > Create API Key** (permission: Sending access) and copy the key (starts with `re_`).
3. In `.env` (or the hosting dashboard):
   ```
   EMAIL_PROVIDER=resend
   EMAIL_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
   EMAIL_FROM=EKADANTA TRADERS <onboarding@resend.dev>
   ```
4. Run `npm run check-email`.

Emails from the test sender (`onboarding@resend.dev`) can land in Spam the first time. Mark them "Not spam" once. Later, when you own a domain (for example `ekadantatraders.in`), verify it in Resend and change `EMAIL_FROM` to `EKADANTA TRADERS <enquiries@yourdomain>` for better delivery.

## 6. Test the full flow

1. `npm run build && npm start`, open http://localhost:3000.
2. Press **ENQUIRE NOW** under **Construction**. The form opens with **Construction** already selected.
3. Fill name, phone, email, message and press **SEND ENQUIRY**.
4. Success message appears, and an email arrives at `ekadantatraders.0208@gmail.com` with the subject `New Enquiry – EKADANTA TRADERS – Construction`. Press **Reply** in Gmail: the reply goes to the customer.
5. Failure test: stop the internet or put a wrong `EMAIL_PASSWORD`, submit again. The website shows "Your enquiry could not be sent right now..." and no success message.

Automated tests: `npm test` (validation, email format, Gmail and Resend paths, rate limiting, CORS, CAPTCHA, admin protection, success and failure responses).

Quick API check without the website:

```bash
curl -i -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","phone":"9876543210","email":"test@example.com","service":"Construction","message":"Please call me about a quote."}'
```

If email is not configured the API answers `503 email_not_configured` and the website shows the failure message. The server log tells you exactly which variable is missing.

## 7. Deploy to production

The simplest setup is **one service** that serves both the website and the API (no CORS problems).

### Option A: Render (easy; use Resend because free Render blocks SMTP)

1. Put the project on GitHub (the `.gitignore` already keeps `.env` out).
2. In Render: **New > Web Service**, connect the repository.
3. Settings: Build command `npm install && npm run build`, Start command `npm start`. Add environment variable `NODE_VERSION` = `22`. (Or use **New > Blueprint** and pick `render.yaml`.)
4. Environment variables: `NODE_ENV=production`, `ENQUIRY_RECIPIENT=ekadantatraders.0208@gmail.com`, `EMAIL_PROVIDER=resend`, `EMAIL_API_KEY=<your key>`, `EMAIL_FROM=EKADANTA TRADERS <onboarding@resend.dev>`.
5. Deploy, then open `https://<your-service>.onrender.com/api/health`. It should show `{"ok":true,"emailConfigured":true}`.
6. Send a real enquiry from the live site.

Notes: Render Free web services spin down after inactivity, so the first visit after a quiet period is slow. Their filesystem is temporary: the SQLite database is lost on spin-down, restart, or redeploy, and Free web services cannot attach a persistent disk. For durable reviews and enquiry records, use a paid web service with a persistent disk and set `DATABASE_PATH` to a file under its mount path, or configure a managed database with a suitable retention plan. Do not use a temporary database as the only copy of an approved review.

### Option B: Your own VPS (Ubuntu) with Gmail SMTP

```bash
# on the server
git clone <your repo> && cd ekadanta-traders
npm install && npm run build
cp .env.example .env && nano .env          # Gmail settings + NODE_ENV=production
sudo npm i -g pm2 && pm2 start server/src/index.js --name ekadanta && pm2 save && pm2 startup
```

Put nginx in front (proxy `your-domain` to `127.0.0.1:3000`) and get HTTPS with `certbot --nginx`. Keep `TRUST_PROXY_HOPS=1` (nginx is one proxy).

### Separate frontend hosting (Netlify, Vercel, Cloudflare Pages)

Possible, but not needed. If you do it: build the client with `VITE_API_URL=https://your-api-domain` and set `CORS_ALLOWED_ORIGINS=https://your-website-domain` on the backend.

### Connect your domain

1. In your host (for Render: service > Settings > Custom Domains), add `www.yourdomain.com` (and the bare domain).
2. At your domain registrar, add the DNS records the host shows (usually a `CNAME` for `www`, and `A`/`ALIAS` for the bare domain).
3. Wait for DNS (minutes to a few hours); HTTPS is issued automatically.
4. If you put Cloudflare's orange-cloud proxy in front, set `TRUST_PROXY_HOPS=2`.

## 8. How the enquiry system works

```
Customer -> form (browser checks fields) -> POST /api/contact
   backend: rate limit -> read JSON -> honeypot check -> validate + sanitise
         -> CAPTCHA check (if enabled) -> email provider (Gmail SMTP or Resend)
         -> only if the provider ACCEPTS the email: answer 200 {ok:true}
         -> otherwise answer an error (502 / 503)
   enquiry is saved to SQLite (status "sent" or "failed") either way
Website: shows the success text only when it receives 200 {ok:true}
```

- Credentials live only in environment variables on the server. The browser never receives them; only `VITE_*` values (public keys) are ever included in the website.
- The email has the subject `New Enquiry – EKADANTA TRADERS – [Service]`, the clean layout you specified, and the customer's address as **Reply-To**.
- Security: server-side validation and sanitising (HTML stripped, hidden characters removed, everything escaped in the email), header-injection safe, max request size, per-visitor and global rate limits, hidden honeypot field, CORS allow-list, security headers (CSP, frame blocking, HSTS in production), optional Cloudflare Turnstile CAPTCHA.
- Saved enquiries are never public. To read them yourself, set `ADMIN_TOKEN` to a long random value and call `GET /api/admin/enquiries` with the header `Authorization: Bearer <token>`.

### Optional: CAPTCHA (Cloudflare Turnstile, free)

1. Cloudflare dashboard > Turnstile > Add site. Copy the **Site key** and **Secret key**.
2. Set `VITE_TURNSTILE_SITE_KEY=<site key>` (before `npm run build`) and `TURNSTILE_SECRET_KEY=<secret key>`.
3. Rebuild and redeploy. The form now shows the security check, and the server rejects submissions without it.

## 9. Changing content

- Company details, phone numbers, WhatsApp number and service texts: `client/src/config/site.js`.
- WhatsApp buttons use `+91 8054547411` (the first number). Change `whatsapp.number` there if another number is on WhatsApp.
- If you add or rename a service, also update the list in `server/src/validate.js`.

### Replacing the artwork with real photos

Service cards and service detail pages use the photographs in `client/public/images/` named for each service id (for example, `property.jpg` and `construction.jpg`). Keep a matching image for every id in `client/src/config/site.js`. The homepage hero still uses the built-in SVG illustration.
