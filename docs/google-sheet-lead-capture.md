# Google Sheet Lead Capture Setup

The lead qualification forms already send submissions through Netlify and can now mirror those submissions into Google Sheets through a Google Apps Script webhook.

This upgraded setup adds:

- email alert on submission
- auto timestamp formatting
- a filtered `Qualified Leads` tab
- separate tabs for:
  - `Contact Leads`
  - `Get Listed Leads`
  - `Dedicated Form Leads`

The website-side integration is already done. The remaining step is to replace your Apps Script with the enhanced version below and redeploy the web app.

## What happens on the website

- the forms still submit to Netlify Forms as the fallback
- before the native submit completes, the browser also POSTs to:

`/.netlify/functions/lead-qualification`

- Netlify then forwards the normalized lead to your Google Apps Script using:

`LEAD_SHEET_WEBHOOK_URL`

If the webhook is unreachable, the normal Netlify form submit still runs.

## Netlify environment variable

The value should be the deployed Google Apps Script web app URL:

- `LEAD_SHEET_WEBHOOK_URL`

Example:

```text
https://script.google.com/macros/s/AKfycbw5xeWkNGFPx3BX-w0TkqwJTPy6fYx4WHGe27GBXaYhjvTxLjBeT9g3m_Ip1ZgKkyfc/exec
```

## Replace your Apps Script with this enhanced version

Open your Google Sheet, then:

- `Extensions`
- `Apps Script`

Replace the entire file with this:

```javascript
const CONFIG = {
  MASTER_SHEET: 'Sheet1',
  CONTACT_SHEET: 'Contact Leads',
  GET_LISTED_SHEET: 'Get Listed Leads',
  DEDICATED_SHEET: 'Dedicated Form Leads',
  QUALIFIED_SHEET: 'Qualified Leads',
  ALERT_EMAIL: 'creddypensmedia@gmail.com',
  TIMEZONE: 'Africa/Lagos',
  DATE_FORMAT: 'yyyy-mm-dd hh:mm:ss'
};

const HEADERS = [
  'submittedAt',
  'sourcePage',
  'formName',
  'submissionChannel',
  'leadScore',
  'qualificationStatus',
  'firstName',
  'lastName',
  'fullName',
  'email',
  'phone',
  'companyName',
  'brandName',
  'businessType',
  'businessSummary',
  'productCertification',
  'retailPresence',
  'monthlyRevenue',
  'marketingActivities',
  'distributionTarget',
  'revenueTarget',
  'sku1_productName',
  'sku1_productCategory',
  'sku1_isPerishable',
  'sku1_unitsPerPack',
  'sku1_packWeight',
  'sku1_productInvoicePrice',
  'sku2_productName',
  'sku2_productCategory',
  'sku2_isPerishable',
  'sku2_unitsPerPack',
  'sku2_packWeight',
  'sku2_productInvoicePrice',
  'sku3_productName',
  'sku3_productCategory',
  'sku3_isPerishable',
  'sku3_unitsPerPack',
  'sku3_packWeight',
  'sku3_productInvoicePrice'
];

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, service: 'DALA Lead Capture' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const payload = JSON.parse(e.postData.contents || '{}');
  const workbook = SpreadsheetApp.getActiveSpreadsheet();

  installOrRefreshLeadSheets_();

  const submissionChannel = getSubmissionChannel_(payload);
  const leadScore = scoreLead_(payload);
  const qualificationStatus = leadScore >= 3 ? 'Qualified' : 'Needs Review';
  const row = buildRow_(payload, submissionChannel, leadScore, qualificationStatus);

  appendToSheet_(workbook.getSheetByName(CONFIG.MASTER_SHEET), row);

  const channelSheetName = getChannelSheetName_(submissionChannel);
  appendToSheet_(workbook.getSheetByName(channelSheetName), row);

  if (qualificationStatus === 'Qualified') {
    appendToSheet_(workbook.getSheetByName(CONFIG.QUALIFIED_SHEET), row);
  }

  sendLeadAlert_(payload, submissionChannel, leadScore, qualificationStatus);

  return ContentService
    .createTextOutput(JSON.stringify({
      ok: true,
      submissionChannel,
      leadScore,
      qualificationStatus
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

function installOrRefreshLeadSheets() {
  installOrRefreshLeadSheets_();
}

function installOrRefreshLeadSheets_() {
  const workbook = SpreadsheetApp.getActiveSpreadsheet();

  [
    CONFIG.MASTER_SHEET,
    CONFIG.CONTACT_SHEET,
    CONFIG.GET_LISTED_SHEET,
    CONFIG.DEDICATED_SHEET,
    CONFIG.QUALIFIED_SHEET
  ].forEach((name) => ensureSheet_(workbook, name));
}

function ensureSheet_(workbook, name) {
  let sheet = workbook.getSheetByName(name);
  if (!sheet) {
    sheet = workbook.insertSheet(name);
  }

  const headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
  const currentHeaders = headerRange.getValues()[0];
  const hasHeaders = currentHeaders.some(Boolean);

  if (!hasHeaders || currentHeaders.join('|') !== HEADERS.join('|')) {
    headerRange.setValues([HEADERS]);
  }

  sheet.setFrozenRows(1);
  headerRange
    .setFontWeight('bold')
    .setBackground('#1f6f64')
    .setFontColor('#ffffff');
  sheet.getRange('A:A').setNumberFormat(CONFIG.DATE_FORMAT);
  sheet.autoResizeColumns(1, HEADERS.length);

  if (sheet.getFilter()) {
    sheet.getFilter().remove();
  }
  sheet.getDataRange().createFilter();
}

function appendToSheet_(sheet, row) {
  sheet.appendRow(row);
  const lastRow = sheet.getLastRow();
  sheet.getRange(lastRow, 1).setNumberFormat(CONFIG.DATE_FORMAT);
}

function buildRow_(payload, submissionChannel, leadScore, qualificationStatus) {
  const sku = (index, field) => {
    const item = Array.isArray(payload.skus) ? payload.skus.find(entry => entry.skuIndex === index) : null;
    return item && item[field] !== undefined && item[field] !== null ? item[field] : '';
  };

  return [
    new Date(payload.submittedAt || new Date().toISOString()),
    payload.sourcePage || '',
    payload.formName || '',
    submissionChannel,
    leadScore,
    qualificationStatus,
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
}

function getSubmissionChannel_(payload) {
  const formName = String(payload.formName || '').trim();

  if (formName === 'contact-lead-qualification') {
    return 'Contact';
  }

  if (formName === 'get-listed-qualification-inline') {
    return 'Get Listed';
  }

  if (formName === 'get-listed-qualification') {
    return 'Dedicated Form';
  }

  return 'Unknown';
}

function getChannelSheetName_(submissionChannel) {
  if (submissionChannel === 'Contact') return CONFIG.CONTACT_SHEET;
  if (submissionChannel === 'Get Listed') return CONFIG.GET_LISTED_SHEET;
  if (submissionChannel === 'Dedicated Form') return CONFIG.DEDICATED_SHEET;
  return CONFIG.MASTER_SHEET;
}

function scoreLead_(payload) {
  let score = 0;

  if (payload.productCertification === 'NAFDAC' || payload.productCertification === 'SON (MANCAP)') {
    score += 1;
  }

  if (payload.marketingActivities && payload.marketingActivities !== 'None') {
    score += 1;
  }

  if (payload.distributionTarget && payload.distributionTarget !== '10+ stores') {
    score += 1;
  }

  if (payload.revenueTarget && payload.revenueTarget !== 'Above ₦2,000,000') {
    score += 1;
  }

  if (Array.isArray(payload.skus) && payload.skus.some(item => item.productName)) {
    score += 1;
  }

  return score;
}

function sendLeadAlert_(payload, submissionChannel, leadScore, qualificationStatus) {
  if (!CONFIG.ALERT_EMAIL) return;

  const subject = `New DALA lead: ${payload.companyName || payload.brandName || payload.fullName || 'Unnamed Lead'}`;
  const body = [
    'A new DALA lead has been submitted.',
    '',
    `Channel: ${submissionChannel}`,
    `Qualification status: ${qualificationStatus}`,
    `Lead score: ${leadScore}`,
    '',
    `Name: ${payload.fullName || ''}`.trim(),
    `Email: ${payload.email || ''}`.trim(),
    `Phone: ${payload.phone || ''}`.trim(),
    `Company: ${payload.companyName || ''}`.trim(),
    `Brand: ${payload.brandName || ''}`.trim(),
    `Business type: ${payload.businessType || ''}`.trim(),
    '',
    'Summary:',
    payload.businessSummary || '',
    '',
    'Open the Google Sheet to view the full submission.'
  ].join('\n');

  MailApp.sendEmail(CONFIG.ALERT_EMAIL, subject, body);
}
```

