# 📁 File Structure Guide

## How to Organize Downloaded Files

After downloading all files from outputs, organize them like this:

```
wealth-manager/
│
├── 📋 Configuration Files (root level)
│   ├── package.json                    ← Keep at root
│   ├── next.config.js                  ← Keep at root
│   ├── tailwind.config.js              ← Keep at root
│   ├── .env.local.example              ← Keep at root
│   ├── .gitignore                      ← Keep at root
│   ├── supabase-schema.sql             ← Keep at root
│   └── tsconfig.json                   ← Create new (template below)
│
├── 📱 app/ (Next.js App Router)
│   ├── page.tsx                        ← From app-page.tsx
│   ├── layout.tsx                      ← From app-layout.tsx
│   ├── globals.css                     ← From app-globals.css
│   │
│   └── api/
│       ├── ai-chat/
│       │   └── route.ts                ← From api-ai-chat-route.ts
│       └── whatsapp-notify/
│           └── route.ts                ← From api-whatsapp-notify-route.ts
│
├── 🎨 components/
│   ├── Navigation.tsx                  ← Copy as-is
│   ├── PortfolioHealth.tsx             ← Copy as-is
│   ├── HoldingsOverview.tsx            ← Copy as-is
│   ├── AIInsights.tsx                  ← Copy as-is
│   └── CapitalAllocator.tsx            ← Copy as-is
│
├── 📁 public/
│   └── manifest.json                   ← Copy as-is
│
├── 📚 Documentation (at root, optional)
│   ├── README.md
│   ├── QUICK_START.md
│   ├── SETUP_GUIDE.md
│   ├── ARCHITECTURE.md
│   ├── API_REFERENCE.md
│   ├── FAQ.md
│   └── ... (other .md files)
│
└── .env.local (CREATE NEW - from .env.local.example)
```

---

## 📥 Step-by-Step Setup

### 1. Create Project Folder
```bash
mkdir wealth-manager
cd wealth-manager
```

### 2. Copy Root Configuration Files
Copy these to project root:
- ✅ `package.json`
- ✅ `next.config.js`
- ✅ `tailwind.config.js`
- ✅ `.env.local.example` → rename to `.env.local`
- ✅ `.gitignore`
- ✅ `supabase-schema.sql`

### 3. Create `app/` Directory
```bash
mkdir -p app/api/ai-chat app/api/whatsapp-notify
```

Copy app files:
- ✅ `app-page.tsx` → `app/page.tsx`
- ✅ `app-layout.tsx` → `app/layout.tsx`
- ✅ `app-globals.css` → `app/globals.css`
- ✅ `api-ai-chat-route.ts` → `app/api/ai-chat/route.ts`
- ✅ `api-whatsapp-notify-route.ts` → `app/api/whatsapp-notify/route.ts`

### 4. Create `components/` Directory
```bash
mkdir components
```

Copy component files:
- ✅ `Navigation.tsx` → `components/Navigation.tsx`
- ✅ `PortfolioHealth.tsx` → `components/PortfolioHealth.tsx`
- ✅ `HoldingsOverview.tsx` → `components/HoldingsOverview.tsx`
- ✅ `AIInsights.tsx` → `components/AIInsights.tsx`
- ✅ `CapitalAllocator.tsx` → `components/CapitalAllocator.tsx`

### 5. Create `public/` Directory
```bash
mkdir public
```

Copy:
- ✅ `manifest.json` → `public/manifest.json`

### 6. Create Missing Files
Create these new files (templates below):

#### `tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "es2020",
    "lib": ["es2020", "dom", "dom.iterable"],
    "jsx": "preserve",
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "allowJs": true,
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "isolatedModules": true,
    "noEmit": true,
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

#### `.env.local` (from template)
1. Copy `.env.local.example` content
2. Rename to `.env.local`
3. Add your API keys:
   ```
   CLAUDE_API_KEY=sk-ant-xxxxx
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   ```

### 7. Install Dependencies
```bash
npm install
```

### 8. Verify Setup
```bash
npm run build
```

Should complete with no errors.

---

## 🗂️ File Mapping Reference

| Downloaded File | Move To | Rename? |
|-----------------|---------|---------|
| package.json | root/ | No |
| next.config.js | root/ | No |
| tailwind.config.js | root/ | No |
| .env.local.example | root/ | Yes → .env.local |
| .gitignore | root/ | No |
| supabase-schema.sql | root/ | No |
| app-page.tsx | app/ | Yes → page.tsx |
| app-layout.tsx | app/ | Yes → layout.tsx |
| app-globals.css | app/ | Yes → globals.css |
| api-ai-chat-route.ts | app/api/ai-chat/ | Yes → route.ts |
| api-whatsapp-notify-route.ts | app/api/whatsapp-notify/ | Yes → route.ts |
| Navigation.tsx | components/ | No |
| PortfolioHealth.tsx | components/ | No |
| HoldingsOverview.tsx | components/ | No |
| AIInsights.tsx | components/ | No |
| CapitalAllocator.tsx | components/ | No |
| manifest.json | public/ | No |

---

## 🎯 Quick Bash Setup (All at Once)

If you prefer, run this bash script to organize everything:

```bash
#!/bin/bash

# Create directories
mkdir -p wealth-manager/{app/api/{ai-chat,whatsapp-notify},components,public}
cd wealth-manager

# Copy root files
cp ../package.json .
cp ../next.config.js .
cp ../tailwind.config.js .
cp ../.gitignore .
cp ../supabase-schema.sql .
cp ../.env.local.example .env.local

# Copy app files
cp ../app-page.tsx app/page.tsx
cp ../app-layout.tsx app/layout.tsx
cp ../app-globals.css app/globals.css

# Copy API routes
cp ../api-ai-chat-route.ts app/api/ai-chat/route.ts
cp ../api-whatsapp-notify-route.ts app/api/whatsapp-notify/route.ts

# Copy components
cp ../Navigation.tsx components/
cp ../PortfolioHealth.tsx components/
cp ../HoldingsOverview.tsx components/
cp ../AIInsights.tsx components/
cp ../CapitalAllocator.tsx components/

# Copy public
cp ../manifest.json public/

echo "✅ Files organized successfully!"
ls -la
```

---

## ✅ Verification Checklist

After organizing files, verify:

- [ ] Root contains: `package.json`, `next.config.js`, `tailwind.config.js`, `.env.local`, `.gitignore`
- [ ] `app/` contains: `page.tsx`, `layout.tsx`, `globals.css`
- [ ] `app/api/ai-chat/` contains: `route.ts`
- [ ] `app/api/whatsapp-notify/` contains: `route.ts`
- [ ] `components/` contains: 5 `.tsx` files
- [ ] `public/` contains: `manifest.json`
- [ ] `.env.local` has your 3 API keys filled in

Run verification:
```bash
npm install
npm run build
```

Should complete with no errors! ✅

---

## 📝 Notes

1. **File Names:** Downloaded files have prefixes (`app-`, `api-`) to avoid conflicts. Remove these when moving to proper folders.

2. **.env.local:** Never commit this to git. It's in `.gitignore` by default.

3. **tsconfig.json:** Create this file yourself using the template above.

4. **Documentation:** Copy all `.md` files to root for reference (optional).

5. **Manifest.json:** Required for PWA. Don't modify unless customizing app name/colors.

---

## 🚀 After Organization

Once files are organized:

```bash
npm install
npm run dev
# Visit http://localhost:3000
```

You're ready to go! 🎉

---

**Questions about file structure?** Check [FILE_STRUCTURE.md](FILE_STRUCTURE.md) (this file)
