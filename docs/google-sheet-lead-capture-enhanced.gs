const CONFIG = {
  SPREADSHEET_ID: '1zdFd7v4FRIa16N_HX-YGJY68AsX7yFjgwbB_3QSp0f8',
  MASTER_SHEET: 'Sheet1',
  CONTACT_SHEET: 'Contact Leads',
  GET_LISTED_SHEET: 'Get Listed Leads',
  DEDICATED_SHEET: 'Dedicated Form Leads',
  QUALIFIED_SHEET: 'Qualified Leads',
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
  try {
    const payload = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const workbook = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);

    const submissionChannel = getSubmissionChannel_(payload);
    const leadScore = scoreLead_(payload);
    const qualificationStatus = leadScore >= 3 ? 'Qualified' : 'Needs Review';
    const row = buildRow_(payload, submissionChannel, leadScore, qualificationStatus);

    appendToNamedSheet_(workbook, CONFIG.MASTER_SHEET, row);
    appendToNamedSheet_(workbook, getChannelSheetName_(submissionChannel), row);

    if (qualificationStatus === 'Qualified') {
      appendToNamedSheet_(workbook, CONFIG.QUALIFIED_SHEET, row);
    }

    return ContentService
      .createTextOutput(JSON.stringify({
        ok: true,
        submissionChannel: submissionChannel,
        leadScore: leadScore,
        qualificationStatus: qualificationStatus
      }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        ok: false,
        error: error && error.message ? error.message : String(error)
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function installOrRefreshLeadSheets() {
  const workbook = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);

  [
    CONFIG.MASTER_SHEET,
    CONFIG.CONTACT_SHEET,
    CONFIG.GET_LISTED_SHEET,
    CONFIG.DEDICATED_SHEET,
    CONFIG.QUALIFIED_SHEET
  ].forEach(function(sheetName) {
    const sheet = getOrCreateSheet_(workbook, sheetName);
    ensureHeaders_(sheet);
    formatSheet_(sheet);
  });
}

function appendToNamedSheet_(workbook, sheetName, row) {
  const sheet = getOrCreateSheet_(workbook, sheetName);
  ensureHeaders_(sheet);
  sheet.appendRow(row);
}

function getOrCreateSheet_(workbook, sheetName) {
  let sheet = workbook.getSheetByName(sheetName);
  if (!sheet) {
    sheet = workbook.insertSheet(sheetName);
  }
  return sheet;
}

function ensureHeaders_(sheet) {
  const existingHeaders = sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0];
  const needsHeaders = HEADERS.some(function(header, index) {
    return existingHeaders[index] !== header;
  });

  if (needsHeaders) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  }
}

function formatSheet_(sheet) {
  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, 1, HEADERS.length)
    .setFontWeight('bold')
    .setBackground('#1f6f5f')
    .setFontColor('#ffffff');

  if (sheet.getMaxColumns() < HEADERS.length) {
    sheet.insertColumnsAfter(sheet.getMaxColumns(), HEADERS.length - sheet.getMaxColumns());
  }

  sheet.getRange(2, 1, Math.max(sheet.getMaxRows() - 1, 1), 1).setNumberFormat(CONFIG.DATE_FORMAT);
}

function getSubmissionChannel_(payload) {
  const sourcePage = String(payload.sourcePage || payload.source_page || '').toLowerCase();
  const formName = String(payload.formName || payload.form_name || '').toLowerCase();

  if (sourcePage.indexOf('/pages/contact') !== -1 || formName.indexOf('contact') !== -1) {
    return 'Contact';
  }

  if (sourcePage.indexOf('/pages/get-listed-form') !== -1 || formName.indexOf('dedicated') !== -1) {
    return 'Dedicated Form';
  }

  return 'Get Listed';
}

function getChannelSheetName_(submissionChannel) {
  if (submissionChannel === 'Contact') return CONFIG.CONTACT_SHEET;
  if (submissionChannel === 'Dedicated Form') return CONFIG.DEDICATED_SHEET;
  return CONFIG.GET_LISTED_SHEET;
}

function scoreLead_(payload) {
  let score = 0;

  const certification = String(payload.productCertification || payload.product_certification || '');
  const retailPresence = String(payload.retailPresence || payload.retail_presence || '');
  const monthlyRevenue = String(payload.monthlyRevenue || payload.monthly_revenue || '');
  const marketingActivities = String(payload.marketingActivities || payload.marketing_activities || '');
  const distributionTarget = String(payload.distributionTarget || payload.distribution_target || '');
  const revenueTarget = String(payload.revenueTarget || payload.revenue_target || '');
  const skus = normalizeSkus_(payload);

  if (certification && certification !== 'None') score += 1;
  if (retailPresence && retailPresence !== 'Less than 5') score += 1;
  if (monthlyRevenue && monthlyRevenue !== 'Less than ₦500,000') score += 1;
  if (marketingActivities && marketingActivities !== 'None') score += 1;
  if (distributionTarget && distributionTarget !== '10+ stores') score += 1;
  if (revenueTarget && revenueTarget !== 'Above ₦2,000,000') score += 1;
  if (skus.some(function(item) { return item.productName; })) score += 1;

  return score;
}

