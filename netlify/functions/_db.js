const { neon } = require('@neondatabase/serverless');

let leadSchemaPromise;

function getConnectionString() {
  return process.env.DATABASE_URL || process.env.NETLIFY_DATABASE_URL || process.env.NEON_DATABASE_URL || null;
}

function getSqlClient() {
  const connectionString = getConnectionString();
  if (!connectionString) return null;
  return neon(connectionString);
}

function mapSubmissionRow(row, skus) {
  return {
    id: row.id,
    submittedAt: row.submitted_at ? new Date(row.submitted_at).toISOString() : null,
    sourcePage: row.source_page,
    formName: row.form_name,
    submissionChannel: row.submission_channel,
    firstName: row.first_name,
    lastName: row.last_name,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    companyName: row.company_name,
    brandName: row.brand_name,
    businessType: row.business_type,
    businessSummary: row.business_summary,
    productCertification: row.product_certification,
    retailPresence: row.retail_presence,
    monthlyRevenue: row.monthly_revenue,
    marketingActivities: row.marketing_activities,
    distributionTarget: row.distribution_target,
    revenueTarget: row.revenue_target,
    leadScore: Number(row.lead_score || 0),
    qualificationStatus: row.qualification_status,
    googleSyncStatus: row.google_sync_status,
    googleSyncAttempts: Number(row.google_sync_attempts || 0),
    googleSyncError: row.google_sync_error,
    skus
  };
}

