# Kovra

Kovra is a phone and gadget store app for a Nigerian retailer. Customers can buy new and UK-used phones, shop accessories, sell their old phone for cash, swap it towards a new one, and get delivery anywhere in Nigeria.

It runs on Android (the primary target), iOS, tablets and the web from a single Expo codebase, backed by a small Node API.

```
kovra/
├── frontend/   Expo (React Native) app: Android, iOS, tablet and web
├── backend/    REST API: Express 5, SQLite via Drizzle ORM, Zod validation
└── shared/     Domain types, catalogue, pricing, delivery and trade-in rules
```

`shared` is the single source of truth for business rules. The app uses it to show instant prices, delivery fees and trade-in quotes. The API uses the same code to recalculate everything server-side, so the two can never disagree.

---

## Quick start

Requirements: Node 22+ and npm 10+.

```bash
npm install                      # installs all three workspaces

# API (optional: the app also runs without it, see below)
cp backend/.env.example backend/.env    # then fill in JWT_SECRET and ADMIN_TOKEN
npm run api                      # http://localhost:4000

# App
cp frontend/.env.example frontend/.env  # set EXPO_PUBLIC_API_URL, or leave it empty
npm run app                      # press a for Android, w for web
```

| Command             | What it does                                    |
| ------------------- | ----------------------------------------------- |
| `npm run app`       | Start the Expo dev server                       |
| `npm run api`       | Start the API with hot reload                   |
| `npm run typecheck` | Type-check every workspace                      |
| `npm run lint`      | Lint the app (ESLint with React Compiler rules) |
| `npm test`          | Run the API test suite                          |
| `npm run format`    | Format everything with Prettier                 |

### Running without a server

If `EXPO_PUBLIC_API_URL` is empty, the app is fully usable on its own:

- the catalogue comes from `shared`,
- orders and trade requests are priced with the same rules and kept on the device,
- accounts live on the device, with salted password hashes.

This is handy for demos and for testing an APK before the API is deployed. With a URL set, the app shows the bundled catalogue instantly and swaps in live prices and stock in the background.

---

## Features

| Area           | What the customer gets                                                                                                     |
| -------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Store          | Tiltable spotlight device, bento grid of the shop's services, an on-page trade-in estimator, brand line-ups, UK-used deals |
| Explore        | Search, category and platform filters, new or UK-used, brand filter and price sorting                                      |
| Product        | Drag-to-tilt 3D stage, back/screen flip, colours, storage tiers with live price, spec sheet, "swap your phone for this"    |
| Bag Tray       | Products shrink and drop into a tray on the dock, which shows the count and a running total                                |
| Checkout       | Delivery to all 36 states and the FCT with zone fees, store pickup, bank transfer or pay on delivery                       |
| Order tracking | A Journey ring that fills stage by stage, plus WhatsApp confirmation with the order pre-written                            |
| Trade          | Sell or swap wizard: model, storage, condition grade, battery and box, giving an instant offer and the amount to top up    |
| Vault          | Saved devices, with side-by-side spec comparison                                                                           |
| Me             | Profile, orders, fingerprint sign-in, call and WhatsApp shortcuts                                                          |

### Fingerprint sign-in

Phones never give apps access to raw fingerprints, so no app can record "its own" fingerprint. Kovra uses the standard secure pattern:

1. Turning fingerprint sign-in **on**, **updating** it or turning it **off** always requires the account password.
2. When it is turned on, the API issues a random secret for this device. The app stores it in hardware-backed storage (`expo-secure-store` with `requireAuthentication`) that only a successful fingerprint scan can unlock. The server keeps only a SHA-256 hash of the secret.
3. Signing in requires the **username or email**. If it doesn't match the account the fingerprint was linked to, the sensor is never even asked. The server checks the pairing again.
4. If a new fingerprint is added to the phone, Android and iOS invalidate the key, so fingerprint sign-in turns off until the owner re-links it with their password.

---

## Frontend

