
# 🛠️ Fixio – Projectplanning voor vakmensen en doe-het-zelvers

**Fixio** is een mobile-first webapplicatie voor zelfstandige klussers, installateurs en kleine bouwteams. De app helpt gebruikers om klussen/projecten te plannen, taken te verdelen, materialen te beheren en stap-voor-stap begeleiding te krijgen via AI.

---

## 🚀 Tech Stack

- **Next.js (App Router)**
- **TypeScript**
- **Tailwind CSS** (met **DaisyUI** als componentlib)
- **Supabase** (auth + database + storage)
- **Vercel** voor hosting
- **Mobile-first, PWA-ready**

---

## 📦 Installatie & Setup

1. **Repo klonen**
   ```bash
   git clone https://github.com/jouw-gebruikersnaam/fixio.git
   cd fixio
   ```

2. **Dependencies installeren**
   ```bash
   pnpm install
   ```

3. **.env.local aanmaken**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

4. **Dev-server starten**
   ```bash
   pnpm dev
   # Open http://localhost:3000
   ```

---

## 🧱 Projectstructuur

```
/app
  /dashboard
  /projects
  /tasks
  /materials
  /diy
  /ai
/components
/lib
/types
/styles
```

---

## 📋 Pagina's & Routes

### 🔐 Login (`/login`)
- **Locatie**: `app/login/page.js`
- **Features**: 
  - Mobile-first responsief design
  - Email + wachtwoord authenticatie
  - Loading states en error handling
  - Links naar registratie en wachtwoord reset
- **Styling**: Witte achtergrond, zwarte tekst, strak modern design
- **Status**: Frontend gereed, Supabase auth integratie pending

---

## 🎨 UI / Styling

- **Kleuren**  
  - `#ffffff` – Wit (primaire achtergrond)
  - `#000000` – Zwart (primaire tekst + accenten)
  - `#f9fafb` – Lichtgrijs (Tailwind: `gray-50`)
  - `#6b7280` – Grijs (Tailwind: `gray-500` voor subtekst)  
  - `#22c55e` – Groen voor successen (`green-500`)  
  - `#ef4444` – Rood voor fouten (`red-500`)

- **Typografie**  
  - Sans-serif, strak en leesbaar (Tailwind default)

- **Componenten** via [DaisyUI](https://daisyui.com/components/)

---

## 👥 User Types

- 👷 **Pro-gebruiker**: ZZP’er of klein bouwteam  
- 🧑‍🔧 **DIY-gebruiker**: Consument / doe-het-zelver

---

## 🧪 Development Info

- **Mobile-first bouwen**
- **Supabase Auth**
- **Gebruik `src/lib/supabase.ts` voor instantiebeheer**

---

## 🚧 Roadmap (MVP)

### ✅ Week 1
- Supabase Auth (login/signup/reset)
- Rolkeuze: Pro vs DIY
- Dashboard + project aanmaken

### ✅ Week 2
- Taken + status + toewijzing
- Materiaalbeheer
- AI-stub: volgorde taken

### ✅ Week 3
- DIY-wizard met AI-checklist
- Afvinkbare stappen

---

## ☁️ Deploy op Vercel

1. Push naar GitHub
2. Ga naar [vercel.com](https://vercel.com), koppel je repo
3. Voeg `.env` vars toe bij “Project Settings”
4. Deploy = automatisch live

---

## 📱 PWA-optioneel

- Voeg `manifest.json` toe
- Gebruik `next-pwa` plugin
- Activeer `Add to Home Screen`

---

## 👥 Contributor guidelines

- Schrijf duidelijke commits (`feat:`, `fix:`, `refactor:`)
- Houd code modular via `/components/`
- Gebruik `tailwind.config.ts` voor consistent thema

---

## 🧑‍💻 Made in Cursor
