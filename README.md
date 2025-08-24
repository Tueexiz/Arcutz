# nextjs-booking

Site de réservation de coupes (20€), prêt à déployer sur Vercel.

## Démarrage rapide

```bash
npm i
npm run dev
```

Créer `.env.local` (ou utilisez celui pré-rempli fourni) :

```
GMAIL_USER=arcutz.a@gmail.com
GMAIL_PASS=okypvkxyfintgrbe
NEXT_PUBLIC_SUPABASE_URL=https://ophfsfhvawgalqlwklea.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9waGZzZmh2YXdnYWxxbHdrbGVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwNzMyODksImV4cCI6MjA3MTY0OTI4OX0.kRA8W7DVxkG2XPb54iOpXWkGwQc4QK2ap98QlARVsm8
```

> ⚠️ **Sécurité :** évitez de commiter des secrets. Utilisez de préférence un mot de passe d’application Gmail, et pensez à le régénérer après vos tests.

## Supabase — Schéma attendu

Créez deux tables **public** :

- `slots`: `id uuid pk default uuid_generate_v4()`, `date date`, `time text`, `available boolean`
- `reservations`: `id uuid pk default uuid_generate_v4()`, `firstname text`, `email text`, `date date`, `time text`, `created_at timestamp default now()`

> Le backend crée automatiquement les créneaux manquants (lun–sam, 09:30 → 18:00, pas de 30 min) à la première requête sur une date.

## API

- `GET /api/booking?date=YYYY-MM-DD` → renvoie la liste des `available` pour la date (filtre lun–sam)
- `POST /api/booking` → crée la réservation, verrouille le créneau, envoie les emails (client + admin).

Le formulaire inclut : prénom, email, date, créneau (30 min), captcha simple (addition) + honeypot.

## Déploiement

- Déployez sur Vercel (projet Next.js).
- Ajoutez les variables d’environnement dans le dashboard Vercel.
- Configurez les politiques RLS sur Supabase si activées, pour autoriser les opérations depuis votre site (ou désactivez RLS pendant les tests).

## Personnalisation

- Styles dans `styles/globals.css` (glassmorphism bleu pastel, focus élégant, Poppins).
- Carrousel Swiper dans `components/Carousel.js` (responsive, flèches sur desktop, swipe mobile).
