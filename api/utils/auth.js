const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('./db');

const JWT_TOKEN = process.env.JWT_TOKEN;

const auth = {
  // Hash password
  hashPassword: async (password) => {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  },

  // Compare password
  comparePassword: async (plainPassword, hashedPassword) => {
    return await bcrypt.compare(plainPassword, hashedPassword);
  },

  // Generate JWT token
  generateToken: (userId, userType = 'patient') => {
    return jwt.sign(
      { userId, userType },
      JWT_TOKEN,
      { expiresIn: '24h' }
    );
  },

  // Verify JWT token
  verifyToken: (token) => {
    try {
      return jwt.verify(token, JWT_TOKEN);
    } catch (error) {
      return null;
    }
  },

  // Middleware to protect routes
  requireAuth: (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = auth.verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = decoded;
    next();
  },

  // Check if user is admin
  requireAdmin: (req, res, next) => {
    if (req.user.userType !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  },

  // Check if user is doctor
  requireDoctor: (req, res, next) => {
    if (req.user.userType !== 'doctor' && req.user.userType !== 'admin') {
      return res.status(403).json({ error: 'Doctor access required' });
    }
    next();
  },

  // Validate email format
  isValidEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Validate phone format (basic)
  isValidPhone: (phone) => {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone);
  },

  // Validate password strength
  isValidPassword: (password) => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return passwordRegex.test(password);
  },

  // Register user
  registerUser: async (userData) => {
    try {
      const { full_name, email, phone, password, user_type = 'patient' } = userData;
      console.log('Registering user with phone:', phone);

      // Check if user already exists
      const [existingUsers] = await pool.execute(
        'SELECT id FROM users WHERE email = ?',
        [email]
      );

      if (existingUsers.length > 0) {
        throw new Error('User with this email already exists');
      }

      // Hash password
      const hashedPassword = await auth.hashPassword(password);

      // Convert empty phone value to NULL allowing for optional phone registration
      const phoneValue = phone && phone.trim() !== '' ? phone : null;

      // Insert into users table
      const [result] = await pool.execute(
        'INSERT INTO users (full_name, email, phone, password_hash, user_type) VALUES (?, ?, ?, ?, ?)',
        [full_name, email, phoneValue, hashedPassword, user_type]
      );

      const userId = result.insertId;

      // Creates patient record for users registering as patients
      if (user_type === 'patient') {
        try {
          await pool.execute(
            'INSERT INTO patients (id, full_name, date_of_birth, gender, contact_info, address) VALUES (?, ?, ?, ?, ?, ?)',
            [
              userId,
              full_name,
              null, // Default date
              null, // Default gender
              email || phoneValue || '',
              null // Default address
            ]
          );
          console.log(`Patient record created for user ID: ${userId}`);
        } catch (patientError) {
          console.error('Failed to create patient record:', patientError.message);
        }
      }

      return {
        id: userId,
        full_name,
        email,
        phone: phoneValue,
        user_type
      };
    } catch (error) {
      throw new Error(`Error registering user: ${error.message}`);
    }
  },

  // Login user
  loginUser: async (email, password) => {
    try {
      // Get user from database
      const [users] = await pool.execute(
        'SELECT id, full_name, email, password_hash, user_type FROM users WHERE email = ?',
        [email]
      );

      if (users.length === 0) {
        throw new Error('Invalid email or password');
      }

      const user = users[0];

      // Verify password
      const isValidPassword = await auth.comparePassword(password, user.password_hash);
      if (!isValidPassword) {
        throw new Error('Invalid email or password');
      }

      // Generate token
      const token = auth.generateToken(user.id, user.user_type);

      return {
        user: {
          id: user.id,
          full_name: user.full_name,
          email: user.email,
          user_type: user.user_type
        },
        token
      };
    } catch (error) {
      throw new Error(`Error logging in: ${error.message}`);
    }
  },

  // Register user by phone
  registerUserByPhone: async (userData) => {
    try {
      const { full_name, phone, password, user_type = 'patient' } = userData;

      // Validate that phone is provided
      if (!phone || phone.trim() === '') {
        throw new Error('Phone number is required for phone registration');
      }

      // Check if user already exists
      const [existingUsers] = await pool.execute(
        'SELECT id FROM users WHERE phone = ?',
        [phone]
      );

      if (existingUsers.length > 0) {
        throw new Error('User with this phone number already exists');
      }

      // Hash password
      const hashedPassword = await auth.hashPassword(password);

      // Insert into users table
      const [result] = await pool.execute(
        'INSERT INTO users (full_name, phone, password_hash, user_type) VALUES (?, ?, ?, ?)',
        [full_name, phone, hashedPassword, user_type]
      );

      const userId = result.insertId;

      // Creates patient record for feature phone users registering as patients
      if (user_type === 'patient') {
        try {
          await pool.execute(
            'INSERT INTO patients (id, full_name, date_of_birth, gender, contact_info, address) VALUES (?, ?, ?, ?, ?, ?)',
            [
              userId, // Use same ID as user
              full_name,
              null, // Default date - you might want to collect this later
              null, // Default gender
              phone, // Use phone as contact
              null // Default address
            ]
          );
          console.log(`Patient record created for user ID: ${userId}`);
        } catch (patientError) {
          console.error('Failed to create patient record:', patientError.message);
          // Don't throw error here - user registration succeeded, patient creation failed
        }
      }

      return {
        id: userId,
        full_name,
        phone,
        user_type
      };
    } catch (error) {
      throw new Error(`Error registering user by phone: ${error.message}`);
    }
  },

  // Login user by phone
  loginUserByPhone: async (phone, password) => {
    try {
      // Get user from database
      const [users] = await pool.execute(
        'SELECT id, full_name, phone, password_hash, user_type FROM users WHERE phone = ?',
        [phone]
      );

      if (users.length === 0) {
        throw new Error('Invalid phone number or password');
      }

      const user = users[0];

      // Verify password
      const isValidPassword = await auth.comparePassword(password, user.password_hash);
      if (!isValidPassword) {
        throw new Error('Invalid phone number or password');
      }

      // Generate token
      const token = auth.generateToken(user.id, user.user_type);

      return {
        user: {
          id: user.id,
          full_name: user.full_name,
          phone: user.phone,
          user_type: user.user_type
        },
        token
      };
    } catch (error) {
      throw new Error(`Error logging in by phone: ${error.message}`);
    }
  }
};

module.exports = auth;