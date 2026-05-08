# G.U.S. — Générateur d'Utilité Sensible

Ticket thermique quotidien envoyé chaque matin à 8h30 par mail.

---

## Structure du projet

```
gus/
├── ticket.html                     ← le ticket (ton fichier HTML)
├── generate.js                     ← Puppeteer → screenshot PNG
├── send.js                         ← envoi Gmail
├── .env                            ← tes secrets (jamais sur GitHub)
├── .env.example                    ← modèle du .env
├── .gitignore
├── package.json
├── output/                         ← tickets générés (ignoré par git)
└── .github/
    └── workflows/
        └── gus-daily.yml           ← automatisation GitHub Actions
```

---

## Mise en marche — étape par étape

### 1. Installer Node.js

Télécharge la version LTS sur nodejs.org et installe-la.
Vérifie dans le Terminal :

```bash
node --version
npm --version
```

### 2. Créer le dossier et installer les dépendances

```bash
# Crée le dossier du projet
mkdir gus
cd gus

# Copie tous les fichiers ici (ticket.html, generate.js, send.js, etc.)

# Installe les dépendances Node
npm install
```

L'installation de Puppeteer télécharge automatiquement Chromium (~150 Mo).
C'est normal, c'est lui qui va "imprimer" le ticket.

### 3. Configurer Gmail — mot de passe d'application

⚠ Tu ne peux PAS utiliser ton vrai mot de passe Gmail.
Google demande un "Mot de passe d'application" dédié.

**Étapes :**
1. Va sur myaccount.google.com
2. Sécurité → Validation en deux étapes (active-la si ce n'est pas fait)
3. Sécurité → Mots de passe des applications
4. Crée un mot de passe pour "GUS" (type : Autre)
5. Google te donne un code de 16 caractères type `xxxx xxxx xxxx xxxx`
6. C'est ce code qui va dans GMAIL_PASS

### 4. Créer le fichier .env

```bash
cp .env.example .env
```

Ouvre `.env` et remplis :

```
GMAIL_USER=ton.adresse@gmail.com
GMAIL_PASS=xxxx xxxx xxxx xxxx
RECIPIENT_EMAIL=ton.adresse@gmail.com
```

### 5. Tester en local

```bash
# Tester juste la génération du PNG :
npm run generate
# → ouvre output/ticket.png pour vérifier

# Tester l'envoi complet (génère + envoie) :
npm run send
# → tu dois recevoir le mail dans quelques secondes
```

---

## Automatisation avec GitHub Actions (gratuit)

GitHub Actions permet d'exécuter le script chaque matin sur les serveurs
de GitHub, gratuitement, sans que ton Mac soit allumé.

### 1. Créer un repo GitHub

- Va sur github.com → New repository
- Nomme-le `gus` (private ou public, à toi de choisir)
- Ne pas initialiser avec un README (tu vas pousser ton dossier existant)

### 2. Pousser le projet

```bash
cd gus
git init
git add .
git commit -m "GUS v1.0 — premier ticket"
git branch -M main
git remote add origin https://github.com/TON_USERNAME/gus.git
git push -u origin main
```

⚠ Le `.gitignore` exclut automatiquement `.env` — tes secrets ne partiront
pas sur GitHub.

### 3. Configurer les secrets GitHub

Sur github.com → ton repo gus → Settings → Secrets and variables → Actions

Ajoute trois secrets (bouton "New repository secret") :

| Nom              | Valeur                        |
|------------------|-------------------------------|
| GMAIL_USER       | ton.adresse@gmail.com         |
| GMAIL_PASS       | xxxx xxxx xxxx xxxx           |
| RECIPIENT_EMAIL  | ton.adresse@gmail.com         |

### 4. Activer GitHub Actions

- Onglet "Actions" de ton repo
- Si c'est la première fois, clique "I understand my workflows, enable them"
- Le workflow `GUS — Ticket quotidien` apparaît dans la liste

### 5. Tester manuellement

Dans l'onglet Actions → "GUS — Ticket quotidien" → "Run workflow"
→ Tu dois recevoir le mail dans 2-3 minutes.

Ensuite, il s'exécutera automatiquement chaque matin à 6h30 UTC (8h30 Paris).

---

## Heure d'été / heure d'hiver

Le cron GitHub Actions tourne en UTC.
- Heure d'hiver (oct→mars) : Paris = UTC+1 → `30 7 * * *` pour 8h30
- Heure d'été (mars→oct) : Paris = UTC+2 → `30 6 * * *` pour 8h30

Le fichier `gus-daily.yml` utilise `30 6 * * *` (heure d'été).
En hiver tu peux le changer en `30 7 * * *` ou simplement accepter
que le ticket arrive à 7h30 en hiver.

---

## Ajouter du contenu à la base de données

Tout le contenu (messages, mots, blagues, découvertes, collectionnables)
est dans les tableaux `DB` du fichier `ticket.html`.

Pour ajouter un message :
```javascript
// Dans ticket.html, dans DB.messages[]
"Ton nouveau message du matin ici.",
```

La rotation se fait automatiquement par `pickByDay()`.

---

## Dépannage

**Puppeteer plante au lancement**
→ Sur Mac Apple Silicon (M1/M2/M3), ajoute dans generate.js :
```javascript
executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
```

**Le mail arrive en spam**
→ Marque-le comme "non spam" une fois, Gmail s'en souviendra.

**GitHub Actions échoue**
→ Onglet Actions → clique sur le run raté → lis les logs ligne par ligne.
L'erreur est toujours explicite.

**Erreur "Invalid login" Gmail**
→ Vérifie que la validation en deux étapes est activée sur ton compte Google
avant de créer le mot de passe d'application.
