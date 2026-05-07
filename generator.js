const playwright = require('playwright');
const fs = require('fs');
const messages = require('./messages.json');
const words = require('./words.json');

(async () => {
    // 1. Logique de sélection quotidienne
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now - start;
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

    const dailyMessage = messages[dayOfYear % messages.length];
    const dailyWord = words[dayOfYear % words.length];

    // 2. Lecture et injection dans le template
    let html = fs.readFileSync('template.html', 'utf8');
    html = html.replace('{{message}}', dailyMessage)
               .replace('{{word}}', dailyWord.word)
               .replace('{{definition}}', dailyWord.def)
               .replace('{{date}}', now.toLocaleDateString('fr-FR'))
               .replace('{{id}}', dayOfYear.toString().padStart(4, '0'));

    // 3. Rendu de l'image (Simulation thermique)
    const browser = await playwright.chromium.launch();
    const page = await browser.newPage();
    await page.setViewportSize({ width: 300, height: 800 });
    await page.setContent(html);
    await page.screenshot({ path: 'gus-ticket.png', fullPage: true });

    await browser.close();
    console.log("Ticket GUS généré : gus-ticket.png");
})();