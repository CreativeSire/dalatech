# DALA Shop Layer 2 Payment Plan

## Goal

Move the current DALA shop from:

- product browsing
- cart
- quote request
- manual order placement

to a full payment-enabled storefront without rebuilding the Layer 1 foundation.

The current store already supports:

- live product records
- editable pricing
- category browsing
- product detail pages
- cart
- order capture

Layer 2 should add payment in a way that keeps the current quote/manual order flow available.

## Recommended Payment Direction

Use **Paystack** as the first payment provider.

Why:

- best local fit for a Nigeria-based retail brand
- strong support for NGN payments
- familiar checkout experience for local buyers
- good documentation and webhook support

Fallback or future addition:

- Flutterwave

## Checkout Model

Layer 2 should support **three parallel checkout paths**:

1. **Request Quote**
   For B2B buyers, bulk orders, flexible pricing, or negotiation-led orders.

2. **Manual Order**
   Current Layer 1 flow stays available for customers who want DALA follow-up before payment.

3. **Pay Now**
   New Layer 2 path for straightforward product checkout.

That means we do not replace the current order flow. We expand it.

## Customer Experience

### Cart

Current cart page should gain:

- `Proceed to payment`
- `Place manual order`
- `Request quote`

### Checkout

The checkout page should let the user choose:

- pay now
- manual order
- request quote

Recommended order of emphasis:

1. Pay now
2. Request quote
3. Manual order

### Post-checkout outcomes

- **Pay now success**: payment confirmed, order created as paid
- **Pay now pending**: payment initiated but waiting for webhook confirmation
- **Manual order**: order received, pending team follow-up
- **Quote**: quote request received, pending team follow-up

## Database Additions

Current Layer 1 already has:

- `shop_categories`
- `shop_products`
- `shop_orders`
- `shop_order_items`

Add these tables for Layer 2:

### `shop_payments`

Fields:

- `id`
- `order_id`
- `provider`
- `provider_reference`
- `provider_access_code`
- `currency`
- `amount`
- `status`
- `paid_at`
- `created_at`
- `updated_at`

### `shop_payment_events`

Fields:

- `id`
- `provider`
- `event_type`
- `provider_reference`
- `payload`
- `created_at`

Purpose:

- webhook audit trail
- replay/debug protection

### `shop_orders` updates

Add:

- `payment_status`
- `checkout_status`
- `fulfillment_status`

Suggested values:

- `payment_status`: `unpaid`, `pending`, `paid`, `failed`, `refunded`
- `checkout_status`: `quote`, `manual`, `payment_started`, `payment_confirmed`
- `fulfillment_status`: `pending`, `processing`, `shipped`, `completed`

## API Routes To Add

### Customer-facing

- `POST /api/shop/payments/initialize`
- `GET /api/shop/payments/verify?reference=...`

### Provider-facing

- `POST /api/shop/webhooks/paystack`

### Admin/Internal

- `GET /api/shop/admin/orders`
- `GET /api/shop/admin/orders/:id`
- `POST /api/shop/admin/orders/:id/status`

## Payment Flow

### Pay Now

1. Customer builds cart
2. Customer chooses `Pay now`
3. Frontend sends checkout payload to `POST /api/shop/payments/initialize`
4. Backend:
   - creates pending order
   - creates payment record
   - initializes Paystack transaction
   - returns authorization URL or checkout token
5. Customer completes payment on Paystack
6. Paystack webhook hits `POST /api/shop/webhooks/paystack`
7. Backend verifies payload, marks:
   - payment as `paid`
   - order as `payment_confirmed`
8. Customer lands on confirmation page

### Quote

No payment record needed.
Order remains in quote workflow only.

### Manual Order

No payment initialization.
Order remains unpaid and pending human follow-up.

## Webhook Rules

The webhook should be the source of truth for payment confirmation.

Do not trust client-side redirect alone.

Webhook responsibilities:

- validate provider signature
- record raw event in `shop_payment_events`
- find payment by provider reference
- mark payment status correctly
- update linked order payment status
- ignore duplicate events safely

## UI Changes Needed In Layer 2

### Product page

Add:

- `Buy now`
- `Add to cart`
- `Request quote`

### Cart page

Add a stronger checkout choice panel:

- `Pay now`
- `Request quote`
- `Manual order`

### Checkout page

Split the current single layout into:

- buyer details
- order summary
- payment or non-payment mode selector

### Admin page

Later add:

- orders list
- payment status
- customer details
- quote/manual/paid filters

## Env Vars Needed

For Netlify:

- `DATABASE_URL` or `NEON_DATABASE_URL`
- `SHOP_ADMIN_KEY`
- `PAYSTACK_SECRET_KEY`
- `PAYSTACK_PUBLIC_KEY`
- `PAYSTACK_WEBHOOK_SECRET` if used in chosen verification approach

Optional:

- `SHOP_FROM_EMAIL`
- `SHOP_NOTIFICATION_EMAIL`

## Order Of Implementation

1. Add payment schema tables
2. Add order/payment status fields
3. Build `initialize payment` function
4. Build Paystack webhook
5. Add paid checkout button and UI state
6. Add payment success page handling
7. Add admin order visibility
8. Add notification emails

## Safety Rules

- keep quote flow available
- keep manual order flow available
- do not block checkout entirely if payment provider is unavailable
- always store order intent before redirecting to payment
- webhook confirmation should decide final payment truth

## Immediate Next Step

Before coding Layer 2, we should first confirm:

- the live Netlify site is linked locally in CLI
- the real Neon env is present in production
- the current store routes are deployed and reachable

Once that is confirmed, Layer 2 can be added on top of the current storefront cleanly.
