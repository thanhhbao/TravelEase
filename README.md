# TravelEase

Full-stack travel booking platform with a Laravel 12 backend and React 19 frontend. This guide covers local setup, Stripe configuration, and the new payment flow.

## 1. Prerequisites

- PHP 8.2+, Composer
- Node.js 20+, npm
- MySQL (or compatible database)
- Stripe account with test keys

## 2. Backend Setup (`/backend`)

1. Install dependencies and generate application key:
   ```bash
   cd backend
   composer install
   cp .env.example .env
   php artisan key:generate
   ```

2. Configure database credentials inside `.env`, then run migrations:
   ```bash
   php artisan migrate
   ```

3. Configure Stripe keys in `.env` (test keys recommended while developing):
   ```env
   STRIPE_SECRET=sk_test_xxx
   STRIPE_PUBLISHABLE_KEY=pk_test_xxx
   STRIPE_WEBHOOK_SECRET=
   STRIPE_DEFAULT_CURRENCY=usd
   ```

4. Start the API server:
   ```bash
   php artisan serve --host=127.0.0.1 --port=8000
   ```

### Stripe API endpoints

- `POST /api/payments/intent`  
  Authenticated users request a Payment Intent for the booking total. Returns the Stripe `clientSecret`, publishable key, and intent id.

- `POST /api/my-bookings`  
  Expects booking details plus `payment_intent_id` and `currency`. The backend verifies the intent succeeded, matches the booking amount, and stores the payment status.

Run the new migration anytime after pulling these changes:

```bash
php artisan migrate
```

## 3. Frontend Setup (`/frontend`)

1. Install dependencies (adds `@stripe/react-stripe-js` and `@stripe/stripe-js`):
   ```bash
    cd frontend
    npm install
   ```

2. Create a `.env` file (if you haven't already) and point the app to your backend:
   ```env
   VITE_API_BASE_URL=http://127.0.0.1:8000
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

The checkout page now loads Stripe Elements, creates Payment Intents via the API, confirms payments client-side, and finalises bookings after successful payment confirmation.

### Webhooks

1. Tạo endpoint webhook trong Stripe Dashboard hoặc dùng `stripe listen`.
2. Sao chép signing secret (`whsec_...`) vào `.env`:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_xxx
   ```
3. Stripe gửi sự kiện tới `POST /api/stripe/webhook`; backend sẽ kiểm tra chữ ký trước khi xử lý.

## 4. Testing

- Backend: `php artisan test`
- Frontend linting: `npm run lint`

> Note: Run `composer install` and `npm install` before executing tests so that the new Stripe dependencies are available.

## 5. Troubleshooting

- **401 errors on `/api/payments/intent`** – Ensure the frontend includes a valid Sanctum bearer token (log in first).
- **Stripe not configured** – Double-check Stripe keys in `backend/.env` and rerun `php artisan config:clear`.
- **Booking creation fails after payment** – The backend requires the `payment_intent_id` used for Stripe confirmation. The frontend handles this automatically; if you are testing manually, include it in the payload.

Happy coding!
