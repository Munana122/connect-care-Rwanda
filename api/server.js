const express = require('express');
const cors = require('cors');
require('dotenv').config();
const auth = require('./utils/auth');
const patientUtils = require('./utils/patient');
const doctorUtils = require('./utils/doctor');
const consultationUtils = require('./utils/consultation');
const paymentUtils = require('./utils/payment');

const app = express();
const PORT = process.env.PORT || 3000;
const pool = require('./utils/db');

app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.send('API is running');
});

// Auth routes
app.post('/auth/register', async (req, res) => {
  try {
    const { full_name, email, phone, password, user_type = 'patient' } = req.body;
    
    // Validate input
    if (!full_name || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields: full_name, email, and password are required' });
    }
    
    if (!auth.isValidEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    
    if (!auth.isValidPassword(password)) {
      return res.status(400).json({ error: 'Password must be at least 8 characters with uppercase, lowercase, and number' });
    }
    
    // Validate phone if provided
    if (phone && phone.trim() !== '' && !auth.isValidPhone(phone)) {
      return res.status(400).json({ error: 'Invalid phone format' });
    }
    
    // Register user
    const user = await auth.registerUser({ full_name, email, phone, password, user_type });
    
    // Generate token
    const token = auth.generateToken(user.id, user_type);
    
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        user_type: user_type
      },
      token
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    
    if (!auth.isValidEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    
    // Login user
    const { user, token } = await auth.loginUser(email, password);
    
    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        user_type: 'patient'
      },
      token
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({ error: error.message || 'Invalid email or password' });
  }
});

app.post('/auth/register-phone', async (req, res) => {
  try {
    const { full_name, phone, password, user_type = 'patient' } = req.body;
    
    // Validate input
    if (!full_name || !phone || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    if (!auth.isValidPhone(phone)) {
      return res.status(400).json({ error: 'Invalid phone format' });
    }
    
    if (!auth.isValidPassword(password)) {
      return res.status(400).json({ error: 'Password must be at least 8 characters with uppercase, lowercase, and number' });
    }
    
    // Register user by phone
    const user = await auth.registerUserByPhone({ full_name, phone, password, user_type });
    
    // Generate token
    const token = auth.generateToken(user.id, user_type);
    
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        full_name: user.full_name,
        phone: user.phone,
        user_type: user_type
      },
      token
    });
    
  } catch (error) {
    console.error('Phone registration error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

app.post('/auth/login-phone', async (req, res) => {
  try {
    const { phone, password } = req.body;
    
    // Validate input
    if (!phone || !password) {
      return res.status(400).json({ error: 'Phone and password required' });
    }
    
    if (!auth.isValidPhone(phone)) {
      return res.status(400).json({ error: 'Invalid phone format' });
    }
    
    // Login user by phone
    const { user, token } = await auth.loginUserByPhone(phone, password);
    
    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        full_name: user.full_name,
        phone: user.phone,
        user_type: 'patient'
      },
      token
    });
    
  } catch (error) {
    console.error('Phone login error:', error);
    res.status(401).json({ error: error.message || 'Invalid phone number or password' });
  }
});