## What this upgraded script does

### 1. Email alert on submission

Every new lead sends an email to:

```text
creddypensmedia@gmail.com
```

If you want a different recipient, change:

```javascript
ALERT_EMAIL: 'creddypensmedia@gmail.com'
```

### 2. Auto timestamp formatting

The `submittedAt` column is automatically formatted as:

```text
yyyy-mm-dd hh:mm:ss
```

Timezone:

```text
Africa/Lagos
```

### 3. Filtered `Qualified Leads` tab

The script scores leads out of 5 and sends stronger submissions into:

- `Qualified Leads`

Current qualification rules:

- valid certification
- any real marketing activity
- distribution target above the minimum
- revenue target above the minimum
- at least one SKU provided

Leads with score `3` or more are marked:

- `Qualified`

Everything else is marked:

- `Needs Review`

### 4. Separate tabs by source

The script also routes copies of each submission into:

- `Contact Leads`
- `Get Listed Leads`
- `Dedicated Form Leads`

The main full log remains in:

- `Sheet1`

## Important one-time setup after pasting the script

After replacing the script:

1. save the Apps Script
2. from the function dropdown, select:
   - `installOrRefreshLeadSheets`
3. click `Run`
4. authorize if Google asks

This creates or refreshes all tabs and headers.

## Redeploy the Apps Script

After saving the new script:

1. click `Deploy`
2. click `Manage deployments`
3. edit the existing web app deployment
4. keep:
   - `Execute as`: `Me`
   - `Who has access`: `Anyone`
5. click `Deploy`

Your webhook URL can stay the same.

## Netlify setup

In Netlify:

1. open the live `dalatechnologies.com` project
2. go to:
   - `Site configuration`
   - `Environment variables`
3. confirm this variable exists:

```text
LEAD_SHEET_WEBHOOK_URL
```

4. confirm the value is your Google Apps Script web app URL
5. go to `Deploys`
6. click:
   - `Trigger deploy`
   - `Deploy site`

## Where to see the output

After a form submission:

- all submissions appear in `Sheet1`
- submissions are copied into the channel tab:
  - `Contact Leads`
  - `Get Listed Leads`
  - `Dedicated Form Leads`
- stronger submissions also appear in `Qualified Leads`
- an email alert is sent to the configured inbox

## Excel output

Google Sheets is still the cleanest live destination. If you need Excel:

- open the Sheet
- go to `File`
- `Download`
- `Microsoft Excel (.xlsx)`

That gives you the same dataset in Excel format whenever needed.
