# WorkO Backend

Production-ready Node.js/Express/MongoDB backend for the WorkO global piece-job marketplace.

## Features
- OTP-based phone authentication (with provider abstraction).
- Customer and Provider roles, plus Admin approvals.
- Provider onboarding, documents upload, and verification workflow.
- Service catalog with gender rules and per-country activation flags.
- Location-based booking fees per service/city/zone.
- Job broadcast with eligibility rules (within 5km, verified/online, gender rules).
- Job lifecycle: broadcast → accept → start (20m distance) → complete.
- Anti-abuse suspension after 4 provider cancellations within 24 hours.
- Payment and notification abstractions (placeholders for Paystack/Stripe/FCM).
- In-app chat and rating endpoints.

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

### Seed Services
```bash
npm run seed:services
```

### Seed Super Admin
```bash
npm run seed:superadmin
```

## Environment Variables
See `.env.example` for the full list.

## API Base
`/api/v1`

### Auth
- `POST /api/v1/auth/otp/request`
- `POST /api/v1/auth/otp/verify`
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`

### Health
- `GET /api/v1/health`

### Provider
- `PATCH /api/v1/provider/online`
- `PATCH /api/v1/provider/location`
- `POST /api/v1/provider/documents`
- `POST /api/v1/provider/documents/upload`

### Customer
- `POST /api/v1/customer/jobs`
- `POST /api/v1/customer/jobs/:jobId/cancel`
- `GET /api/v1/customer/jobs/:jobId`
- `GET /api/v1/customer/jobs/:jobId/track`
- `POST /api/v1/customer/messages`
- `GET /api/v1/customer/messages/:jobId`
- `POST /api/v1/customer/ratings`

### Jobs
- `POST /api/v1/jobs/request`
- `POST /api/v1/jobs/:id/pay`
- `POST /api/v1/jobs/:id/accept`
- `POST /api/v1/jobs/:id/reject`
- `POST /api/v1/jobs/:id/cancel`
- `POST /api/v1/jobs/:id/start`
- `POST /api/v1/jobs/:id/complete`

### Chat
- `GET /api/v1/chats/:jobId`
- `POST /api/v1/chats/:jobId/messages`

### Services
- `GET /api/v1/services?countryCode=US`
- `POST /api/v1/services`
- `PATCH /api/v1/services/:id`
- `DELETE /api/v1/services/:id`

### Pricing
- `GET /api/v1/pricing?countryCode=US&cityName=Johannesburg&serviceId=...`
- `POST /api/v1/pricing`

### Countries
- `GET /api/v1/countries`

### Admin
- `POST /api/v1/admin/login`
- `POST /api/v1/admin/create`
- `GET /api/v1/admin/providers`
- `POST /api/v1/admin/providers/:id/approve`
- `POST /api/v1/admin/providers/:id/reject`
- `POST /api/v1/admin/providers/:id/ban`
- `POST /api/v1/admin/providers/:id/suspend`

## Notes
- OTP responses include an `otpPreview` field for local testing; replace with provider integration in production.
- Payment and notification integrations are stubbed in `src/services`.
