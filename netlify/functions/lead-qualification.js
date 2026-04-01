const { getConnectionString, insertLeadSubmission } = require('./_db');
const { normalizeLeadPayload } = require('./_lead-helpers');

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

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return json(405, { message: 'Method not allowed' });
  }

  try {
    if (!getConnectionString()) {
      return json(503, {
        message: 'Lead storage is not configured',
        storage: 'unavailable'
      });
    }

    const payload = JSON.parse(event.body || '{}');
    const normalizedLead = normalizeLeadPayload(payload);
    const storedLead = await insertLeadSubmission(normalizedLead);

    return json(201, {
      message: 'Lead stored successfully',
      storage: 'neon',
      submissionId: storedLead.id,
      qualificationStatus: normalizedLead.qualificationStatus,
      leadScore: normalizedLead.leadScore,
      testLead: Boolean(normalizedLead.isTestLead),
      googleSyncStatus: normalizedLead.googleSyncStatus
    });
  } catch (error) {
    console.error('Lead qualification error:', error);
    return json(500, {
      message: 'Lead processing failed',
      error: error.message
    });
  }
};