function buildRow_(payload, submissionChannel, leadScore, qualificationStatus) {
  const submittedAt = Utilities.formatDate(new Date(), CONFIG.TIMEZONE, CONFIG.DATE_FORMAT);
  const sourcePage = payload.sourcePage || payload.source_page || '';
  const formName = payload.formName || payload.form_name || '';
  const firstName = payload.firstName || payload.first_name || '';
  const lastName = payload.lastName || payload.last_name || '';
  const fullName = payload.fullName || payload.full_name || [firstName, lastName].filter(Boolean).join(' ').trim();
  const email = payload.email || '';
  const phone = payload.phone || '';
  const companyName = payload.companyName || payload.company_name || '';
  const brandName = payload.brandName || payload.brand_name || '';
  const businessType = payload.businessType || payload.business_type || '';
  const businessSummary = payload.businessSummary || payload.business_summary || '';
  const productCertification = payload.productCertification || payload.product_certification || '';
  const retailPresence = payload.retailPresence || payload.retail_presence || '';
  const monthlyRevenue = payload.monthlyRevenue || payload.monthly_revenue || '';
  const marketingActivities = payload.marketingActivities || payload.marketing_activities || '';
  const distributionTarget = payload.distributionTarget || payload.distribution_target || '';
  const revenueTarget = payload.revenueTarget || payload.revenue_target || '';
  const skus = normalizeSkus_(payload);

  return [
    submittedAt,
    sourcePage,
    formName,
    submissionChannel,
    leadScore,
    qualificationStatus,
    firstName,
    lastName,
    fullName,
    email,
    phone,
    companyName,
    brandName,
    businessType,
    businessSummary,
    productCertification,
    retailPresence,
    monthlyRevenue,
    marketingActivities,
    distributionTarget,
    revenueTarget,
    skuValue_(skus, 1, 'productName'),
    skuValue_(skus, 1, 'productCategory'),
    skuValue_(skus, 1, 'isPerishable'),
    skuValue_(skus, 1, 'unitsPerPack'),
    skuValue_(skus, 1, 'packWeight'),
    skuValue_(skus, 1, 'productInvoicePrice'),
    skuValue_(skus, 2, 'productName'),
    skuValue_(skus, 2, 'productCategory'),
    skuValue_(skus, 2, 'isPerishable'),
    skuValue_(skus, 2, 'unitsPerPack'),
    skuValue_(skus, 2, 'packWeight'),
    skuValue_(skus, 2, 'productInvoicePrice'),
    skuValue_(skus, 3, 'productName'),
    skuValue_(skus, 3, 'productCategory'),
    skuValue_(skus, 3, 'isPerishable'),
    skuValue_(skus, 3, 'unitsPerPack'),
    skuValue_(skus, 3, 'packWeight'),
    skuValue_(skus, 3, 'productInvoicePrice')
  ];
}

function normalizeSkus_(payload) {
  if (Array.isArray(payload.skus)) {
    return payload.skus.map(function(item, index) {
      return {
        skuIndex: Number(item.skuIndex || index + 1),
        productName: item.productName || item.name || '',
        productCategory: item.productCategory || item.category || '',
        isPerishable: item.isPerishable || item.perishable || '',
        unitsPerPack: item.unitsPerPack || item.units || '',
        packWeight: item.packWeight || item.weight || '',
        productInvoicePrice: item.productInvoicePrice || item.invoicePrice || item.price || ''
      };
    });
  }

  const skus = [];
  for (var i = 1; i <= 3; i += 1) {
    skus.push({
      skuIndex: i,
      productName: payload['sku' + i + '_name'] || '',
      productCategory: payload['sku' + i + '_category'] || '',
      isPerishable: payload['sku' + i + '_perishable'] || '',
      unitsPerPack: payload['sku' + i + '_units_per_pack'] || '',
      packWeight: payload['sku' + i + '_pack_weight'] || '',
      productInvoicePrice: payload['sku' + i + '_invoice_price'] || ''
    });
  }
  return skus;
}

function skuValue_(skus, skuIndex, field) {
  const match = skus.find(function(item) {
    return Number(item.skuIndex) === Number(skuIndex);
  });
  return match && match[field] ? match[field] : '';
}
