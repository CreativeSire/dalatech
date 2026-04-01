const https = require('https');
const { URL } = require('url');

function requestUrl(urlString, options = {}, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlString);
    const req = https.request(
      {
        protocol: url.protocol,
        hostname: url.hostname,
        port: url.port || undefined,
        path: `${url.pathname}${url.search}`,
        method: options.method || 'GET',
        headers: options.headers || {}
      },
      (response) => {
        let responseBody = '';
        response.on('data', (chunk) => {
          responseBody += chunk;
        });
        response.on('end', () => {
          resolve({
            statusCode: response.statusCode || 0,
            headers: response.headers || {},
            body: responseBody
          });
        });
      }
    );

    req.on('error', reject);

    if (body) {
      req.write(body);
    }

    req.end();
  });
}

async function postToGoogleAppsScript(webhookUrl, payload) {
  const serializedBody = JSON.stringify(payload);

  try {
    const fetchResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/plain, */*'
      },
      body: serializedBody,
      redirect: 'follow'
    });

    const fetchBody = await fetchResponse.text();
    if (fetchResponse.status >= 200 && fetchResponse.status < 300) {
      return {
        statusCode: fetchResponse.status,
        headers: Object.fromEntries(fetchResponse.headers.entries()),
        body: fetchBody
      };
    }
  } catch (error) {
    // Fall through to the lower-level request path below.
  }

  const initialResponse = await requestUrl(
    webhookUrl,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(serializedBody)
      }
    },
    serializedBody
  );

  if (
    [301, 302, 303, 307, 308].includes(initialResponse.statusCode) &&
    initialResponse.headers.location
  ) {
    return requestUrl(initialResponse.headers.location, { method: 'GET' });
  }

  return initialResponse;
}

module.exports = {
  postToGoogleAppsScript
};
