# Next Gen Vault — Liability Management Prototype

Next Gen Vault is a **Digital Legacy Management Platform** prototype focused on **liability management**. It allows an Owner to record liabilities (EMI/loan obligations and credit-card dues), protect supporting evidence, assign Beneficiaries with exact permissions, and release only explicitly permitted information after an Admin-approved activation request.

This is a **Semester 3 faculty prototype** of a larger Digital Legacy Management Platform. The final product will eventually manage both assets and liabilities. This prototype implements only liability management, limited to EMI/loan obligations and credit-card dues. Asset management is intentionally excluded.

> **Disclaimer:** Next Gen Vault stores owner-entered liability information for organization and controlled disclosure. It does not verify debts, process payments, provide legal advice or execute inheritance.

---

## Prototype Scope

### Included

- Authentication and authorization with three roles: Owner, Beneficiary, Admin
- Owner, Beneficiary and Admin role-based access
- EMI liability management
- Credit-card due management
- Liability dashboard with calculated totals
- Optional document upload using MongoDB GridFS
- Beneficiary relationships with invitation flow
- Item-level permissions for liabilities and documents (independent)
- Beneficiary activation request workflow
- Admin approval or rejection
- Controlled release after approval (only explicitly permitted data)
- Profile management
- Search, filters and responsive UI
- Seed data and demo accounts
- Loading, success, empty and error states

### Not Included

- Asset management
- Net-worth or net-legacy calculation
- Reports or audit-log screens
- Payment processing or bank API integration
- Automatic EMI or card payment
- Credit-bureau integration
- AI features
- Real death verification or real KYC
- Subscription payments
- Email or push notifications
- Full credit-card numbers or banking credentials

The application records information only. It never pays, transfers, fetches or independently verifies a liability.

---

## Final Product Direction

The final platform will extend this prototype to:

- Manage both assets and liabilities
- Calculate net legacy
- Support additional liability types
- Integrate verified data sources
- Provide full audit trails and reporting
- Support real notification and verification workflows

---

## Features

- **Owner**: Create, edit, close, archive, delete EMI and credit-card liabilities; upload supporting documents; add beneficiaries by email; grant item-level permissions; view dashboard with calculated totals.
- **Beneficiary**: Accept/reject invitations; view assigned owners (locked before activation); submit activation request; view only explicitly permitted liabilities and documents after admin approval.
- **Admin**: View platform metrics; manage user accounts (activate/deactivate); review and approve/reject activation requests with required reasons.

---

## Technology Stack

### Frontend

- React with Vite
- React Router
- Axios
- Tailwind CSS
- Responsive design (desktop, tablet, mobile)
- Reusable components
- Protected routes based on authentication and role

### Backend

- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- MongoDB GridFS using `GridFSBucket`
- JWT authentication
- bcryptjs for password hashing
- Cookie-based authentication using secure HTTP-only cookies
- Multer memory storage for temporary file handling
- Joi validation
- Helmet, CORS, rate limiting

---

## Folder Structure

```text
next-gen-vault/
├── client/                 # React + Vite frontend
│   ├── src/
│   │   ├── api/            # Axios API layer
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # Auth context
│   │   ├── pages/          # Page components
│   │   │   ├── auth/
│   │   │   ├── owner/
│   │   │   ├── beneficiary/
│   │   │   └── admin/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── vite.config.js
├── server/                 # Node + Express backend
│   ├── src/
│   │   ├── config/         # DB, GridFS, env config
│   │   ├── middleware/     # Auth, error, validation
│   │   ├── models/         # Mongoose models
│   │   ├── routes/         # Express routes
│   │   ├── controllers/    # Request handlers
│   │   ├── services/       # Business logic
│   │   ├── utils/          # Helpers
│   │   ├── app.js
│   │   └── server.js
│   ├── seed/
│   │   └── seed.js
│   ├── package.json
│   └── .env.example
├── package.json
├── README.md
├── .gitignore
└── .env.example
```

---

## Prerequisites

- Node.js 18+ and npm
- A MongoDB Atlas account (free tier works)
- A modern web browser

---

## MongoDB Atlas Setup

