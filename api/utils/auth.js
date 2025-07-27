const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('./db');

const JWT_TOKEN = process.env.JWT_TOKEN;

const auth = {
  hashPassword: async (password) => {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  },

  comparePassword: async (plainPassword, hashedPassword) => {
    return await bcrypt.compare(plainPassword, hashedPassword);
  },

  generateToken: (userId, userType = 'patient') => {
    return jwt.sign(
      { userId, userType },
      JWT_TOKEN,
      { expiresIn: '24h' }
    );
  },

  verifyToken: (token) => {
    try {
      return jwt.verify(token, JWT_TOKEN);
    } catch (error) {
      return null;
    }
  },

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

  requireAdmin: (req, res, next) => {
    if (req.user.userType !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  },

  requireDoctor: (req, res, next) => {
    if (req.user.userType !== 'doctor' && req.user.userType !== 'admin') {
      return res.status(403).json({ error: 'Doctor access required' });
    }
    next();
  },

  isValidEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  isValidPhone: (phone) => {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone);
  },

  isValidPassword: (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return passwordRegex.test(password);
  },

  registerUser: async (userData) => {
    try {
      const { full_name, email, phone, password, user_type = 'patient' } = userData;

      const [existingUsers] = await pool.execute(
        'SELECT id FROM users WHERE email = ?',
        [email]
      );

      if (existingUsers.length > 0) {
        throw new Error('User with this email already exists');
      }

      const hashedPassword = await auth.hashPassword(password);

      const [result] = await pool.execute(
        'INSERT INTO users (full_name, email, phone, password_hash, user_type) VALUES (?, ?, ?, ?, ?)',
        [full_name, email, phone, hashedPassword, user_type]
      );

      const userId = result.insertId;

      if (user_type === 'patient') {
        try {
          const defaultDate = new Date().toISOString().split('T')[0];
          await pool.execute(
            'INSERT INTO patients (id, full_name, date_of_birth, gender, contact_info, address) VALUES (?, ?, ?, ?, ?, ?)',
            [
              userId,
              full_name,
              defaultDate,
              'Not specified',
              email || phone || '',
              'Not specified'
            ]
          );
        } catch (patientError) {
          console.error('Failed to create patient record:', patientError.message);
        }
      }

      return {
        id: userId,
        full_name,
        email,
        phone,
        user_type
      };
    } catch (error) {
      throw new Error(`Error registering user: ${error.message}`);
    }
  },

  loginUser: async (email, password) => {
    try {
      const [users] = await pool.execute(
        'SELECT id, full_name, email, password_hash, user_type FROM users WHERE email = ?',
        [email]
      );

      if (users.length === 0) {
        throw new Error('Invalid email or password');
      }

      const user = users[0];

      const isValidPassword = await auth.comparePassword(password, user.password_hash);
      if (!isValidPassword) {
        throw new Error('Invalid email or password');
      }

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

  registerUserByPhone: async (userData) => {
    try {
      const { full_name, phone, password, user_type = 'patient' } = userData;

      const [existingUsers] = await pool.execute(
        'SELECT id FROM users WHERE phone = ?',
        [phone]
      );

      if (existingUsers.length > 0) {
        throw new Error('User with this phone number already exists');
      }

      const hashedPassword = await auth.hashPassword(password);

      const [result] = await pool.execute(
        'INSERT INTO users (full_name, phone, password_hash, user_type) VALUES (?, ?, ?, ?)',
        [full_name, phone, hashedPassword, user_type]
      );

      const userId = result.insertId;

      if (user_type === 'patient') {
        try {
          const defaultDate = new Date().toISOString().split('T')[0];
          await pool.execute(
            'INSERT INTO patients (id, full_name, date_of_birth, gender, contact_info, address) VALUES (?, ?, ?, ?, ?, ?)',
            [
              userId,
              full_name,
              defaultDate,
              'Not specified',
              phone,
              'Not specified'
            ]
          );
        } catch (patientError) {
          console.error('Failed to create patient record:', patientError.message);
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

  loginUserByPhone: async (phone, password) => {
    try {
      const [users] = await pool.execute(
        'SELECT id, full_name, phone, password_hash, user_type FROM users WHERE phone = ?',
        [phone]
      );

      if (users.length === 0) {
        throw new Error('Invalid phone number or password');
      }

      const user = users[0];

      const isValidPassword = await auth.comparePassword(password, user.password_hash);
      if (!isValidPassword) {
        throw new Error('Invalid phone number or password');
      }

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

