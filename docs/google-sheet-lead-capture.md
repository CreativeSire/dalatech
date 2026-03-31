# Google Sheet Lead Capture Setup

The lead qualification forms now support a Google Sheet bridge without replacing the existing Netlify form capture.

## What happens now

- The forms still submit to Netlify Forms as the durable fallback.
- Before that native submit completes, the browser also POSTs the submission to:

`/.netlify/functions/lead-qualification`

- That function forwards the normalized payload to a Google Apps Script webhook when:

`LEAD_SHEET_WEBHOOK_URL`

is configured in Netlify.

If the webhook is not configured, the forms still submit normally through Netlify Forms.

## Netlify environment variable

Add this environment variable in Netlify:

- `LEAD_SHEET_WEBHOOK_URL`

Value:

- the deployed Google Apps Script web app URL

## Suggested Google Sheet columns

Create a Google Sheet with these columns in row 1:

```text
submittedAt
sourcePage
formName
firstName
lastName
fullName
email
phone
companyName
brandName
businessType
businessSummary
productCertification
retailPresence
monthlyRevenue
marketingActivities
distributionTarget
revenueTarget
sku1_productName
sku1_productCategory
sku1_isPerishable
sku1_unitsPerPack
sku1_packWeight
sku1_productInvoicePrice
sku2_productName
sku2_productCategory
sku2_isPerishable
sku2_unitsPerPack
sku2_packWeight
sku2_productInvoicePrice
sku3_productName
sku3_productCategory
sku3_isPerishable
sku3_unitsPerPack
sku3_packWeight
sku3_productInvoicePrice
```

## Google Apps Script

Open the Sheet, then go to:

- `Extensions`
- `Apps Script`

Paste this script:

```javascript
function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const payload = JSON.parse(e.postData.contents || '{}');

  const sku = (index, field) => {
    const item = Array.isArray(payload.skus) ? payload.skus.find(entry => entry.skuIndex === index) : null;
    return item && item[field] !== undefined && item[field] !== null ? item[field] : '';
  };

  const row = [
    payload.submittedAt || '',
    payload.sourcePage || '',
    payload.formName || '',
    payload.firstName || '',
    payload.lastName || '',
    payload.fullName || '',
    payload.email || '',
    payload.phone || '',
    payload.companyName || '',
    payload.brandName || '',
    payload.businessType || '',
    payload.businessSummary || '',
    payload.productCertification || '',
    payload.retailPresence || '',
    payload.monthlyRevenue || '',
    payload.marketingActivities || '',
    payload.distributionTarget || '',
    payload.revenueTarget || '',
    sku(1, 'productName'),
    sku(1, 'productCategory'),
    sku(1, 'isPerishable'),
    sku(1, 'unitsPerPack'),
    sku(1, 'packWeight'),
    sku(1, 'productInvoicePrice'),
    sku(2, 'productName'),
    sku(2, 'productCategory'),
    sku(2, 'isPerishable'),
    sku(2, 'unitsPerPack'),
    sku(2, 'packWeight'),
    sku(2, 'productInvoicePrice'),
    sku(3, 'productName'),
    sku(3, 'productCategory'),
    sku(3, 'isPerishable'),
    sku(3, 'unitsPerPack'),
    sku(3, 'packWeight'),
    sku(3, 'productInvoicePrice')
  ];

  sheet.appendRow(row);

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

## Deploy the Apps Script

1. Click `Deploy`
2. Click `New deployment`
3. Select `Web app`
4. Execute as:
   - `Me`
5. Who has access:
   - `Anyone`
6. Copy the web app URL
7. Save that URL into Netlify as `LEAD_SHEET_WEBHOOK_URL`

## Excel output

The cleanest setup is:

- submissions land in Google Sheets first
- download the sheet as `.xlsx` whenever needed

If you want direct Excel-native storage later, we can add:

- Microsoft Forms / Excel Online
- Power Automate
- Airtable or Postgres export

But Google Sheets is the fastest reliable path from what we already have.
