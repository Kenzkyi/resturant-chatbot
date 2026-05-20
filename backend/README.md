# BiteBot — Backend API

A Node.js/Express REST API that powers the BiteBot restaurant chatbot. It manages conversation sessions, a menu-driven ordering flow, cart state, and Paystack payment processing.

---

## Tech Stack

| Layer        | Technology                          |
|--------------|-------------------------------------|
| Runtime      | Node.js                             |
| Framework    | Express 5                           |
| Database     | MySQL via Sequelize ORM             |
| Payments     | Paystack (initialize + webhook)     |
| HTTP client  | Axios                               |

---

## Project Structure

```
backend/
├── app.js                        # Entry point — server setup, route mounting
│
├── assets/
│   └── menu.js                   # Static menu data (id, name, price)
│
├── config/
│   ├── index.js                  # Sequelize instance + DB connection
│   ├── order.js                  # Order model
│   ├── orderItem.js              # OrderItem model (hooks recalculate order total)
│   └── userSession.js            # Session model
│
├── constants/
│   └── index.js                  # Shared string constants (MAIN_MENU_TEXT, ITEM_MENU_FOOTER, SESSION_STATES)
│
├── controllers/
│   ├── chatController.js         # handleChatMessage, resetSession, verifyPayment
│   └── webhookController.js      # handlePaystackWebhook
│
├── handlers/
│   ├── mainMenu.js               # Handles MAIN_MENU session state messages
│   └── selectingItems.js         # Handles SELECTING_ITEMS session state messages
│
├── middlewares/
│   └── session.js                # Resolves or creates a session from X-Device-Id header
│
├── routes/
│   └── api.js                    # All /api/* route definitions
│
├── services/
│   └── paystackService.js        # Paystack API wrapper (initializeTransaction, verifyTransaction)
│
└── utils/
    └── index.js                  # Shared helpers: buildMenuList, buildCartSummary, buildOrderHistory, getOrCreateCart, handleCheckout
```

---

## Environment Variables

Create a `.env` file in the `backend/` directory with the following keys:

```env
DB_NAME=your_database_name
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_HOST=localhost
DB_DIALECT=mysql

PORT=3012

PAYSTACK_SECRET_KEY=sk_live_or_test_your_key_here
FRONTEND_URL=http://localhost:3000
```

---

## Getting Started

```bash
# Install dependencies
npm install

# Development (auto-restart on file change)
npm run dev

# Production
npm start
```

The server syncs all database tables on boot via `Model.sync({ alter: true })`.

---

## API Reference

### Base URL

```
http://localhost:3012
```

---

### GET `/api`

Returns this documentation as plain text.

---

### POST `/api/chat`

The core chatbot endpoint. Accepts a user message and returns the bot reply based on the current session state.

**Headers**

| Key          | Required | Description                                           |
|--------------|----------|-------------------------------------------------------|
| X-Device-Id  | Yes      | Unique identifier for the device/user session         |

**Request Body**

```json
{ "message": "1" }
```

**Response**

```json
{ "reply": "🛒 **Our Menu Today:**\n\n..." }
```

**Error Responses**

| Status | Reason                        |
|--------|-------------------------------|
| 400    | Missing or empty message      |
| 400    | Missing X-Device-Id header    |
| 500    | Internal server error         |

---

### GET `/api/reset`

Resets the caller's session back to `MAIN_MENU` state without clearing their active cart.

**Headers**

| Key          | Required | Description               |
|--------------|----------|---------------------------|
| X-Device-Id  | Yes      | Identifies the session    |

**Response**

```json
{ "message": "Session reset to main menu." }
```

---

### GET `/api/verify-payment/:reference`

Verifies a Paystack transaction by reference.

**Params**

| Param      | Description                      |
|------------|----------------------------------|
| reference  | Paystack transaction reference   |

**Response (success)**

```json
{ "message": "Payment verified successfully" }
```

**Response (failed)**

```json
{ "error": "Payment verification failed" }
```

---

### POST `/webhooks/paystack`

Receives Paystack webhook events. The request body must be the raw Buffer (registered before `express.json()` middleware) so the HMAC-SHA512 signature can be verified.

**Headers set by Paystack**

| Key                    | Description                    |
|------------------------|--------------------------------|
| x-paystack-signature   | HMAC-SHA512 of the raw body    |

Handled event: `charge.success` — marks the matching order as `paid` and resets the session to `MAIN_MENU`.

---

## Session & Conversation Flow

Each device gets a persistent session row keyed by `X-Device-Id`. The session tracks `currentOption`, which drives the conversation state machine:

```
MAIN_MENU
  │
  ├─ "1"  ──────────────────────────► SELECTING_ITEMS
  │                                        │
  │                                        ├─ <item id>   → add to cart
  │                                        ├─ -<item id>  → remove from cart
  │                                        ├─ "97"        → view cart
  │                                        ├─ "99"        → checkout (Paystack link)
  │                                        ├─ "0"         → cancel order → MAIN_MENU
  │                                        └─ "2"         → MAIN_MENU
  │
  ├─ "97" ──────────────────────────► view cart → SELECTING_ITEMS
  ├─ "98" ──────────────────────────► order history (paid orders)
  ├─ "99" ──────────────────────────► checkout
  └─ "0"  ──────────────────────────► cancel active cart
```

On `charge.success` webhook, the session is automatically reset to `MAIN_MENU`.

---

## Data Models

### Order

| Column       | Type         | Notes                                  |
|--------------|--------------|----------------------------------------|
| id           | UUID (PK)    | Auto-generated                         |
| deviceId     | STRING       | Links order to a device                |
| status       | STRING       | `cart` · `paid` · `cancelled`          |
| totalAmount  | DECIMAL(10,2)| Recalculated automatically on item change |

### OrderItem

| Column   | Type    | Notes                                 |
|----------|---------|---------------------------------------|
| id       | INTEGER | Auto-increment PK                     |
| orderId  | UUID    | FK → Order                            |
| itemId   | STRING  | Matches `id` in `assets/menu.js`      |
| quantity | INTEGER | Defaults to 1                         |

The `OrderItem` model has Sequelize hooks (`afterSave`, `afterDestroy`) that automatically recalculate and update `Order.totalAmount` whenever an item is added, changed, or removed.

### Session

| Column        | Type   | Notes                                      |
|---------------|--------|--------------------------------------------|
| deviceId      | STRING | PK, unique — one session per device        |
| currentOption | STRING | `MAIN_MENU` or `SELECTING_ITEMS`           |

---

## Services

### paystackService

Located at `services/paystackService.js`. Provides two functions:

- **`initializeTransaction({ email, amount, reference, callbackUrl })`** — creates a Paystack transaction and returns `{ authorization_url, ... }`.
- **`verifyTransaction(reference)`** — verifies a transaction and returns the Paystack data object.

The Paystack secret key is injected per-request via an Axios request interceptor, so rotating the key only requires updating the environment variable.

---

## Error Handling

- All route handlers use `try/catch` and return structured `{ error }` JSON responses.
- The global Express error handler catches anything that reaches `next(err)`.
- `config/index.js` calls `process.exit(1)` if the database connection cannot be established on boot.
- `app.js` wraps `start()` in `.catch()` so unhandled boot failures also exit with a non-zero code.
