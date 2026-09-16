# Visit Cameroon · Cameroon AI Tourism

Portail tourisme inspiré de **Visit Singapore** (look & feel) et **Visit Dubai** (modules), avec les fonctionnalités IA du cahier des charges MINTOUL.

## Navigation principale

- Accueil — hero cinéma, filtres « Things to do », événements, régions
- À faire (`/things-to-do`)
- Explorer (`/explore` + régions)
- Événements (`/events`)
- Manger (`/eat`)
- Conseils (`/travel-tips`)
- Planifier (`/trip`) + Assistant IA (`/assistant`)
- Carte, patrimoine, écotourisme, Learn Cameroon, Near Me

## Démarrage

```bash
npm install
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

## Configuration

Copier `.env.example` vers `.env.local` :

```
HUGGINGFACE_API_KEY=...
# ou OPENAI_API_KEY=...
```

## Scripts

- `npm run dev` — développement
- `npm run build` — production
- `npm run lint` — ESLint
