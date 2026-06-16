const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.set('trust proxy', 1); // Railway sits behind a proxy; needed for real client IPs
app.use(express.json({ limit: '12kb' }));

// Express handles HTTP Range requests out of the box — required for
// smooth video seeking (the hero scrubs currentTime on scroll).
app.use(
  '/assets',
  express.static(path.join(__dirname, 'assets'), {
    maxAge: '30d',
    immutable: true,
  })
);

/* ------------------------------------------------------------
   Contact form endpoint
   Posts an enquiry as an email via the Resend HTTP API. The
   destination address and API key live only in environment
   variables — never in the client. No SDK: Node's global fetch.

   Env vars (set in Railway):
     RESEND_API_KEY  - Resend API key (required)
     CONTACT_TO      - inbox that receives enquiries (required)
     CONTACT_FROM    - verified sender, e.g. "Price Offices <hello@priceoffices.com>"
                       (optional; defaults to Resend's shared onboarding sender,
                        which can only deliver to the Resend account's own email)
   ------------------------------------------------------------ */

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const CONTACT_TO = process.env.CONTACT_TO;
const CONTACT_FROM = process.env.CONTACT_FROM || 'Price Offices <onboarding@resend.dev>';

// Naive in-memory rate limit: max 5 submissions per IP per 10 minutes.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map();

function rateLimited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_PER_WINDOW;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const clip = (v, n) => String(v == null ? '' : v).trim().slice(0, n);

app.post('/api/contact', async (req, res) => {
  const body = req.body || {};

  // Honeypot: real users leave this empty. Bots fill it — pretend success.
  if (clip(body.company, 200)) {
    return res.json({ ok: true });
  }

  const name = clip(body.name, 120);
  const email = clip(body.email, 200);
  const message = clip(body.message, 4000);

  if (!name || !email || !message) {
    return res.status(400).json({ ok: false, error: 'Please fill in every field.' });
  }
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ ok: false, error: 'Please enter a valid email address.' });
  }

  if (rateLimited(req.ip)) {
    return res.status(429).json({ ok: false, error: 'Too many messages — please try again shortly.' });
  }

  if (!RESEND_API_KEY || !CONTACT_TO) {
    console.error('Contact endpoint not configured: set RESEND_API_KEY and CONTACT_TO.');
    return res.status(503).json({ ok: false, error: 'The contact form is not available right now.' });
  }

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: CONTACT_FROM,
        to: [CONTACT_TO],
        reply_to: email,
        subject: `New enquiry from ${name} — priceoffices.com`,
        text: `Name:  ${name}\nEmail: ${email}\n\n${message}\n`,
      }),
    });

    if (!r.ok) {
      const detail = await r.text().catch(() => '');
      console.error('Resend error', r.status, detail);
      return res.status(502).json({ ok: false, error: 'Could not send your message. Please try again later.' });
    }

    return res.json({ ok: true });
  } catch (err) {
    console.error('Contact send failed', err);
    return res.status(502).json({ ok: false, error: 'Could not send your message. Please try again later.' });
  }
});

app.use(express.static(__dirname, { maxAge: '5m' }));

app.listen(port, '0.0.0.0', () => {
  console.log(`Price Offices site listening on ${port}`);
});
