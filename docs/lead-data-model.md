# Lead Data Model

This project uses Neon Postgres as the primary system of record for lead submissions.

## Capture flow

1. Website forms post to `/.netlify/functions/lead-qualification`
2. The function normalizes the payload and stores it in Neon
3. A scheduled Netlify function (`lead-sync-google`) sends pending leads to Google Sheets
4. Successful syncs are marked as synced in Neon
5. Failed syncs remain in Neon and are retried later

## Tables

### `lead_submissions`

- `id`
- `submitted_at`
- `source_page`
- `form_name`
- `submission_channel`
- `first_name`
- `last_name`
- `full_name`
- `email`
- `phone`
- `company_name`
- `brand_name`
- `business_type`
- `business_summary`
- `product_certification`
- `retail_presence`
- `monthly_revenue`
- `marketing_activities`
- `distribution_target`
- `revenue_target`
- `lead_score`
- `qualification_status`
- `google_sync_status`
- `google_sync_attempts`
- `google_synced_at`
- `last_sync_attempt_at`
- `google_sync_error`
- `raw_payload`

### `lead_submission_skus`

- `id`
- `submission_id`
- `sku_index`
- `product_name`
- `product_category`
- `is_perishable`
- `units_per_pack`
- `pack_weight`
- `product_invoice_price`

## Sync status values

- `pending`
- `failed`
- `synced`

## Source channels

- `Contact`
- `Get Listed`
- `Dedicated Form`

## Environment variables

The capture and sync flow depends on:

- `DATABASE_URL` or `NETLIFY_DATABASE_URL` or `NEON_DATABASE_URL`
- `LEAD_SHEET_WEBHOOK_URL`

## Operational notes

- Website submission should succeed as long as Neon is available
- Google Sheets is a reporting destination, not the primary storage layer
- Sync failures do not lose leads because the source of truth is Neon
