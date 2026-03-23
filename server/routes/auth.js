const express = require('express');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { body, validationResult } = require('express-validator');
const { queryOne, run } = require('../database');
const { generateToken, authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const signupValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('firstName').trim().notEmpty().withMessage('First name required'),
  body('lastName').trim().notEmpty().withMessage('Last name required'),
  body('userType').isIn(['retailer', 'brand']).withMessage('Invalid user type')
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required')
];

// SIGN UP
router.post('/signup', signupValidation, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const {
      userType,
      email,
      password,
      firstName,
      lastName,
      phone,
      companyName,
      productCategory,
      storeName,
      storeType,
      storeLocation
    } = req.body;

    // Check if email already exists
    const existingUser = await queryOne('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Generate UUID
    const userUuid = uuidv4();

    // Insert user
    const userResult = await run(
      `INSERT INTO users (uuid, user_type, email, password_hash, first_name, last_name, phone)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userUuid, userType, email, passwordHash, firstName, lastName, phone || null]
    );

    const userId = userResult.id;

    // Insert profile based on user type
    if (userType === 'brand') {
      await run(
        `INSERT INTO brand_profiles (user_id, company_name, product_category)
         VALUES (?, ?, ?)`,
        [userId, companyName || `${firstName}'s Brand`, productCategory || null]
      );
    } else {
      await run(
        `INSERT INTO retailer_profiles (user_id, store_name, store_type, location)
         VALUES (?, ?, ?, ?)`,
        [userId, storeName || `${firstName}'s Store`, storeType || null, storeLocation || null]
      );
    }

    // Generate token
    const token = generateToken({
      id: userId,
      uuid: userUuid,
      email,
      user_type: userType
    });

    // Return success with token
    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: {
        id: userId,
        uuid: userUuid,
        email,
        userType,
        firstName,
        lastName,
        phone
      }
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error during signup' });
  }
});

// LOGIN
router.post('/login', loginValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { email, password, remember } = req.body;

    // Find user
    const user = await queryOne(
      `SELECT u.*, 
        bp.company_name as brand_company,
        rp.store_name as retailer_store
       FROM users u
       LEFT JOIN brand_profiles bp ON u.id = bp.user_id
       LEFT JOIN retailer_profiles rp ON u.id = rp.user_id
       WHERE u.email = ?`,
      [email]
    );

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.is_active) {
      return res.status(401).json({ message: 'Account is deactivated' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Update last login
    await run(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
      [user.id]
    );

    // Generate token
    const token = generateToken(user);

    // Return success
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        uuid: user.uuid,
        email: user.email,
        userType: user.user_type,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        companyName: user.brand_company,
        storeName: user.retailer_store,
        isVerified: user.is_verified === 1
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// GET CURRENT USER
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await queryOne(
      `SELECT u.id, u.uuid, u.email, u.user_type, u.first_name, u.last_name, u.phone, 
        u.is_verified, u.profile_image, u.created_at,
        bp.company_name, bp.product_category, bp.website, bp.business_reg_number,
        rp.store_name, rp.store_type, rp.location, rp.address, rp.city, rp.state
       FROM users u
       LEFT JOIN brand_profiles bp ON u.id = bp.user_id
       LEFT JOIN retailer_profiles rp ON u.id = rp.user_id
       WHERE u.id = ?`,
      [req.user.id]
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: {
        id: user.id,
        uuid: user.uuid,
        email: user.email,
        userType: user.user_type,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        isVerified: user.is_verified === 1,
        profileImage: user.profile_image,
        createdAt: user.created_at,
        profile: user.user_type === 'brand' ? {
          companyName: user.company_name,
          productCategory: user.product_category,
          website: user.website,
          businessRegNumber: user.business_reg_number
        } : {
          storeName: user.store_name,
          storeType: user.store_type,
          location: user.location,
          address: user.address,
          city: user.city,
          state: user.state
        }
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// LOGOUT (invalidate token - client should also remove token)
router.post('/logout', authenticateToken, async (req, res) => {
  // In a more advanced setup, you could blacklist the token
  // For now, we just acknowledge the logout
  res.json({ message: 'Logout successful' });
});

// UPDATE PROFILE
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { firstName, lastName, phone } = req.body;
    
    await run(
      'UPDATE users SET first_name = ?, last_name = ?, phone = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [firstName, lastName, phone, req.user.id]
    );

    res.json({ message: 'Profile updated successfully' });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// CHANGE PASSWORD
router.put('/password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Get current password hash
    const user = await queryOne('SELECT password_hash FROM users WHERE id = ?', [req.user.id]);
    
    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValid) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const newHash = await bcrypt.hash(newPassword, 10);
    
    // Update password
    await run(
      'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [newHash, req.user.id]
    );

    res.json({ message: 'Password changed successfully' });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// FORGOT PASSWORD (skeleton)
router.post('/forgot-password', async (req, res) => {
  // TODO: Implement password reset with email
  res.status(501).json({ message: 'Password reset coming soon' });
});

// GOOGLE SIGN-IN (skeleton)
router.post('/google', async (req, res) => {
  // TODO: Implement Google OAuth
  // 1. Verify Google ID token
  // 2. Check if user exists
  // 3. Create new user if not exists
  // 4. Generate JWT token
  res.status(501).json({ message: 'Google Sign-In coming soon' });
});

module.exports = router;
