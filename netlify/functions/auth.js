// Netlify Function for Authentication API
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

// In-memory storage for demo (replace with Supabase/PlanetScale for production)
const users = [];
const JWT_SECRET = process.env.JWT_SECRET;

function authUnavailable(headers) {
  return {
    statusCode: 503,
    headers,
    body: JSON.stringify({
      message: 'Authentication is not configured on this environment'
    })
  };
}

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const path = event.path.replace('/.netlify/functions/auth', '').replace('/api/auth', '');

  try {
    // SIGNUP
    if (path === '/signup' && event.httpMethod === 'POST') {
      if (!JWT_SECRET) {
        return authUnavailable(headers);
      }

      const body = JSON.parse(event.body);
      const { userType, email, password, firstName, lastName, phone, companyName, storeName } = body;

      // Check if email exists
      if (users.find(u => u.email === email)) {
        return { statusCode: 409, headers, body: JSON.stringify({ message: 'Email already registered' }) };
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);
      const userUuid = uuidv4();

      const newUser = {
        id: users.length + 1,
        uuid: userUuid,
        userType,
        email,
        passwordHash,
        firstName,
        lastName,
        phone,
        companyName: userType === 'brand' ? companyName : null,
        storeName: userType === 'retailer' ? storeName : null,
        createdAt: new Date().toISOString()
      };

      users.push(newUser);

      const token = jwt.sign({ userId: newUser.id, uuid: userUuid, email, userType }, JWT_SECRET, { expiresIn: '7d' });

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({
          message: 'Account created successfully',
          token,
          user: { id: newUser.id, uuid: userUuid, email, userType, firstName, lastName }
        })
      };
    }

    // LOGIN
    if (path === '/login' && event.httpMethod === 'POST') {
      if (!JWT_SECRET) {
        return authUnavailable(headers);
      }

      const body = JSON.parse(event.body);
      const { email, password } = body;

      const user = users.find(u => u.email === email);
      if (!user) {
        return { statusCode: 401, headers, body: JSON.stringify({ message: 'Invalid credentials' }) };
      }

      const isValid = await bcrypt.compare(password, user.passwordHash);
      if (!isValid) {
        return { statusCode: 401, headers, body: JSON.stringify({ message: 'Invalid credentials' }) };
      }

      const token = jwt.sign({ userId: user.id, uuid: user.uuid, email, userType: user.userType }, JWT_SECRET, { expiresIn: '7d' });

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          message: 'Login successful',
          token,
          user: { id: user.id, uuid: user.uuid, email, userType: user.userType, firstName: user.firstName, lastName: user.lastName }
        })
      };
    }

    // HEALTH CHECK
    if (path === '/health' || path === '') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ status: 'OK', message: 'Auth API is running', users: users.length })
      };
    }

    return { statusCode: 404, headers, body: JSON.stringify({ message: 'Not found' }) };

  } catch (error) {
    console.error('Error:', error);
    return { statusCode: 500, headers, body: JSON.stringify({ message: 'Server error', error: error.message }) };
  }
};
