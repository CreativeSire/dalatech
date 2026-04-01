const {
  getConnectionString,
  listPendingLeadSyncBatch,
  markLeadSubmissionSynced,
  markLeadSubmissionSyncFailed
} = require('./_db');
const { buildGoogleSheetsPayload } = require('./_lead-helpers');
const { postToGoogleAppsScript } = require('./_google-webhook');

const CONFIRMED_GOOGLE_SHEETS_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbw5xeWkNGFPx3BX-w0TkqwJTPy6fYx4WHGe27GBXaYhjvTxLjBeT9g3m_Ip1ZgKkyfc/exec';

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
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

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const isManualRequest = Boolean(event.httpMethod);
  if (isManualRequest && !['GET', 'POST'].includes(event.httpMethod)) {
    return json(405, { message: 'Method not allowed' });
  }

  try {
    if (!getConnectionString()) {
      return json(503, {
        message: 'Lead storage is not configured',
        storage: 'unavailable'
      });
    }

    const webhookUrl = CONFIRMED_GOOGLE_SHEETS_WEBHOOK_URL;
    if (!webhookUrl) {
      return json(503, {
        message: 'Google Sheets sync is not configured',
        sheetLinked: false
      });
    }

    const batch = await listPendingLeadSyncBatch(25);
    if (!batch.length) {
      return json(200, {
        message: 'No leads pending Google sync',
        synced: 0,
        failed: 0
      });
    }

    const results = {
      synced: 0,
      failed: 0,
      syncedIds: [],
      failedIds: [],
      failedEntries: []
    };

    for (const submission of batch) {
      try {
        const response = await postToGoogleAppsScript(webhookUrl, buildGoogleSheetsPayload(submission));

        if (response.statusCode >= 200 && response.statusCode < 300) {
          await markLeadSubmissionSynced(submission.id);
          results.synced += 1;
          results.syncedIds.push(submission.id);
        } else {
          const errorMessage = `Webhook returned ${response.statusCode}${response.body ? `: ${String(response.body).slice(0, 500)}` : ''}`;
          await markLeadSubmissionSyncFailed(submission.id, errorMessage);
          results.failed += 1;
          results.failedIds.push(submission.id);
          results.failedEntries.push({
            id: submission.id,
            error: errorMessage
          });
        }
      } catch (error) {
        await markLeadSubmissionSyncFailed(submission.id, error.message);
        results.failed += 1;
        results.failedIds.push(submission.id);
        results.failedEntries.push({
          id: submission.id,
          error: error.message
        });
      }
    }

    return json(200, {
      message: 'Lead sync completed',
      ...results
    });
  } catch (error) {
    console.error('Lead sync job failed:', error);
    return json(500, {
      message: 'Lead sync job failed',
      error: error.message
    });
  }
};
