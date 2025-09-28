# G5 Bygg AB – webbplats och kontakt-API

Detta projekt innehåller G5 Bygg AB:s marknadsföringssida samt ett enkelt Node.js-API för att ta emot kontaktförfrågningar och skicka e-post via SMTP.

## Kom igång

1. Installera beroenden:
   ```bash
   npm install
   ```
2. Skapa en `.env` baserat på `.env.example` och fyll i dina SMTP-uppgifter.
3. Starta servern lokalt:
   ```bash
   npm start
   ```
4. Besök `http://localhost:3000/kontakt.html` och testa att skicka formuläret.

## Miljövariabler

| Variabel | Beskrivning |
| --- | --- |
| `PORT` | Valfri port för Express-servern (standard `3000`). |
| `SMTP_HOST` | SMTP-serverns värdnamn. |
| `SMTP_PORT` | Porten för SMTP-servern. |
| `SMTP_SECURE` | Sätt till `true` om SMTP-servern kräver SSL (t.ex. port 465). |
| `SMTP_USER` | SMTP-användarnamn eller API-nyckel. |
| `SMTP_PASS` | SMTP-lösenord eller hemlighet. |
| `MAIL_FROM` | Avsändaradress som visas i e-postmeddelandet. Faller tillbaka till `SMTP_USER`. |
| `CONTACT_RECIPIENT` | Mottagarens e-postadress. Faller tillbaka till `SMTP_USER`. |

## Kontakt-API

- **Endpoint:** `POST /api/contact`
- **Payload:** JSON med fälten `first_name`, `last_name`, `email`, `phone` (valfritt) och `message`.
- **Svar:**
  - `200 OK` – `{ "message": "Tack! ..." }`
  - `400 Bad Request` – `{ "error": "..." }` när validering misslyckas.
  - `500 Internal Server Error` – `{ "error": "..." }` när e-posttjänsten inte kan nås eller misslyckas.

## Utveckling

Använd `npm run dev` för att starta servern med [nodemon](https://github.com/remy/nodemon) och automatiska omstarter vid filändringar.
