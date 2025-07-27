
-- Create database
CREATE DATABASE IF NOT EXISTS connect_care;
USE connect_care;

-- Create patients table
CREATE TABLE patients (
    id INT PRIMARY KEY AUTO_INCREMENT,
    patient_id VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(200) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(10) NOT NULL,
    contact_info VARCHAR(100),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create table doctors
CREATE TABLE doctors (
    id INT PRIMARY KEY AUTO_INCREMENT,
    doctor_id VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(200) NOT NULL,
    specialty VARCHAR(100) NOT NULL,
    license_number VARCHAR(50) UNIQUE NOT NULL,
    contact_info VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- create consultation table
CREATE TABLE consultations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    patient_id VARCHAR(50) NOT NULL,
    doctor_id VARCHAR(50) NOT NULL,
    consultation_date DATE NOT NULL,
    notes TEXT,
    diagnosis TEXT,
    prescription TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id) ON DELETE CASCADE
);

-- create payment table
CREATE TABLE payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    patient_id VARCHAR(50) NOT NULL,
    payment_date DATE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    receipt_number VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE
);

-- create index
CREATE INDEX idx_patient_id ON patients(patient_id);
CREATE INDEX idx_doctor_id ON doctors(doctor_id);
CREATE INDEX idx_consultation_patient ON consultations(patient_id);
CREATE INDEX idx_consultation_doctor ON consultations(doctor_id);
CREATE INDEX idx_consultation_date ON consultations(consultation_date);
CREATE INDEX idx_payment_patient ON payments(patient_id);
CREATE INDEX idx_payment_date ON payments(payment_date);

-- for testing 
INSERT INTO patients (patient_id, full_name, date_of_birth, gender, contact_info, address) VALUES
('PAT001', 'admire cha', '1990-01-15', 'Male', '+25079178098', '123 Main St, City, kig'),
('PAT002', 'meme munana', '1989-03-22', 'Female', '+250788441784', '456 st Ave, City, kig'),
('PAT003', 'constatin aka', '1991-11-09', 'Male', '+250722257777', '789 duo rd, City, kig');

INSERT INTO doctors (doctor_id, full_name, specialty, license_number, contact_info) VALUES
('DOC001', 'Dr. Sarah Wilson', 'General Medicine', 'LIC123456', '+56806334789'),
('DOC002', 'Dr. sarah davy', 'Cardiology', 'LIC123457', '+346786789'),
('DOC003', 'Dr. stone Davis', 'Pediatrics', 'LIC78943458', '+89642214568');

INSERT INTO consultations (patient_id, doctor_id, consultation_date, notes, diagnosis, prescription) VALUES
('PAT001', 'DOC001', '2024-01-15', 'Regular checkup', 'Healthy', 'Multivitamins'),
('PAT002', 'DOC002', '2024-01-16', 'Chest pain complaint', 'Mild hypertension', 'Blood pressure medication'),
('PAT003', 'DOC001', '2024-01-17', 'legs', 'Viral infection', 'walking and pain killers');

INSERT INTO payments (patient_id, payment_date, amount, payment_method, receipt_number) VALUES
('PAT001', '2024-01-15', 150.00, 'Credit Card', 'RCP001'),
('PAT002', '2024-01-16', 200.00, 'Cash', 'RCP002'),
('PAT003', '2024-01-17', 100.00, 'Insurance', 'RCP003');

-- Views for common queries
CREATE VIEW patient_consultations AS
SELECT 
    p.patient_id,
    p.full_name as patient_name,
    d.full_name as doctor_name,
    d.specialty,
    c.consultation_date,
    c.diagnosis,
    c.prescription
FROM consultations c
JOIN patients p ON c.patient_id = p.patient_id
JOIN doctors d ON c.doctor_id = d.doctor_id;

CREATE VIEW payment_summary AS
SELECT 
    p.patient_id,
    pat.full_name as patient_name,
    COUNT(*) as total_payments,
    SUM(p.amount) as total_amount,
    AVG(p.amount) as average_payment
FROM payments p
JOIN patients pat ON p.patient_id = pat.patient_id
GROUP BY p.patient_id, pat.full_name;

-- Stored procedure for adding new consultation
DELIMITER //
CREATE PROCEDURE AddConsultation(
    IN p_patient_id VARCHAR(50),
    IN p_doctor_id VARCHAR(50),
    IN p_consultation_date DATE,
    IN p_notes TEXT,
    IN p_diagnosis TEXT,
    IN p_prescription TEXT
)
BEGIN
    INSERT INTO consultations (patient_id, doctor_id, consultation_date, notes, diagnosis, prescription)
    VALUES (p_patient_id, p_doctor_id, p_consultation_date, p_notes, p_diagnosis, p_prescription);
END //
DELIMITER ;

-- Stored procedure for processing payment
DELIMITER //
CREATE PROCEDURE ProcessPayment(
    IN p_patient_id VARCHAR(50),
    IN p_amount DECIMAL(10,2),
    IN p_payment_method VARCHAR(50),
    IN p_receipt_number VARCHAR(100)
)
BEGIN
    INSERT INTO payments (patient_id, payment_date, amount, payment_method, receipt_number)
    VALUES (p_patient_id, CURDATE(), p_amount, p_payment_method, p_receipt_number);
END //
DELIMITER ;