1. Create a free account at [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. Create a new project and cluster (M0 free tier is sufficient).
3. Under **Database Access**, create a database user with read/write permissions.
4. Under **Network Access**, allow your IP address (or `0.0.0.0/0` for development).
5. Click **Connect** → **Drivers** → copy the connection string. It looks like:
   ```
   mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER/next_gen_vault
   ```
6. Replace `YOUR_USERNAME`, `YOUR_PASSWORD`, and the cluster host with your values.

---

## Environment-Variable Setup

### Server (`server/.env`)

Copy `server/.env.example` to `server/.env` and fill in:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER/next_gen_vault
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=1d
CLIENT_URL=http://localhost:5173
COOKIE_NAME=ngv_token
MAX_FILE_SIZE_MB=5
```

### Client (`client/.env`)

Copy `client/.env.example` to `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

Never commit real secrets. The `.gitignore` excludes `.env` files.

---

## Installation

```bash
# From the project root
npm install
npm --prefix server install
npm --prefix client install
```

Or use the shortcut:

```bash
npm run install:all
```

---

## Development

Start both frontend and backend concurrently:

```bash
npm run dev
```

This starts:

- Backend on `http://localhost:5000`
- Frontend on `http://localhost:5173`

---

## Build and Production

```bash
# Build both client and server
npm run build

# Start the production server
npm start
```

The server serves the built frontend from `client/dist` in production.

---

## Seed Instructions

The seed script safely clears only the application collections in the configured development database and creates demo users, a relationship, liabilities, a document, and permissions.

```bash
npm run seed
```

**Warning:** The seed script deletes existing application data before inserting. Use only in development.

---

## Demo Credentials

| Role         | Email                      | Password        |
|--------------|----------------------------|-----------------|
| Admin        | admin@nextgenvault.demo    | Admin@123       |
| Owner        | owner@nextgenvault.demo    | Owner@123       |
| Beneficiary  | beneficiary@nextgenvault.demo | Beneficiary@123 |

---

## Faculty Demonstration Workflow

1. **Log in as Owner** (`owner@nextgenvault.demo` / `Owner@123`).
   - View the dashboard with active liability totals.
   - View liabilities (one active EMI, one active credit-card due, one overdue example).
   - View beneficiaries and the accepted relationship.
   - View permissions — the Beneficiary has access only to the first EMI, not the credit-card due or the document.

2. **Log in as Beneficiary** (`beneficiary@nextgenvault.demo` / `Beneficiary@123`).
   - The vault is **locked** — the Beneficiary sees only the Owner's name and relationship, no liability data.
   - Submit an **activation request** with a reason.

3. **Log in as Admin** (`admin@nextgenvault.demo` / `Admin@123`).
   - View the pending activation request in the queue.
   - Open the request, mark it under review, then **approve** with a reason.

4. **Log in as Beneficiary again.**
   - The vault is now **unlocked**.
   - The Beneficiary sees **only the permitted EMI** — the credit-card due remains hidden.
   - The attached document remains hidden unless separately permitted.

5. **Log in as Owner.**
   - Revoke the EMI permission.

6. **Log in as Beneficiary.**
   - The EMI is no longer accessible on the next request — access is lost immediately.

---

## API Summary

### Auth

| Method | Endpoint                        | Description              |
|--------|---------------------------------|--------------------------|
| POST   | /api/auth/register              | Register (Owner/Beneficiary) |
| POST   | /api/auth/login                 | Login                    |
| POST   | /api/auth/logout                | Logout                   |
| GET    | /api/auth/me                    | Get current user         |
| PATCH  | /api/auth/profile               | Update profile           |
| PATCH  | /api/auth/change-password       | Change password          |

### Liabilities

| Method | Endpoint                        | Description              |
|--------|---------------------------------|--------------------------|
| GET    | /api/liabilities                 | List owner liabilities   |
| POST   | /api/liabilities                 | Create liability         |
| GET    | /api/liabilities/:id             | Get liability            |
| PATCH  | /api/liabilities/:id             | Update liability         |
| DELETE | /api/liabilities/:id             | Delete liability         |
| POST   | /api/liabilities/:id/close       | Close liability          |
| POST   | /api/liabilities/:id/archive     | Archive liability        |
| POST   | /api/liabilities/:id/restore     | Restore liability        |

### Documents

| Method | Endpoint                                    | Description              |
|--------|---------------------------------------------|--------------------------|
| POST   | /api/documents/upload                       | Upload document (GridFS) |
| GET    | /api/documents/liability/:liabilityId       | List documents          |
| GET    | /api/documents/:id                          | Get document metadata   |
| GET    | /api/documents/:id/download                 | Download document        |
| DELETE | /api/documents/:id                          | Delete document          |

### Beneficiaries

| Method | Endpoint                        | Description              |
|--------|---------------------------------|--------------------------|
| GET    | /api/beneficiaries              | List owner's relationships |
| POST   | /api/beneficiaries              | Add beneficiary by email |
| PATCH  | /api/beneficiaries/:id/accept   | Accept invitation        |
| PATCH  | /api/beneficiaries/:id/reject   | Reject invitation        |
| DELETE | /api/beneficiaries/:id          | Revoke relationship      |
| GET    | /api/beneficiary/invitations    | Beneficiary invitations  |
| GET    | /api/beneficiary/owners         | Assigned owners          |

### Permissions

| Method | Endpoint                        | Description              |
|--------|---------------------------------|--------------------------|
| GET    | /api/permissions                | List permissions        |
| POST   | /api/permissions                | Grant permission        |
| POST   | /api/permissions/bulk           | Bulk grant              |
| PATCH  | /api/permissions/:id            | Update permission       |
| DELETE | /api/permissions/:id            | Revoke permission       |

### Activation Requests

| Method | Endpoint                                    | Description              |
|--------|---------------------------------------------|--------------------------|
| POST   | /api/activation-requests                    | Submit request           |
| GET    | /api/activation-requests/mine               | My requests              |
| GET    | /api/admin/activation-requests              | Admin: list requests     |
| GET    | /api/admin/activation-requests/:id          | Admin: get request       |
| PATCH  | /api/admin/activation-requests/:id/status   | Admin: under review      |
| PATCH  | /api/admin/activation-requests/:id/decision | Admin: approve/reject    |

### Admin

| Method | Endpoint                        | Description              |
|--------|---------------------------------|--------------------------|
| GET    | /api/admin/dashboard            | Platform metrics         |
| GET    | /api/admin/users                | List users               |
| PATCH  | /api/admin/users/:id/status     | Activate/deactivate user |

### Beneficiary Released Views

| Method | Endpoint                                    | Description              |
|--------|---------------------------------------------|--------------------------|
| GET    | /api/beneficiary/released/liabilities       | Released liabilities     |
| GET    | /api/beneficiary/released/liabilities/:id   | Released liability detail |
| GET    | /api/beneficiary/released/documents/:id     | Released document download |

---

## Security Warnings

- This is an academic prototype. Do not use it to store real financial credentials.
- Never store full card numbers, CVV, PIN, OTP, UPI PIN, banking passwords, payment tokens, private keys or password-manager secrets.
- The application records information only — it does not pay, transfer, fetch or independently verify a liability.
- Admin approval represents **simulated** legacy verification for academic purposes.
- All monetary values are owner-entered and may be outdated.
- Deactivated accounts cannot log in or access protected APIs.
- Every protected API enforces authentication and authorization on the backend. Frontend route protection is a convenience layer, not the security boundary.

---

## Known Prototype Limitations

- Only EMI and credit-card liability types are implemented.
- No asset management, net-worth or net-legacy calculation.
- No payment processing or bank API integration.
- No real death verification or KYC.
- No email or push notifications.
- No reports or audit-log screens.
- GridFS document upload is optional and limited to PDF, PNG, JPG (5 MB max).
- The prototype uses MongoDB Atlas as the actual database.

---

## GitHub Setup

1. Create a new repository on GitHub.
2. Initialize and push:

```bash
git init
git add .
git commit -m "Initial commit: Next Gen Vault liability management prototype"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/next-gen-vault.git
git push -u origin main
```

The `.gitignore` excludes `.env`, `node_modules`, build output, logs, editor files and temporary uploads.

---

## Troubleshooting

### MongoDB connection fails

- Verify `MONGODB_URI` in `server/.env`.
- Ensure your IP is allowlisted in Atlas Network Access.
- Check the database user has read/write permissions.

### Cookie not sent / received

- Ensure `CLIENT_URL` in `server/.env` matches the frontend URL.
- Browser cookies require `sameSite: "lax"` and `secure: true` in production.
- In development, `secure` is set to `false` for `http://localhost`.

### CORS errors

- The server allows `CLIENT_URL` with credentials.
- Ensure Axios uses `withCredentials: true`.

### Login fails after refresh

- The frontend calls `/api/auth/me` on load to restore the session from the HTTP-only cookie.
- If the cookie is missing, the user is redirected to login.

### Seed script fails

- Ensure MongoDB Atlas is reachable and `MONGODB_URI` is correct.
- The seed script clears application collections before inserting.

### Build fails

- Run `npm install` in both `server/` and `client/`.
- Check for missing environment variables.