async function ensureLeadSchema() {
  const sql = getSqlClient();
  if (!sql) {
    throw new Error('Lead database is not configured');
  }

  if (!leadSchemaPromise) {
    leadSchemaPromise = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS lead_submissions (
          id BIGSERIAL PRIMARY KEY,
          submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          source_page TEXT NOT NULL,
          form_name TEXT NOT NULL,
          submission_channel TEXT NOT NULL,
          first_name TEXT,
          last_name TEXT,
          full_name TEXT,
          email TEXT,
          phone TEXT,
          company_name TEXT,
          brand_name TEXT,
          business_type TEXT,
          business_summary TEXT,
          product_certification TEXT,
          retail_presence TEXT,
          monthly_revenue TEXT,
          marketing_activities TEXT,
          distribution_target TEXT,
          revenue_target TEXT,
          lead_score INTEGER NOT NULL DEFAULT 0,
          qualification_status TEXT NOT NULL,
          google_sync_status TEXT NOT NULL DEFAULT 'pending',
          google_sync_attempts INTEGER NOT NULL DEFAULT 0,
          google_synced_at TIMESTAMPTZ,
          last_sync_attempt_at TIMESTAMPTZ,
          google_sync_error TEXT,
          raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb
        )
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS lead_submission_skus (
          id BIGSERIAL PRIMARY KEY,
          submission_id BIGINT NOT NULL REFERENCES lead_submissions(id) ON DELETE CASCADE,
          sku_index INTEGER NOT NULL,
          product_name TEXT,
          product_category TEXT,
          is_perishable BOOLEAN,
          units_per_pack INTEGER,
          pack_weight TEXT,
          product_invoice_price NUMERIC(12,2),
          CONSTRAINT lead_submission_skus_unique_submission_index UNIQUE (submission_id, sku_index)
        )
      `;

      await sql`CREATE INDEX IF NOT EXISTS idx_lead_submissions_submitted_at ON lead_submissions (submitted_at DESC)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_lead_submissions_channel ON lead_submissions (submission_channel)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_lead_submissions_status ON lead_submissions (qualification_status)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_lead_submissions_google_sync_status ON lead_submissions (google_sync_status, submitted_at ASC)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_lead_submission_skus_submission_id ON lead_submission_skus (submission_id, sku_index)`;
    })();
  }

  await leadSchemaPromise;
  return sql;
}

async function insertLeadSubmission(lead) {
  const sql = await ensureLeadSchema();

  const insertedRows = await sql`
    INSERT INTO lead_submissions (
      submitted_at,
      source_page,
      form_name,
      submission_channel,
      first_name,
      last_name,
      full_name,
      email,
      phone,
      company_name,
      brand_name,
      business_type,
      business_summary,
      product_certification,
      retail_presence,
      monthly_revenue,
      marketing_activities,
      distribution_target,
      revenue_target,
      lead_score,
      qualification_status,
      google_sync_status,
      raw_payload
    ) VALUES (
      ${lead.submittedAt},
      ${lead.sourcePage},
      ${lead.formName},
      ${lead.submissionChannel},
      ${lead.firstName},
      ${lead.lastName},
      ${lead.fullName},
      ${lead.email},
      ${lead.phone},
      ${lead.companyName},
      ${lead.brandName},
      ${lead.businessType},
      ${lead.businessSummary},
      ${lead.productCertification},
      ${lead.retailPresence},
      ${lead.monthlyRevenue},
      ${lead.marketingActivities},
      ${lead.distributionTarget},
      ${lead.revenueTarget},
      ${lead.leadScore},
      ${lead.qualificationStatus},
      'pending',
      ${JSON.stringify(lead.rawPayload || {})}
    )
    RETURNING id, submitted_at
  `;

  const inserted = insertedRows[0];

  for (const sku of lead.skus || []) {
    await sql`
      INSERT INTO lead_submission_skus (
        submission_id,
        sku_index,
        product_name,
        product_category,
        is_perishable,
        units_per_pack,
        pack_weight,
        product_invoice_price
      ) VALUES (
        ${inserted.id},
        ${sku.skuIndex},
        ${sku.productName},
        ${sku.productCategory},
        ${sku.isPerishable},
        ${sku.unitsPerPack},
        ${sku.packWeight},
        ${sku.productInvoicePrice}
      )
      ON CONFLICT (submission_id, sku_index) DO UPDATE SET
        product_name = EXCLUDED.product_name,
        product_category = EXCLUDED.product_category,
        is_perishable = EXCLUDED.is_perishable,
        units_per_pack = EXCLUDED.units_per_pack,
        pack_weight = EXCLUDED.pack_weight,
        product_invoice_price = EXCLUDED.product_invoice_price
    `;
  }

  return {
    id: inserted.id,
    submittedAt: inserted.submitted_at ? new Date(inserted.submitted_at).toISOString() : lead.submittedAt
  };
}

async function listPendingLeadSyncBatch(limit = 25) {
  const sql = await ensureLeadSchema();

  const submissionRows = await sql`
    SELECT *
    FROM lead_submissions
    WHERE google_sync_status IN ('pending', 'failed')
    ORDER BY submitted_at ASC
    LIMIT ${limit}
  `;

  if (!submissionRows.length) {
    return [];
  }

  const submissionIds = submissionRows.map((row) => row.id);
  const skuRows = await sql`
    SELECT *
    FROM lead_submission_skus
    WHERE submission_id = ANY(${submissionIds})
    ORDER BY submission_id ASC, sku_index ASC
  `;

  const skuMap = new Map();
  for (const skuRow of skuRows) {
    const list = skuMap.get(skuRow.submission_id) || [];
    list.push({
      skuIndex: skuRow.sku_index,
      productName: skuRow.product_name,
      productCategory: skuRow.product_category,
      isPerishable: skuRow.is_perishable,
      unitsPerPack: skuRow.units_per_pack,
      packWeight: skuRow.pack_weight,
      productInvoicePrice: skuRow.product_invoice_price !== null ? Number(skuRow.product_invoice_price) : null
    });
    skuMap.set(skuRow.submission_id, list);
  }

  return submissionRows.map((row) => mapSubmissionRow(row, skuMap.get(row.id) || []));
}

async function markLeadSubmissionSynced(id) {
  const sql = await ensureLeadSchema();
  await sql`
    UPDATE lead_submissions
    SET
      google_sync_status = 'synced',
      google_synced_at = NOW(),
      last_sync_attempt_at = NOW(),
      google_sync_attempts = google_sync_attempts + 1,
      google_sync_error = NULL
    WHERE id = ${id}
  `;
}

async function markLeadSubmissionSyncFailed(id, errorMessage) {
  const sql = await ensureLeadSchema();
  await sql`
    UPDATE lead_submissions
    SET
      google_sync_status = 'failed',
      last_sync_attempt_at = NOW(),
      google_sync_attempts = google_sync_attempts + 1,
      google_sync_error = ${String(errorMessage || '').slice(0, 2000)}
    WHERE id = ${id}
  `;
}

async function getLeadSyncSummary(limit = 20) {
  const sql = await ensureLeadSchema();

  const countsRows = await sql`
    SELECT
      COUNT(*)::INT AS total,
      COUNT(*) FILTER (WHERE google_sync_status = 'pending')::INT AS pending,
      COUNT(*) FILTER (WHERE google_sync_status = 'failed')::INT AS failed,
      COUNT(*) FILTER (WHERE google_sync_status = 'synced')::INT AS synced
    FROM lead_submissions
  `;

  const recentRows = await sql`
    SELECT
      id,
      submitted_at,
      submission_channel,
      full_name,
      email,
      company_name,
      brand_name,
      lead_score,
      qualification_status,
      google_sync_status,
      google_sync_attempts,
      google_sync_error
    FROM lead_submissions
    ORDER BY submitted_at DESC
    LIMIT ${limit}
  `;

  return {
    counts: countsRows[0] || { total: 0, pending: 0, failed: 0, synced: 0 },
    recent: recentRows.map((row) => ({
      id: row.id,
      submittedAt: row.submitted_at ? new Date(row.submitted_at).toISOString() : null,
      submissionChannel: row.submission_channel,
      fullName: row.full_name,
      email: row.email,
      companyName: row.company_name,
      brandName: row.brand_name,
      leadScore: Number(row.lead_score || 0),
      qualificationStatus: row.qualification_status,
      googleSyncStatus: row.google_sync_status,
      googleSyncAttempts: Number(row.google_sync_attempts || 0),
      googleSyncError: row.google_sync_error
    }))
  };
}

async function deleteLeadSubmissionsByEmails(emails = []) {
  const normalizedEmails = Array.from(
    new Set(
      (emails || [])
        .map((value) => String(value || '').trim().toLowerCase())
        .filter(Boolean)
    )
  );

  if (!normalizedEmails.length) {
    return {
      deletedCount: 0,
      deleted: []
    };
  }

  const sql = await ensureLeadSchema();

  const toDelete = await sql`
    SELECT id, email, full_name, company_name, submitted_at
    FROM lead_submissions
    WHERE LOWER(email) = ANY(${normalizedEmails})
    ORDER BY submitted_at DESC
  `;

  if (!toDelete.length) {
    return {
      deletedCount: 0,
      deleted: []
    };
  }

  const ids = toDelete.map((row) => row.id);
  await sql`DELETE FROM lead_submissions WHERE id = ANY(${ids})`;

  return {
    deletedCount: toDelete.length,
    deleted: toDelete.map((row) => ({
      id: row.id,
      email: row.email,
      fullName: row.full_name,
      companyName: row.company_name,
      submittedAt: row.submitted_at ? new Date(row.submitted_at).toISOString() : null
    }))
  };
}

module.exports = {
  getConnectionString,
  getSqlClient,
  ensureLeadSchema,
  insertLeadSubmission,
  listPendingLeadSyncBatch,
  markLeadSubmissionSynced,
  markLeadSubmissionSyncFailed,
  getLeadSyncSummary,
  deleteLeadSubmissionsByEmails
};