// Patient routes
app.get('/patients', auth.requireAuth, async (req, res) => {
  try {
    const patients = await patientUtils.getAllPatients();
    res.json(patients);
  } catch (error) {
    console.error('Get patients error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/patients/:id', auth.requireAuth, async (req, res) => {
  try {
    const patient = await patientUtils.getPatientById(req.params.id);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    res.json(patient);
  } catch (error) {
    console.error('Get patient error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/patients', auth.requireAuth, async (req, res) => {
  try {
    const patientId = await patientUtils.createPatient(req.body);
    res.status(201).json({ id: patientId, message: 'Patient created successfully' });
  } catch (error) {
    console.error('Create patient error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

app.put('/patients/:id', auth.requireAuth, async (req, res) => {
  try {
    const success = await patientUtils.updatePatient(req.params.id, req.body);
    if (!success) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    res.json({ message: 'Patient updated successfully' });
  } catch (error) {
    console.error('Update patient error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/patients/:id', auth.requireAuth, async (req, res) => {
  try {
    const success = await patientUtils.deletePatient(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    res.json({ message: 'Patient deleted successfully' });
  } catch (error) {
    console.error('Delete patient error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Doctor routes
app.get('/doctors', auth.requireAuth, async (req, res) => {
  try {
    const doctors = await doctorUtils.getAllDoctors();
    res.json(doctors);
  } catch (error) {
    console.error('Get doctors error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/doctors/:id', auth.requireAuth, async (req, res) => {
  try {
    const doctor = await doctorUtils.getDoctorById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }
    res.json(doctor);
  } catch (error) {
    console.error('Get doctor error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/doctors', auth.requireAuth, async (req, res) => {
  try {
    const doctorId = await doctorUtils.createDoctor(req.body);
    res.status(201).json({ id: doctorId, message: 'Doctor created successfully' });
  } catch (error) {
    console.error('Create doctor error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

app.put('/doctors/:id', auth.requireAuth, async (req, res) => {
  try {
    const success = await doctorUtils.updateDoctor(req.params.id, req.body);
    if (!success) {
      return res.status(404).json({ error: 'Doctor not found' });
    }
    res.json({ message: 'Doctor updated successfully' });
  } catch (error) {
    console.error('Update doctor error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/doctors/:id', auth.requireAuth, async (req, res) => {
  try {
    const success = await doctorUtils.deleteDoctor(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Doctor not found' });
    }
    res.json({ message: 'Doctor deleted successfully' });
  } catch (error) {
    console.error('Delete doctor error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Consultation routes
app.get('/consultations', auth.requireAuth, async (req, res) => {
  try {
    const consultations = await consultationUtils.getAllConsultations();
    res.json(consultations);
  } catch (error) {
    console.error('Get consultations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/consultations/:id', auth.requireAuth, async (req, res) => {
  try {
    const consultation = await consultationUtils.getConsultationById(req.params.id);
    if (!consultation) {
      return res.status(404).json({ error: 'Consultation not found' });
    }
    res.json(consultation);
  } catch (error) {
    console.error('Get consultation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/consultations/patient/:patientId', auth.requireAuth, async (req, res) => {
  try {
    const consultations = await consultationUtils.getConsultationsByPatientId(req.params.patientId);
    res.json(consultations);
  } catch (error) {
    console.error('Get consultations by patient error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/consultations/doctor/:doctorId', auth.requireAuth, async (req, res) => {
  try {
    const consultations = await consultationUtils.getConsultationsByDoctorId(req.params.doctorId);
    res.json(consultations);
  } catch (error) {
    console.error('Get consultations by doctor error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/consultations', auth.requireAuth, async (req, res) => {
  try {
    const consultationId = await consultationUtils.createConsultation(req.body);
    res.status(201).json({ id: consultationId, message: 'Consultation created successfully' });
  } catch (error) {
    console.error('Create consultation error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

app.put('/consultations/:id', auth.requireAuth, async (req, res) => {
  try {
    const success = await consultationUtils.updateConsultation(req.params.id, req.body);
    if (!success) {
      return res.status(404).json({ error: 'Consultation not found' });
    }
    res.json({ message: 'Consultation updated successfully' });
  } catch (error) {
    console.error('Update consultation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/consultations/:id', auth.requireAuth, async (req, res) => {
  try {
    const success = await consultationUtils.deleteConsultation(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Consultation not found' });
    }
    res.json({ message: 'Consultation deleted successfully' });
  } catch (error) {
    console.error('Delete consultation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Payment routes
app.get('/payments', auth.requireAuth, async (req, res) => {
  try {
    const payments = await paymentUtils.getAllPayments();
    res.json(payments);
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/payments/:id', auth.requireAuth, async (req, res) => {
  try {
    const payment = await paymentUtils.getPaymentById(req.params.id);
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    res.json(payment);
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/payments/patient/:patientId', auth.requireAuth, async (req, res) => {
  try {
    const payments = await paymentUtils.getPaymentsByPatientId(req.params.patientId);
    res.json(payments);
  } catch (error) {
    console.error('Get payments by patient error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/payments', auth.requireAuth, async (req, res) => {
  try {
    const paymentId = await paymentUtils.createPayment(req.body);
    res.status(201).json({ id: paymentId, message: 'Payment created successfully' });
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

app.put('/payments/:id', auth.requireAuth, async (req, res) => {
  try {
    const success = await paymentUtils.updatePayment(req.params.id, req.body);
    if (!success) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    res.json({ message: 'Payment updated successfully' });
  } catch (error) {
    console.error('Update payment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/payments/:id', auth.requireAuth, async (req, res) => {
  try {
    const success = await paymentUtils.deletePayment(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    res.json({ message: 'Payment deleted successfully' });
  } catch (error) {
    console.error('Delete payment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route to setup db
app.get('/setup-db', async (req, res) => {
  try {
    
    const setupSQL = `
        -- Users table for authentication
        CREATE TABLE IF NOT EXISTS users (
          id INT PRIMARY KEY AUTO_INCREMENT,
          full_name VARCHAR(200) NOT NULL,
          email VARCHAR(255) UNIQUE,
          phone VARCHAR(20) UNIQUE,
          password_hash VARCHAR(255) NOT NULL,
          user_type ENUM('patient', 'doctor') DEFAULT 'patient',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Patients table
        CREATE TABLE IF NOT EXISTS patients (
          id INT PRIMARY KEY AUTO_INCREMENT,
          full_name VARCHAR(200) NOT NULL,
          date_of_birth DATE,
          gender VARCHAR(15),
          contact_info VARCHAR(200),
          address TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Doctors table
        CREATE TABLE IF NOT EXISTS doctors (
          id INT PRIMARY KEY AUTO_INCREMENT,
          full_name VARCHAR(100) NOT NULL,
          specialty VARCHAR(50) NOT NULL,
          license_number VARCHAR(50) UNIQUE NOT NULL,
          contact_info VARCHAR(100),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Consultations table WITH STATUS COLUMN
        CREATE TABLE IF NOT EXISTS consultations (
          id INT PRIMARY KEY AUTO_INCREMENT,
          patient_id INT NOT NULL,
          doctor_id INT NOT NULL,
          consultation_date DATE NOT NULL,
          notes TEXT,
          diagnosis TEXT,
          prescription TEXT,
          status ENUM('pending', 'completed', 'cancelled') DEFAULT 'pending',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
          FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
        );

        -- Payments table
        CREATE TABLE IF NOT EXISTS Payments (
          id INT PRIMARY KEY AUTO_INCREMENT,
          patient_id INT NOT NULL,
          consultation_id INT,
          payment_date DATE NOT NULL,
          amount DECIMAL(10,2) NOT NULL,
          payment_method VARCHAR(50) NOT NULL,
          receipt_number VARCHAR(100),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
          FOREIGN KEY (consultation_id) REFERENCES consultations(id) ON DELETE SET NULL
        );
      `;

    const sampleDataSQL = `
        -- Add sample doctors (ENSURE ID 1 EXISTS)
        INSERT IGNORE INTO doctors (id, full_name, specialty, license_number, contact_info) VALUES
        (1, 'Dr. Default', 'General Practice', 'MD000', 'default@hospital.com'),
        (2, 'Dr. Ngarambe', 'Cardiology', 'MD001', 'dr.Ngarambe@hospital.com'),
        (3, 'Dr. Steven', 'General Practice', 'MD002', 'dr.Steven@hospital.com'),
        (4, 'Dr. Kalisa', 'Pediatrics', 'MD003', 'dr.Kalisa@hospital.com');

        -- Add sample patients
        INSERT IGNORE INTO patients (full_name, date_of_birth, gender, contact_info, address) VALUES
        ('Admire chaga', '1985-03-15', 'Male', 'admire@email.com', '123 Main St'),
        ('Merveille Munana', '1965-07-22', 'Female', 'mmunana@email.com', '456 st '),
        ('David Kayumba', '1998-11-03', 'Male', 'davk@email.com', '7Rd');

        -- Add sample consultations WITH STATUS
        INSERT IGNORE INTO consultations (patient_id, doctor_id, consultation_date, notes, diagnosis, status) VALUES
        (1, 1, '2024-07-20', 'Patient complained of chest pain', 'Mild angina', 'completed'),
        (2, 2, '2024-07-21', 'Regular checkup', 'Healthy', 'completed'),
        (3, 3, '2024-07-22', 'Child vaccination', 'Vaccination completed', 'completed');

        -- Add sample payments
        INSERT IGNORE INTO Payments (patient_id, consultation_id, payment_date, amount, payment_method, receipt_number) VALUES
        (1, 1, '2024-07-20', 150.00, 'Credit Card', 'REC001'),
        (2, 2, '2024-07-21', 80.00, 'Cash', 'REC002'),
        (3, 3, '2024-07-22', 120.00, 'Insurance', 'REC003');
      `;

    // Split SQL into individual statements
    const setupStatements = setupSQL.split(';').filter(stmt => stmt.trim());
    const dataStatements = sampleDataSQL.split(';').filter(stmt => stmt.trim());

    // Execute setup statements
    for (const statement of setupStatements) {
      if (statement.trim()) {
        await pool.execute(statement);
        console.log('Executed:', statement.substring(0, 50) + '...');
      }
    }

    // Execute sample data statements
    for (const statement of dataStatements) {
      if (statement.trim()) {
        await pool.execute(statement);
        console.log('Executed:', statement.substring(0, 50) + '...');
      }
    }

    res.json({ 
      message: 'Database setup completed successfully!',
      tables_created: ['users', 'patients', 'doctors', 'consultations', 'Payments'],
      sample_data: 'Sample records inserted'
    });

  } catch (error) {
    console.error('Database setup error:', error);
    res.status(500).json({ 
      error: 'Database setup failed',
      details: error.message 
    });
  }
});

app.get('/debug-tables', async (req, res) => {
  try {
    const pool = require('./utils/db');
    const tablesToDebug = ['users', 'patients', 'doctors', 'consultations', 'Payments'];
    const debugInfo = {};

    for (const table of tablesToDebug) {
      try {
        const [columns] = await pool.execute(`DESCRIBE ${table}`);
        const [createTable] = await pool.execute(`SHOW CREATE TABLE ${table}`);
        debugInfo[table] = {
          columns: columns,
          create_statement: createTable[0]['Create Table']
        };
      } catch (tableError) {
        debugInfo[table] = { error: tableError.message };
      }
    }
    
    res.json(debugInfo);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// AI Triage
app.post('/triage', async (req, res) => {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
});

// Payment webhook
app.post('/payment/webhook', (req, res) => {
  res.send('Payment webhook endpoint');
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`API running on port ${PORT}`);
});

module.exports = app;