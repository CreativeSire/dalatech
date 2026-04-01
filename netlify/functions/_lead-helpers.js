function valueOrNull(value) {
  if (value === undefined || value === null) return null;
  const trimmed = String(value).trim();
  return trimmed ? trimmed : null;
}

function coerceBool(value) {
  if (value === undefined || value === null || value === '') return null;
  return String(value).toLowerCase() === 'yes';
}

function buildSkuFromPayload(payload, index) {
  const prefix = `sku${index}_`;
  const name = valueOrNull(payload[`${prefix}name`]);
  const category = valueOrNull(payload[`${prefix}category`]);
  const units = valueOrNull(payload[`${prefix}units_per_pack`]);
  const weight = valueOrNull(payload[`${prefix}pack_weight`]);
  const invoicePrice = valueOrNull(payload[`${prefix}invoice_price`]);
  const perishable = payload[`${prefix}perishable`];

  if (!name && !category && !units && !weight && !invoicePrice && !perishable) {
    return null;
  }

  return {
    skuIndex: index,
    productName: name,
    productCategory: category,
    isPerishable: coerceBool(perishable),
    unitsPerPack: units ? Number(units) : null,
    packWeight: weight,
    productInvoicePrice: invoicePrice ? Number(invoicePrice) : null
  };
}

function getSubmissionChannel({ sourcePage, formName }) {
  const source = String(sourcePage || '').toLowerCase();
  const form = String(formName || '').toLowerCase();

  if (source.includes('/pages/contact') || form.includes('contact')) {
    return 'Contact';
  }

  if (source.includes('/pages/get-listed-form') || form === 'get-listed-qualification') {
    return 'Dedicated Form';
  }

  return 'Get Listed';
}

function scoreLead(lead) {
  let score = 0;

  if (lead.productCertification && lead.productCertification !== 'None') score += 1;
  if (lead.retailPresence && lead.retailPresence !== 'Less than 5') score += 1;
  if (lead.monthlyRevenue && lead.monthlyRevenue !== 'Less than ₦500,000') score += 1;
  if (lead.marketingActivities && lead.marketingActivities !== 'None') score += 1;
  if (lead.distributionTarget && lead.distributionTarget !== '10+ stores') score += 1;
  if (lead.revenueTarget && lead.revenueTarget !== 'Above ₦2,000,000') score += 1;
  if ((lead.skus || []).some((sku) => sku.productName)) score += 1;

  return score;
}

function normalizeLeadPayload(payload) {
  const firstName = valueOrNull(payload.first_name) || valueOrNull(payload.firstName);
  const lastName = valueOrNull(payload.last_name) || valueOrNull(payload.lastName);
  const fullName = valueOrNull(payload.full_name) || valueOrNull(payload.fullName) || [firstName, lastName].filter(Boolean).join(' ').trim() || null;
  const sourcePage = valueOrNull(payload.source_page) || valueOrNull(payload.sourcePage) || 'unknown';
  const formName = valueOrNull(payload.form_name) || valueOrNull(payload.formName) || 'unknown';

  const normalized = {
    submittedAt: new Date().toISOString(),
    sourcePage,
    formName,
    firstName,
    lastName,
    fullName,
    email: valueOrNull(payload.email),
    phone: valueOrNull(payload.phone),
    companyName: valueOrNull(payload.company) || valueOrNull(payload.company_name) || valueOrNull(payload.companyName),
    brandName: valueOrNull(payload.brand_name) || valueOrNull(payload.brandName),
    businessType: valueOrNull(payload.business_type) || valueOrNull(payload.businessType),
    businessSummary: valueOrNull(payload.message) || valueOrNull(payload.business_summary) || valueOrNull(payload.businessSummary),
    productCertification: valueOrNull(payload.product_certification) || valueOrNull(payload.productCertification),
    retailPresence: valueOrNull(payload.retail_presence) || valueOrNull(payload.retailPresence),
    monthlyRevenue: valueOrNull(payload.monthly_revenue) || valueOrNull(payload.monthlyRevenue),
    marketingActivities: valueOrNull(payload.marketing_activities) || valueOrNull(payload.marketingActivities),
    distributionTarget: valueOrNull(payload.distribution_target) || valueOrNull(payload.distributionTarget),
    revenueTarget: valueOrNull(payload.revenue_target) || valueOrNull(payload.revenueTarget),
    skus: [1, 2, 3].map((index) => buildSkuFromPayload(payload, index)).filter(Boolean),
    rawPayload: payload
  };

  normalized.submissionChannel = getSubmissionChannel(normalized);
  normalized.leadScore = scoreLead(normalized);
  normalized.qualificationStatus = normalized.leadScore >= 3 ? 'Qualified' : 'Needs Review';

  return normalized;
}

function buildGoogleSheetsPayload(submission) {
  return {
    submittedAt: submission.submittedAt,
    sourcePage: submission.sourcePage,
    formName: submission.formName,
    firstName: submission.firstName,
    lastName: submission.lastName,
    fullName: submission.fullName,
    email: submission.email,
    phone: submission.phone,
    companyName: submission.companyName,
    brandName: submission.brandName,
    businessType: submission.businessType,
    businessSummary: submission.businessSummary,
    productCertification: submission.productCertification,
    retailPresence: submission.retailPresence,
    monthlyRevenue: submission.monthlyRevenue,
    marketingActivities: submission.marketingActivities,
    distributionTarget: submission.distributionTarget,
    revenueTarget: submission.revenueTarget,
    submissionChannel: submission.submissionChannel,
    leadScore: submission.leadScore,
    qualificationStatus: submission.qualificationStatus,
    skus: submission.skus || []
  };
}

module.exports = {
  normalizeLeadPayload,
  buildGoogleSheetsPayload,
  getSubmissionChannel,
  scoreLead
};
