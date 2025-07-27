# API Documentation

This document provides an overview of the ConnectCare Rwanda API going into detail on each of the available endpoints, authentication methods, and how to interact with each resource.

## Base URL

Once the API (server.js) is running, it can be access at `http://localhost:3000`
which serves as the base URL for all API endpoints.


## Authentication

Most API endpoints require authentication using a JSON Web Token (JWT).
1.  To obtain a JWT first **Register** or **Login** (see [Authentication](#1-authentication)). 
The response will contain the header `Token` with the JWT as the value.
2.  Include the JWT in the `Authorization` header of your requests, prefixed with `Bearer`.

**Example Header:**
`Authorization: Bearer JWT`

## Endpoints

### 1. Authentication

#### `POST /auth/register`
Registers a new user.
-   **Description:** Creates a new user account (patient, doctor or admin).
-   **Request Body:**
    ```json
    {
      "full_name": "string",
      "email": "string (unique)",
      "phone": "string (optional)",
      "password": "string (min 8 chars, 1 uppercase, 1 lowercase, 1 number)",
      "user_type": "string (optional, default: 'patient')"
    }
    ```
-   **Response Body (Success - 201 Created):**
    ```json
    {
      "message": "User registered successfully",
      "user": {
        "id": "number",
        "full_name": "string",
        "email": "string",
        "phone": "string",
        "user_type": "string"
      },
      "token": "string (JWT)"
    }
    ```
-   **Example `curl`:**
    ```bash
    curl -X POST http://localhost:3000/auth/register \ -H "Content-Type: application/json" \ -d '{"full_name": "Jane Doe", "email": "jane.doe@example.com", "phone": "1234567890", "password": "SecurePassword123", "user_type": "patient"}'
    ```


#### `POST /auth/login`
Authenticates a user and returns a JWT.
-   **Description:** Logs in an existing user and provides an authentication token.
-   **Request Body:**
    ```json
    {
      "email": "string",
      "password": "string"
    }
    ```
-   **Response Body (Success - 200 OK):**
    ```json
    {
      "message": "Login successful",
      "user": {
        "id": "number",
        "full_name": "string",
        "email": "string",
        "user_type": "string"
      },
      "token": "string (JWT)"
    }
    ```
-   **Example `curl`:**
    ```bash
    curl -X POST http://localhost:3000/auth/login \ -H "Content-Type: application/json" \ -d '{"email": "jane.doe@example.com", "password": "SecurePassword123"}'
    ```


### 2. Patients

#### `GET /patients`
Retrieves a list of all patients.
-   **Description:** Returns an array of all patient records.
-   **Authentication:** Required
-   **Response Body (Success - 200 OK):**
    ```json
    [
      {
        "id": "number",
        "full_name": "string",
        "date_of_birth": "string (YYYY-MM-DD)",
        "gender": "string",
        "contact_info": "string",
        "address": "string",
        "email": "string",
        "phone": "string",
        "user_type": "string",
        "created_at": "string (DATETIME)"
      }
    ]
    ```
-   **Example `curl`:**
    ```bash
    curl -X GET http://localhost:3000/patients \ -H "Authorization: Bearer JWT"
    ```


#### `GET /patients/:id`
Retrieves a patient by ID.
-   **Description:** Returns a specific patient record based on their ID.
-   **Authentication:** Required
-   **URL Parameters:** `id` (number) - The patient ID.
-   **Response Body (Success - 200 OK):**
    ```json
    {
      "id": "number",
      "full_name": "string",
      "date_of_birth": "string (YYYY-MM-DD)",
      "gender": "string",
      "contact_info": "string",
      "address": "string",
      "email": "string",
      "phone": "string",
      "user_type": "string",
      "created_at": "string (DATETIME)"
    }
    ```
-   **Example `curl`:**
    ```bash
    curl -X GET http://localhost:3000/patients/1 \ -H "Authorization: Bearer JWT"
    ```


#### `POST /patients`
Creates a new patient record.
-   **Description:** Adds a new patient to the database.
-   **Authentication:** Required
-   **Request Body:**
    ```json
    {
      "full_name": "string",
      "date_of_birth": "string (YYYY-MM-DD)",
      "gender": "string",
      "contact_info": "string (optional)",
      "address": "string (optional)",
      "email": "string (unique)",
      "phone": "string (optional)",
      "password": "string"
    }
    ```
-   **Response Body (Success - 201 Created):**
    ```json
    {
      "id": "number",
      "message": "Patient created successfully"
    }
    ```
-   **Example `curl`:**
    ```bash
    curl -X POST http://localhost:3000/patients \ -H "Content-Type: application/json" \ -H "Authorization: Bearer JWT" \ -d '{"full_name": "New Patient", "date_of_birth": "1990-01-01", "gender": "Female", "contact_info": "new.patient.contact@example.com", "address": "KN 321", "email": "new.patient@example.com", "phone": "9876543210", "password": "PatientPass123"}'
    ```


#### `PUT /patients/:id`
Updates an existing patient record.
-   **Description:** Modifies an existing patient's details.
-   **Authentication:** Required
-   **URL Parameters:** `id` (number) - The ID of the patient to update.
-   **Request Body:** (All fields are optional, only provide what needs to be updated)
    ```json
    {
      "full_name": "string",
      "date_of_birth": "string (YYYY-MM-DD)",
      "gender": "string",
      "contact_info": "string",
      "address": "string",
      "email": "string",
      "phone": "string",
      "password": "string"
    }
    ```
-   **Response Body (Success - 200 OK):**
    ```json
    {
      "message": "Patient updated successfully"
    }
    ```
-   **Example `curl`:**
    ```bash
    curl -X PUT http://localhost:3000/patients/1 \ -H "Content-Type: application/json" \ -H "Authorization: Bearer JWT" \ -d '{"full_name": "Updated Patient Name"}'
    ```


#### `DELETE /patients/:id`
Deletes a patient record.
-   **Description:** Removes a patient record from the database.
-   **Authentication:** Required
-   **URL Parameters:** `id` (number) - The ID of the patient to delete.
-   **Response Body (Success - 200 OK):**
    ```json
    {
      "message": "Patient deleted successfully"
    }
    ```
-   **Example `curl`:**
    ```bash
    curl -X DELETE http://localhost:3000/patients/1 \ -H "Authorization: Bearer JWT"
    ```


### 3. Doctors

#### `GET /doctors`
Retrieves a list of all doctors.
-   **Description:** Returns an array of all doctor records.
-   **Authentication:** Required
-   **Response Body (Success - 200 OK):**
    ```json
    [
      {
        "id": "number",
        "full_name": "string",
        "specialty": "string",
        "license_number": "string",
        "contact_info": "string",
        "created_at": "string (DATETIME)"
      }
    ]
    ```
-   **Example `curl`:**
    ```bash
    curl -X GET http://localhost:3000/doctors \ -H "Authorization: JWT"
    ```

#### `GET /doctors/:id`
Retrieves a single doctor by ID.
-   **Description:** Returns a specific doctor record based on their ID.
-   **Authentication:** Required
-   **URL Parameters:** `id` (number) - The ID of the doctor.
-   **Response Body (Success - 200 OK):**
    ```json
    {
      "id": "number",
      "full_name": "string",
      "specialty": "string",
      "license_number": "string",
      "contact_info": "string",
      "created_at": "string (DATETIME)"
    }
    ```
-   **Example `curl`:**
    ```bash
    curl -X GET http://localhost:3000/doctors/1 \ -H "Authorization: Bearer JWT"
    ```

#### `POST /doctors`
Creates a new doctor record.
-   **Description:** Adds a new doctor to the database.
-   **Authentication:** Required
-   **Request Body:**
    ```json
    {
      "full_name": "string",
      "specialty": "string",
      "license_number": "string (unique)",
      "contact_info": "string (optional)"
    }
    ```
-   **Response Body (Success - 201 Created):**
    ```json
    {
      "id": "number",
      "message": "Doctor created successfully"
    }
    ```
-   **Example `curl`:**
    ```bash
    curl -X POST http://localhost:3000/doctors \ -H "Content-Type: application/json" \ -H "Authorization: Bearer JWT" \ -d '{"full_name": "Dr. New", "specialty": "Cardiology", "license_number": "DR004", "contact_info": "dr.new@example.com"}'
    ```

#### `PUT /doctors/:id`
Updates an existing doctor record.
-   **Description:** Modifies an existing doctor's details.
-   **Authentication:** Required
-   **URL Parameters:** `id` (number) - The ID of the doctor to update.
-   **Request Body:** (All fields are optional, only provide what needs to be updated)
    ```json
    {
      "full_name": "string",
      "specialty": "string",
      "license_number": "string",
      "contact_info": "string"
    }
    ```
-   **Response Body (Success - 200 OK):**
    ```json
    {
      "message": "Doctor updated successfully"
    }
    ```
-   **Example `curl`:**
    ```bash
    curl -X PUT http://localhost:3000/doctors/1 \ -H "Content-Type: application/json" \ -H "Authorization: Bearer JWT" \ -d '{"specialty": "Pediatrics"}'
    ```

#### `DELETE /doctors/:id`
Deletes a doctor record.
-   **Description:** Removes a doctor record from the database.
-   **Authentication:** Required
-   **URL Parameters:** `id` (number) - The ID of the doctor to delete.
-   **Response Body (Success - 200 OK):**
    ```json
    {
      "message": "Doctor deleted successfully"
    }
    ```
-   **Example `curl`:**
    ```bash
    curl -X DELETE http://localhost:3000/doctors/1 \ -H "Authorization: Bearer JWT"
    ```

### 4. Consultations

#### `GET /consultations`
Retrieves a list of all consultations.
-   **Description:** Returns an array of all consultation records, including patient and doctor names.
-   **Authentication:** Required
-   **Response Body (Success - 200 OK):**
    ```json
    [
      {
        "id": "number",
        "patient_id": "number",
        "doctor_id": "number",
        "consultation_date": "string (YYYY-MM-DD)",
        "notes": "string",
        "diagnosis": "string",
        "prescription": "string",
        "created_at": "string (DATETIME)",
        "patient_name": "string",
        "doctor_name": "string"
      }
    ]
    ```
-   **Example `curl`:**
    ```bash
    curl -X GET http://localhost:3000/consultations \ -H "Authorization: Bearer TOKEN"
    ```

#### `GET /consultations/:id`
Retrieves a single consultation by ID.
-   **Description:** Returns a specific consultation record based on its ID.
-   **Authentication:** Required
-   **URL Parameters:** `id` (number) - The ID of the consultation.
-   **Response Body (Success - 200 OK):**
    ```json
    {
      "id": "number",
      "patient_id": "number",
      "doctor_id": "number",
      "consultation_date": "string (YYYY-MM-DD)",
      "notes": "string",
      "diagnosis": "string",
      "prescription": "string",
      "created_at": "string (DATETIME)",
      "patient_name": "string",
      "doctor_name": "string"
    }
    ```
-   **Example `curl`:**
    ```bash
    curl -X GET http://localhost:3000/consultations/1 \ -H "Authorization: Bearer JWT"
    ```

#### `GET /consultations/patient/:patientId`
Retrieves consultations by patient ID.
-   **Description:** Returns an array of consultation records for a specific patient.
-   **Authentication:** Required
-   **URL Parameters:** `patientId` (number) - The ID of the patient.
-   **Response Body (Success - 200 OK):**
    ```json
    [
      {
        "id": "number",
        "patient_id": "number",
        "doctor_id": "number",
        "consultation_date": "string (YYYY-MM-DD)",
        "notes": "string",
        "diagnosis": "string",
        "prescription": "string",
        "created_at": "string (DATETIME)",
        "doctor_name": "string"
      }
    ]
    ```
-   **Example `curl`:**
    ```bash
    curl -X GET http://localhost:3000/consultations/patient/1 \ -H "Authorization: Bearer JWT"
    ```

#### `GET /consultations/doctor/:doctorId`
Retrieves consultations by doctor ID.
-   **Description:** Returns an array of consultation records for a specific doctor.
-   **Authentication:** Required
-   **URL Parameters:** `doctorId` (number) - The ID of the doctor.
-   **Response Body (Success - 200 OK):**
    ```json
    [
      {
        "id": "number",
        "patient_id": "number",
        "doctor_id": "number",
        "consultation_date": "string (YYYY-MM-DD)",
        "notes": "string",
        "diagnosis": "string",
        "prescription": "string",
        "created_at": "string (DATETIME)",
        "patient_name": "string"
      }
    ]
    ```
-   **Example `curl`:**
    ```bash
    curl -X GET http://localhost:3000/consultations/doctor/1 \ -H "Authorization: Bearer JWT"
    ```

#### `POST /consultations`
Creates a new consultation record.
-   **Description:** Adds a new consultation record to the database.
-   **Authentication:** Required
-   **Request Body:**
    ```json
    {
      "patient_id": "number",
      "doctor_id": "number",
      "consultation_date": "string (YYYY-MM-DD)",
      "notes": "string (optional)",
      "diagnosis": "string (optional)",
      "prescription": "string (optional)"
    }
    ```
-   **Response Body (Success - 201 Created):**
    ```json
    {
      "id": "number",
      "message": "Consultation created successfully"
    }
    ```
-   **Example `curl`:**
    ```bash
    curl -X POST http://localhost:3000/consultations \ -H "Content-Type: application/json" \ -H "Authorization: Bearer JWT" \ -d '{"patient_id": 1, "doctor_id": 1, "consultation_date": "2025-01-01" "notes": "Patient complained of headache", "diagnosis": "Migraine", "prescription": "Ibuprofen"}'
    ```

#### `PUT /consultations/:id`
Updates an existing consultation record.
-   **Description:** Modifies an existing consultation's details.
-   **Authentication:** Required
-   **URL Parameters:** `id` (number) - The ID of the consultation to update.
-   **Request Body:** (All fields are optional, only provide what needs to be updated)
    ```json
    {
      "patient_id": "number",
      "doctor_id": "number",
      "consultation_date": "string (YYYY-MM-DD)",
      "notes": "string",
      "diagnosis": "string",
      "prescription": "string"
    }
    ```
-   **Response Body (Success - 200 OK):**
    ```json
    {
      "message": "Consultation updated successfully"
    }
    ```
-   **Example `curl`:**
    ```bash
    curl -X PUT http://localhost:3000/consultations/1 \ -H "Content-Type: application/json" \ -H "Authorization: Bearer JWT" \ -d '{"notes": "Patient is recovering well."}'
    ```

#### `DELETE /consultations/:id`
Deletes a consultation record.
-   **Description:** Removes a specific consultation record from the database by ID.
-   **Authentication:** Required
-   **URL Parameters:** `id` (number) - The ID of the consultation to delete.
-   **Response Body (Success - 200 OK):**
    ```json
    {
      "message": "Consultation deleted successfully"
    }
    ```
-   **Example `curl`:**
    ```bash
    curl -X DELETE http://localhost:3000/consultations/1 \ -H "Authorization: Bearer JWT"
    ```

### 5. Payments

#### `GET /payments`
Retrieves a list of all payments.
-   **Description:** Returns an array of all payment records, including patient name and consultation date.
-   **Authentication:** Required
-   **Response Body (Success - 200 OK):**
    ```json
    [
      {
        "id": "number",
        "patient_id": "number",
        "consultation_id": "number (optional)",
        "payment_date": "string (YYYY-MM-DD)",
        "amount": "number",
        "payment_method": "string",
        "receipt_number": "string",
        "created_at": "string (DATETIME)",
        "patient_name": "string",
        "consultation_date": "string (YYYY-MM-DD)"
      }
    ]
    ```
-   **Example `curl`:**
    ```bash
    curl -X GET http://localhost:3000/payments \ -H "Authorization: Bearer JWT"
    ```

#### `GET /payments/:id`
Retrieves a single payment by ID.
-   **Description:** Returns a specific payment record based on its ID.
-   **Authentication:** Required
-   **URL Parameters:** `id` (number) - The ID of the payment.
-   **Response Body (Success - 200 OK):**
    ```json
    {
      "id": "number",
      "patient_id": "number",
      "consultation_id": "number (optional)",
      "payment_date": "string (YYYY-MM-DD)",
      "amount": "number",
      "payment_method": "string",
      "receipt_number": "string",
      "created_at": "string (DATETIME)",
      "patient_name": "string",
      "consultation_date": "string (YYYY-MM-DD)"
    }
    ```
-   **Example `curl`:**
    ```bash
    curl -X GET http://localhost:3000/payments/1 \ -H "Authorization: Bearer JWT"
    ```

#### `GET /payments/patient/:patientId`
Retrieves payments by patient ID.
-   **Description:** Returns an array of payment records for a specific patient.
-   **Authentication:** Required
-   **URL Parameters:** `patientId` (number) - The ID of the patient.
-   **Response Body (Success - 200 OK):**
    ```json
    [
      {
        "id": "number",
        "patient_id": "number",
        "consultation_id": "number (optional)",
        "payment_date": "string (YYYY-MM-DD)",
        "amount": "number",
        "payment_method": "string",
        "receipt_number": "string",
        "created_at": "string (DATETIME)",
        "consultation_date": "string (YYYY-MM-DD)"
      }
    ]
    ```
-   **Example `curl`:**
    ```bash
    curl -X GET http://localhost:3000/payments/patient/1 \ -H "Authorization: Bearer JWT"
    ```

#### `POST /payments`
Creates a new payment record.
-   **Description:** Adds a new payment record in the database.
-   **Authentication:** Required
-   **Request Body:**
    ```json
    {
      "patient_id": "number",
      "consultation_id": "number (optional)",
      "payment_date": "string (YYYY-MM-DD)",
      "amount": "number",
      "payment_method": "string",
      "receipt_number": "string (optional)"
    }
    ```
-   **Response Body (Success - 201 Created):**
    ```json
    {
      "id": "number",
      "message": "Payment created successfully"
    }
    ```
-   **Example `curl`:**
    ```bash
    curl -X POST http://localhost:3000/payments \ -H "Content-Type: application/json" \ -H "Authorization: Bearer JWT" \ -d '{"patient_id": 1, "consultation_id": 1, "payment_date": "2025-01-01", "amount": 1500.00, "payment_method": "Momo", "receipt_number": "REC001"}'
    ```

#### `PUT /payments/:id`
Updates an existing payment record.
-   **Description:** Modifies an existing payment's details.
-   **Authentication:** Required
-   **URL Parameters:** `id` (number) - The ID of the payment to update.
-   **Request Body:** (All fields are optional, only provide what needs to be updated)
    ```json
    {
      "patient_id": "number",
      "consultation_id": "number",
      "payment_date": "string (YYYY-MM-DD)",
      "amount": "number",
      "payment_method": "string",
      "receipt_number": "string"
    }
    ```
-   **Response Body (Success - 200 OK):**
    ```json
    {
      "message": "Payment updated successfully"
    }
    ```
-   **Example `curl`:**
    ```bash
    curl -X PUT http://localhost:3000/payments/1 \ -H "Content-Type: application/json" \ -H "Authorization: Bearer JWT" \ -d '{"amount": 2000.00}'
    ```

#### `DELETE /payments/:id`
Deletes a payment record.
-   **Description:** Removes a payment record from the database.
-   **Authentication:** Required
-   **URL Parameters:** `id` (number) - The ID of the payment to delete.
-   **Response Body (Success - 200 OK):**
    ```json
    {
      "message": "Payment deleted successfully"
    }
    ```
-   **Example `curl`:**
    ```bash
    curl -X DELETE http://localhost:3000/payments/1 \ -H "Authorization: Bearer JWT"
    ```

### 6. Miscellaneous Endpoints

#### `GET /`
API Status Check.
-   **Description:** Checks if the API is running.
-   **Authentication:** None
-   **Response Body (Success - 200 OK):**
    ```
    API is running
    ```
-   **Example `curl`:
    ```bash
    curl http://localhost:3000/
    ```

#### `POST /ussd`
USSD Endpoint.
-   **Description:** Placeholder for USSD service integration.
-   **Authentication:** Handled internally by USSD code service
-   **Response Body (Success - 200 OK):
    ```
    USSD endpoint
    ```
-   **Example `curl`:
    ```bash
    curl -X POST http://localhost:3000/ussd
    ```

#### `POST /triage`
AI Triage Endpoint.
-   **Description:** Placeholder for AI-adapter handler.
-   **Authentication:** None
-   **Response Body (Success - 200 OK):
    ```
    AI triage endpoint
    ```
-   **Example `curl`:
    ```bash
    curl -X POST http://localhost:3000/triage
    ```

#### `POST /payment/webhook`
Payment Webhook Endpoint.
-   **Description:** Placeholder for receiving payment gateway webhooks.
-   **Authentication:** None
-   **Response Body (Success - 200 OK):
    ```
    Payment webhook endpoint
    ```
-   **Example `curl`:
    ```bash
    curl -X POST http://localhost:3000/payment/webhook
    ```

### 7. Database Management

#### `GET /setup-db`
Sets up the database with required tables and sample data.
-   **Description:** Creates all necessary database tables (users, patients, doctors, consultations, payments) and inserts sample data for testing.
-   **Authentication:** None
-   **Response Body (Success - 200 OK):**
    ```json
    {
      "message": "Database setup completed successfully!",
      "tables_created": ["users", "patients", "doctors", "consultations", "Payments"],
      "sample_data": "Sample records inserted"
    }
    ```
-   **Response Body (Error - 500 Internal Server Error):**
    ```json
    {
      "error": "Database setup failed",
      "details": "string (error message)"
    }
    ```
-   **Example `curl`:**
    ```bash
    curl -X GET http://localhost:3000/setup-db
    ```

#### `GET /debug-tables`
Retrieves database table information for debugging purposes.
-   **Description:** Returns information about existing database tables and the structure of the table for debugging.
-   **Authentication:** None
-   **Response Body (Success - 200 OK):**
    ```json
    {
      "tables": [
        {
          "Tables_in_database_name": "string"
        }
      ],
      "users_table_structure": [
        {
          "Field": "string",
          "Type": "string",
          "Null": "string",
          "Key": "string",
          "Default": "string",
          "Extra": "string"
        }
      ]
    }
    ```
-   **Response Body (Error - 500 Internal Server Error):**
    ```json
    {
      "error": "string (error message)"
    }
    ```
-   **Example `curl`:**
    ```bash
    curl -X GET http://localhost:3000/debug-tables
    ```

NOTE: The endpoints `/auth/register-phone` and `/auth/login-phone` perform the events as the endpoints [`auth/register`](#post-authregister) and [`auth/login`](#post-authlogin) but specified for the USSD Code Service.