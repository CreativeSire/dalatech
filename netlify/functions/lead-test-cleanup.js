const { getConnectionString, deleteLeadSubmissionsByEmails } = require('./_db');
const { isTestEmail } = require('./_lead-helpers');

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

  if (!getConnectionString()) {
    return json(503, {
      message: 'Lead storage is not configured',
      storage: 'unavailable'
    });
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const emails = Array.isArray(body.emails) ? body.emails : [];
    const normalizedEmails = emails
      .map((value) => String(value || '').trim().toLowerCase())
      .filter(Boolean);

    if (!normalizedEmails.length) {
      return json(400, { message: 'No test emails were provided' });
    }

    const invalid = normalizedEmails.filter((email) => !isTestEmail(email));
    if (invalid.length) {
      return json(400, {
        message: 'Cleanup only supports approved synthetic test emails',
        invalid
      });
    }

    const result = await deleteLeadSubmissionsByEmails(normalizedEmails);
    return json(200, {
      message: 'Synthetic test lead cleanup completed',
      ...result
    });
  } catch (error) {
    console.error('Lead test cleanup error:', error);
    return json(500, {
      message: 'Lead test cleanup failed',
      error: error.message
    });
  }
};
