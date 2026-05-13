// ═══════════════════════════════════════════════════
// GUS — generate.js
// Ouvre ticket.html avec Puppeteer, génère ticket.png
// ═══════════════════════════════════════════════════

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function generateTicket() {
  console.log('[GUS] Démarrage de la génération...');

  const outputDir = path.join(__dirname, 'output');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--font-render-hinting=none',
    ],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 500, height: 900, deviceScaleFactor: 2 });

  // Charge le fichier HTML — domcontentloaded est suffisant
  const htmlPath = 'file://' + path.join(__dirname, 'index.html');
  await page.goto(htmlPath, { waitUntil: 'domcontentloaded' });

  // Déclenche la génération
  await page.click('#btn-gen');

  // Attend que le ticket soit rendu en surveillant le statut
  // plutôt qu'un timeout fixe
  await page.waitForFunction(
    () => {
      const status = document.getElementById('status');
      return status && status.textContent.includes('imprimé');
    },
    { timeout: 15000 }
  );

  // Petite pause pour s'assurer que le rendu visuel est complet
  await new Promise(r => setTimeout(r, 500));

  // Révèle la réponse de la blague
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
    // Révèle la réponse de l'énigme logique
    const enigmeBtn = document.getElementById('enigme-rep');
    if (enigmeBtn) {
      const rep = enigmeBtn.dataset.rep;
      enigmeBtn.textContent = rep;
      enigmeBtn.style.border = 'none';
      enigmeBtn.style.padding = '0';
      enigmeBtn.style.cursor = 'default';
      enigmeBtn.style.color = '#555';
      enigmeBtn.style.fontStyle = 'italic';
    }
  });

  const ticketEl = await page.$('.ticket-machine');

  if (!ticketEl) {
    console.error('[GUS] Élément .ticket-machine introuvable');
    await browser.close();
    process.exit(1);
  }

  const outputPath = path.join(outputDir, 'ticket.png');
  await ticketEl.screenshot({ path: outputPath, type: 'png' });
  await browser.close();

  console.log(`[GUS] Ticket généré → ${outputPath}`);
  return outputPath;
}

module.exports = { generateTicket };

if (require.main === module) {
  generateTicket().catch(err => {
    console.error('[GUS] Erreur génération :', err);
    process.exit(1);
  });
}
