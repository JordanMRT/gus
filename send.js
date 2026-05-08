// ═══════════════════════════════════════════════════
// GUS — send.js
// Envoie le ticket.png par Gmail via Nodemailer
// ═══════════════════════════════════════════════════

require('dotenv').config();
const { createTransport } = require('nodemailer');
const path = require('path');
const { generateTicket } = require('./generate');

// Noms des jours et mois pour le sujet du mail
const JOURS = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];
const MOIS  = ['janvier','février','mars','avril','mai','juin',
               'juillet','août','septembre','octobre','novembre','décembre'];

function getSubject() {
  const d = new Date();
  return `GUS ✦ ${JOURS[d.getDay()]} ${d.getDate()} ${MOIS[d.getMonth()]}`;
}

async function sendTicket() {
  // 1. Génère le ticket
  console.log('[GUS] Génération du ticket...');
  const imagePath = await generateTicket();

  // 2. Configure le transporteur Gmail
  // IMPORTANT : utilise un "Mot de passe d'application" Google,
  // pas ton vrai mot de passe Gmail (voir README)
  const transporter = createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,   // ton adresse Gmail
      pass: process.env.GMAIL_PASS,   // mot de passe d'application Google
    },
  });

  // 3. Compose le mail
  const mailOptions = {
    from: `"G.U.S." <${process.env.GMAIL_USER}>`,
    to: process.env.RECIPIENT_EMAIL,  // destinataire (peut être toi-même)
    subject: getSubject(),
    text: 'Ton ticket GUS du matin est arrivé. Bonne journée.',
    html: `
      <div style="background:#1a1a1a;padding:24px;text-align:center;font-family:monospace;">
        <p style="color:#555;font-size:11px;letter-spacing:3px;margin-bottom:16px">
          ◈ SYSTÈME GUS — TICKET DU MATIN ◈
        </p>
        <img src="cid:ticket_gus" 
             alt="Ticket GUS" 
             style="max-width:400px;width:100%;border-radius:4px;" />
        <p style="color:#333;font-size:10px;letter-spacing:2px;margin-top:16px">
          conserve ce ticket. il ne passera qu'une fois.
        </p>
      </div>
    `,
    attachments: [
      {
        filename: 'ticket-gus.png',
        path: imagePath,
        cid: 'ticket_gus',  // référencé dans le HTML du mail
      },
    ],
  };

  // 4. Envoie
  console.log('[GUS] Envoi du mail...');
  const info = await transporter.sendMail(mailOptions);
  console.log(`[GUS] Mail envoyé → ${info.messageId}`);
}

sendTicket().catch(err => {
  console.error('[GUS] Erreur envoi :', err);
  process.exit(1);
});
