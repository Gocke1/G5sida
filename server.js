const path = require('path');
const express = require('express');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

let mailTransporter;

function getTransporter() {
  if (mailTransporter) {
    return mailTransporter;
  }

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    throw new Error('E-posttjänsten är inte korrekt konfigurerad. Kontrollera SMTP-uppgifterna.');
  }

  const secure = SMTP_SECURE ? SMTP_SECURE.toLowerCase() === 'true' : Number(SMTP_PORT) === 465;

  mailTransporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS
    }
  });

  return mailTransporter;
}

function escapeHtml(input = '') {
  return String(input)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function buildMessageBody({ first_name, last_name, phone, email, message }) {
  const fullName = [first_name, last_name].filter(Boolean).join(' ');

  const text = `Nytt meddelande från kontaktformuläret på g5bygg.com\n\n` +
    `Namn: ${fullName}\n` +
    (phone ? `Telefon: ${phone}\n` : '') +
    `E-post: ${email}\n\n` +
    `Meddelande:\n${message}`;

  const html = `<!doctype html>
  <html lang="sv">
    <body>
      <h2>Nytt meddelande från kontaktformuläret</h2>
      <p><strong>Namn:</strong> ${escapeHtml(fullName)}</p>
      ${phone ? `<p><strong>Telefon:</strong> ${escapeHtml(phone)}</p>` : ''}
      <p><strong>E-post:</strong> ${escapeHtml(email)}</p>
      <h3>Meddelande</h3>
      <p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
    </body>
  </html>`;

  return { text, html, subject: `Ny kontaktförfrågan från ${fullName || 'okänd avsändare'}` };
}

app.post('/api/contact', async (req, res) => {
  const firstName = (req.body?.first_name || '').toString().trim();
  const lastName = (req.body?.last_name || '').toString().trim();
  const email = (req.body?.email || '').toString().trim();
  const message = (req.body?.message || '').toString().trim();
  const phone = (req.body?.phone || '').toString().trim();

  if (!firstName || !lastName || !email || !message) {
    return res.status(400).json({ error: 'Vänligen fyll i namn, efternamn, e-post och meddelande.' });
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    return res.status(400).json({ error: 'E-postadressen verkar ogiltig. Kontrollera och försök igen.' });
  }

  if (message.length > 5000) {
    return res.status(400).json({ error: 'Meddelandet är för långt. Försök korta ner det något.' });
  }

  try {
    const transporter = getTransporter();
    const { text, html, subject } = buildMessageBody({
      first_name: firstName,
      last_name: lastName,
      email,
      message,
      phone
    });

    await transporter.sendMail({
      from: process.env.MAIL_FROM || process.env.SMTP_USER,
      to: process.env.CONTACT_RECIPIENT || process.env.SMTP_USER,
      replyTo: email,
      subject,
      text,
      html
    });

    return res.json({ message: 'Tack! Ditt meddelande har skickats och vi återkommer snarast.' });
  } catch (error) {
    console.error('Fel vid utskick av e-post:', error);
    return res.status(500).json({ error: 'Vi kunde inte skicka ditt meddelande just nu. Försök igen senare.' });
  }
});

app.use((err, req, res, next) => {
  console.error('Internt serverfel:', err);
  res.status(500).json({ error: 'Ett internt fel uppstod.' });
});

app.listen(PORT, () => {
  console.log(`Servern är igång på http://localhost:${PORT}`);
});
