// ═══════════════════════════════════════════════════
// GUS — generate.js
// Ouvre ticket.html avec Puppeteer, génère ticket.png
// ═══════════════════════════════════════════════════

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function generateTicket() {
  console.log('[GUS] Démarrage de la génération...');

  // Crée le dossier output si nécessaire
  const outputDir = path.join(__dirname, 'output');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 500, height: 900, deviceScaleFactor: 2 });

  // Charge le fichier HTML local
  const htmlPath = 'file://' + path.join(__dirname, 'index.html');
  await page.goto(htmlPath, { waitUntil: 'networkidle0' });

  // Attend que les polices Google soient chargées
  await new Promise(r => setTimeout(r, 2000));

// Déclenche la génération du ticket
await page.click('#btn-gen');

// Attend que la météo soit chargée et le ticket rendu
await new Promise(r => setTimeout(r, 4000));

// Révèle la réponse de la blague pour le screenshot (invisible sur le web)
await page.evaluate(() => {
  const btn = document.getElementById('blague-rep');
  if (btn) {
    btn.textContent = window.currentReponse || '...';
    btn.style.border = 'none';
    btn.style.padding = '0';
    btn.style.cursor = 'default';
    btn.style.color = '#666';
    btn.style.fontStyle = 'italic';
    btn.style.display = 'block';
    btn.style.marginTop = '4px';
  }
});

  // Trouve l'élément ticket pour un screenshot précis
  const ticketEl = await page.$('.ticket-machine');
  
  if (!ticketEl) {
    console.error('[GUS] Élément .ticket-machine introuvable');
    await browser.close();
    process.exit(1);
  }

  const outputPath = path.join(outputDir, 'ticket.png');

  await ticketEl.screenshot({
    path: outputPath,
    type: 'png',
  });

  await browser.close();

  console.log(`[GUS] Ticket généré → ${outputPath}`);
  return outputPath;
}

// Export pour utilisation dans send.js
module.exports = { generateTicket };

// Exécution directe si appelé seul
if (require.main === module) {
  generateTicket().catch(err => {
    console.error('[GUS] Erreur génération :', err);
    process.exit(1);
  });
}
