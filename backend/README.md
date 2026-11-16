# Kovra API

REST API for the Kovra app. All endpoints are under `/v1` and exchange JSON.

Successful responses are wrapped as `{ "data": … }`. Errors look like this:

```json
{
  "error": {
    "code": "bad_request",
    "message": "Some fields are missing or invalid",
    "details": [{ "field": "customer.phone", "message": "…" }]
  }
}
```

## Setup

```bash
cp .env.example .env        # fill in JWT_SECRET and ADMIN_TOKEN (openssl rand -hex 32)
npm run dev                 # from this folder, or `npm run api` from the repo root
npm test
```

On boot the server applies pending migrations from `drizzle/` and seeds the catalogue from `@kovra/shared` if the products table is empty.

| Variable        | Default                 | Notes                                       |
| --------------- | ----------------------- | ------------------------------------------- |
| `PORT`          | `4000`                  |                                             |
| `DATABASE_PATH` | `./data/kovra.db`       | `:memory:` for throwaway runs               |
| `JWT_SECRET`    | required, 32+ chars     | Signs customer sessions (30-day tokens)     |
| `ADMIN_TOKEN`   | required, 24+ chars     | Bearer token for store-owner endpoints      |
| `CORS_ORIGINS`  | `http://localhost:8081` | Comma-separated. Native apps are unaffected |
| `LOG_LEVEL`     | `info`                  |                                             |

## Endpoints

### Catalogue

| Method | Path               | Notes                                                         |
| ------ | ------------------ | ------------------------------------------------------------- |
| GET    | `/v1/categories`   |                                                               |
| GET    | `/v1/products`     | Filters: `category`, `platform`, `condition`, `featured`, `q` |
| GET    | `/v1/products/:id` |                                                               |

### Orders

| Method | Path                    | Auth  | Notes                                                                      |
| ------ | ----------------------- | ----- | -------------------------------------------------------------------------- |
| POST   | `/v1/orders`            | none  | Priced on the server; stock reserved atomically; `409` when stock is short |
| GET    | `/v1/orders`            | user  | The signed-in customer's orders                                            |
| GET    | `/v1/orders/:id`        | none  | Order IDs are unguessable UUIDs                                            |
| PATCH  | `/v1/orders/:id/status` | admin | `confirmed` → `packed` → `in-transit` → `delivered`, or `cancelled`        |

### Trade (sell and swap)

| Method | Path                     | Notes                                                                |
| ------ | ------------------------ | -------------------------------------------------------------------- |
| GET    | `/v1/trade/models`       | Devices the store buys, with storage tiers                           |
| POST   | `/v1/trade/quote`        | `{ device, targetProductId? }`, giving an offer range and the top-up |
| POST   | `/v1/trade/requests`     | Creates a sell or swap request with a reference                      |
| GET    | `/v1/trade/requests/:id` |                                                                      |

### Accounts and fingerprint sign-in

| Method | Path                         | Auth | Body                                         |
| ------ | ---------------------------- | ---- | -------------------------------------------- |
| POST   | `/v1/auth/register`          |      | `name, username, email, phone, password`     |
| POST   | `/v1/auth/login`             |      | `identifier` (username or email), `password` |
| GET    | `/v1/auth/me`                | user |                                              |
| POST   | `/v1/auth/biometric`         | user | `deviceId, password`, returning `{ secret }` |
| POST   | `/v1/auth/biometric/disable` | user | `deviceId, password`                         |
| POST   | `/v1/auth/biometric/login`   |      | `identifier, deviceId, secret`               |

Fingerprint secrets are 256-bit random values. The server stores only their SHA-256 hash, scoped to one account and one device. Re-linking rotates the secret, so the previous one stops working at once. A biometric sign-in succeeds only when the identifier belongs to the account the secret was issued to.