Expo SDK 58, React Native 0.88, Expo Router, Reanimated 4, Tailwind CSS v4 via [Uniwind](https://uniwind.dev), and Zustand for state. The React Compiler is enabled.

```
frontend/
├── app/                    Routes (Expo Router). Screens stay thin and compose features.
│   ├── (tabs)/             Store, Explore, Trade, Vault, Me: the dock sections
│   ├── product/[id].tsx    Product page
│   ├── trade/[kind].tsx    Sell and swap wizard
│   ├── order/[id].tsx      Confirmation and tracking
│   └── …                   intro, auth, security, bag, checkout
└── src/
    ├── components/ui/      Design-system primitives (Button, Field, Sheet, Segmented…)
    ├── components/brand/   Logo and the ambient Aurora background
    ├── features/           Domain modules: account, bag, catalog, checkout, orders, store-front, trade, vault
    ├── navigation/         The dock and the section transition
    ├── services/           API access, each with an on-device fallback
    ├── store/              Zustand stores, persisted with AsyncStorage
    ├── lib/                Small utilities: api client, biometrics, layout, contact links…
    ├── theme/              Colour mirror, motion language, entrance presets
    └── global.css          Tailwind theme tokens
```

**Design.** The palette is midnight navy with champagne gold and a single azure accent, defined once in `src/global.css` and mirrored for SVG and gradients in `src/theme/colors.ts`. The typeface is Sora. Every device is rendered as a crisp vector until real photos are added (see below).

**Motion.** All motion comes from one place, `src/theme/motion.ts`. Springs are calm and settle without wobble, and there is a single ease-out curve. Animations run on the UI thread with Reanimated. Nothing vibrates, and the one sound (the soft chime when an item lands in the tray) respects silent mode and mixes with music.

**Responsive.** Phones get a floating dock with a raised gold Trade key. From 900 px wide the dock becomes a side rail, grids grow from 2 to 5 columns, and product pages split into two columns. Forms cap at a comfortable reading width.

**Size.** The app ships no icon fonts (its icons are hand-tuned SVG), only four font weights, and no gesture library. Android release builds enable R8 minification, resource shrinking and PNG crunching, and target arm64 only.

### Adding product photos

1. Export each photo as a transparent WebP of about 900×900 into `frontend/assets/products/`, named after the product ID (for example `iphone-17-pro-max.webp`).
2. Register it in `src/features/catalog/product-photos.ts`.

Products without a photo keep their vector render, so photos can be added one at a time.

### Building the Android app

Builds run on Expo's servers, triggered from GitHub Actions. Nothing needs installing locally.

1. **Once:** create an Expo access token (expo.dev → Account settings → Access tokens) and add it to this repository as an Actions secret named `EXPO_TOKEN` (Settings → Secrets and variables → Actions).
2. **Once:** run the **Set up Expo project** workflow (Actions tab → Run workflow). It links the app to your Expo account and commits the project ID.
3. **Every APK:** run **Build Android APK**. When it finishes, the APK is attached to a new GitHub Release, which gives a permanent download link.
4. **JavaScript changes** pushed to `main` reach installed apps automatically through **Publish OTA update**. Close and reopen the app twice to load them. Native changes (a new library, or a change to native config in `app.json`) need a version bump in `app.json` and a new APK.

To build from your own machine instead, run `npx eas-cli@latest build -p android --profile preview` inside `frontend/`. Use `--profile production` for a Play Store App Bundle.

---

## Backend

Express 5 with Zod validation, Drizzle ORM on SQLite (WAL mode), JWT sessions via `jose`, bcrypt password hashing, Helmet, CORS and structured logging with Pino.

```
backend/
├── src/
│   ├── app.ts              Express app factory (used by the server and the tests)
│   ├── server.ts           Boot, seed and graceful shutdown
│   ├── config/env.ts       Validated environment
│   ├── db/                 Schema, client and migrations runner, catalogue seed
│   ├── middleware/         Auth (user and admin) and error handling
│   └── modules/            auth · catalog · orders · trade
├── drizzle/                SQL migrations (generated with `npm run db:generate`)
└── test/                   Supertest suite against an in-memory database
```

Prices are always computed on the server from the database. Stock is reserved atomically when an order is placed. See [`backend/README.md`](backend/README.md) for the endpoint reference.

### Deploying the API

```bash
docker build -f backend/Dockerfile -t kovra-api .
docker run -p 4000:4000 -v kovra-data:/app/backend/data \
  -e JWT_SECRET=… -e ADMIN_TOKEN=… -e CORS_ORIGINS=https://your-site kovra-api
```

Mount a volume for `/app/backend/data` so the SQLite database survives restarts.

---

## Editing the store

- **Products, prices, stock:** `shared/src/catalog.ts` (seeded into the database on first run).
- **Trade-in values:** `shared/src/trade.ts`.
- **Delivery zones and fees:** `shared/src/delivery.ts`.
- **Phone number, WhatsApp, warranty:** `shared/src/business.ts`.

Order statuses are moved forward by the store owner with `PATCH /v1/orders/:id/status`, authorised by the admin token.
