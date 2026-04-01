const {
  getConnectionString,
  getLeadSyncSummary,
  deleteLeadSubmissionsByEmails
} = require('./_db');

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Admin-Key',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json'
};

function json(statusCode, body) {
  return {
    statusCode,
    headers,
    body: JSON.stringify(body)
  };
}

function getAdminSecret() {
  return process.env.LEAD_ADMIN_KEY || process.env.SHOP_ADMIN_KEY || null;
}

function isAuthorized(event) {
  const expected = getAdminSecret();
  if (!expected) return false;

  const provided =
    event.headers?.['x-admin-key'] ||
    event.headers?.['X-Admin-Key'] ||
    event.headers?.authorization?.replace(/^Bearer\s+/i, '') ||
    event.headers?.Authorization?.replace(/^Bearer\s+/i, '');

  return Boolean(provided && provided === expected);
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (!['GET', 'POST'].includes(event.httpMethod)) {
    return json(405, { message: 'Method not allowed' });
  }

  if (!getConnectionString()) {
    return json(503, {
      message: 'Lead storage is not configured',
      storage: 'unavailable'
    });
  }

  if (!getAdminSecret()) {
    return json(503, {
      message: 'Lead admin access is not configured'
    });
  }

  if (!isAuthorized(event)) {
    return json(401, { message: 'Unauthorized' });
  }

  try {
    if (event.httpMethod === 'GET') {
      const params = new URLSearchParams(
        event.rawQuery ||
        new URL(event.rawUrl || 'https://example.com').searchParams.toString() ||
        ''
      );
      const limit = Math.max(1, Math.min(100, Number(params.get('limit') || 20)));
      const summary = await getLeadSyncSummary(limit);
      return json(200, summary);
    }

    const body = JSON.parse(event.body || '{}');
    if (body.action === 'cleanup-tests') {
      const result = await deleteLeadSubmissionsByEmails(body.emails || []);
      return json(200, {
        message: 'Cleanup completed',
        ...result
      });
    }

    return json(400, { message: 'Unsupported admin action' });
  } catch (error) {
    console.error('Lead admin error:', error);
    return json(500, {
      message: 'Lead admin request failed',
      error: error.message
    });
  }
};
