const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
};

function json(statusCode, body) {
  return {
    statusCode,
    headers,
    body: JSON.stringify(body)
  };
}

function valueOrNull(value) {
  if (value === undefined || value === null) return null;
  const trimmed = String(value).trim();
  return trimmed ? trimmed : null;
}

function coerceBool(value) {
  if (value === undefined || value === null || value === '') return null;
  return String(value).toLowerCase() === 'yes';
}

function buildSku(payload, index) {
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

function normalizeLead(payload) {
  return {
    submittedAt: new Date().toISOString(),
    sourcePage: valueOrNull(payload.source_page) || 'unknown',
    formName: valueOrNull(payload.form_name) || valueOrNull(payload.formName) || 'unknown',
    firstName: valueOrNull(payload.first_name),
    lastName: valueOrNull(payload.last_name),
    fullName: valueOrNull(payload.full_name),
    email: valueOrNull(payload.email),
    phone: valueOrNull(payload.phone),
    companyName: valueOrNull(payload.company) || valueOrNull(payload.company_name),
    brandName: valueOrNull(payload.brand_name),
    businessType: valueOrNull(payload.business_type),
    businessSummary: valueOrNull(payload.message) || valueOrNull(payload.business_summary),
    productCertification: valueOrNull(payload.product_certification),
    retailPresence: valueOrNull(payload.retail_presence),
    monthlyRevenue: valueOrNull(payload.monthly_revenue),
    marketingActivities: valueOrNull(payload.marketing_activities),
    distributionTarget: valueOrNull(payload.distribution_target),
    revenueTarget: valueOrNull(payload.revenue_target),
    skus: [1, 2, 3].map((index) => buildSku(payload, index)).filter(Boolean)
  };
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return json(405, { message: 'Method not allowed' });
  }

  try {
    const payload = JSON.parse(event.body || '{}');
    const normalizedLead = normalizeLead(payload);
    const webhookUrl = process.env.LEAD_SHEET_WEBHOOK_URL;

    if (!webhookUrl) {
      return json(202, {
        message: 'Lead captured without sheet sync configuration',
        sheetLinked: false,
        lead: normalizedLead
      });
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(normalizedLead)
    });

    if (!response.ok) {
      const webhookBody = await response.text();
      console.error('Lead sheet webhook failed:', response.status, webhookBody);
      return json(502, {
        message: 'Lead received, but sheet sync failed',
        sheetLinked: false
      });
    }

    return json(200, {
      message: 'Lead synced successfully',
      sheetLinked: true
    });
  } catch (error) {
    console.error('Lead qualification error:', error);
    return json(500, {
      message: 'Lead processing failed',
      error: error.message
    });
  }
};
