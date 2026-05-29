# FinSight - Personal Finance Intelligence System

## Overview

FinSight Backend is a scalable Node.js and Express.js based REST API powering the FinSight Personal Finance Intelligence platform.

The backend provides secure authentication, transaction management, analytics, financial health insights, budget alerts, premium subscription handling, report generation, and real-time notification services.

The system follows a layered architecture using Controllers → Services → Repositories pattern for better scalability, maintainability, and separation of concerns.

---

## Features

### Authentication & Security

* User Registration & Login
* JWT Authentication
* Password Reset via Email
* Protected Routes Middleware
* Rate Limiting for Security
* Centralized Error Handling

### Transaction Management

* Add Income & Expense Transactions
* Update/Delete Transactions
* Transaction History Management

### Analytics & Intelligence

* Financial Summary Dashboard
* Monthly Spending Trends
* Category-wise Expense Breakdown
* Financial Health Score
* Expense Prediction Service

### Premium Features

* Premium Subscription Integration
* Razorpay Payment Gateway
* Premium Feature Gating Middleware

### Alerts & Notifications

* Budget Alerts
* Email Notifications
* Real-time Alerts using Socket.io

### Reports

* Daily Reports
* Monthly Reports
* Yearly Reports
* Downloadable Financial Reports

### Cloud & Background Services

* AWS S3 Profile Image Upload
* Queue-based Background Jobs using BullMQ + Redis
* Scheduled Tasks using Node Cron

---

## Tech Stack

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose

### Authentication & Security

* JWT
* bcrypt
* express-rate-limit

### Cloud & Storage

* AWS S3
* multer
* multer-s3

### Payments

* Razorpay

### Notifications & Communication

* Socket.io
* Nodemailer
* Brevo Email Service

### Background Processing

* BullMQ
* Redis
* Node Cron

### Logging & Monitoring

* Morgan
* Winston

---

## Project Architecture

The backend follows a layered architecture:

Controllers → Services → Repositories → Database

### Folder Structure

```bash
src/
├── app.js
├── index.js
├── config/
├── controllers/
├── middlewares/
├── models/
├── queues/
├── repositories/
├── routes/
├── services/
├── utils/
└── workers/
```

---

## API Base URL

```bash
http://localhost:3000/api
```

---

# API Documentation

## Authentication Routes

| Method | Endpoint              | Description               |
| ------ | --------------------- | ------------------------- |
| POST   | /auth/register        | Register new user         |
| POST   | /auth/login           | User login                |
| POST   | /auth/forgot-password | Send password reset email |
| POST   | /auth/reset-password  | Reset password            |

---

## Transaction Routes

| Method | Endpoint          | Description          |
| ------ | ----------------- | -------------------- |
| POST   | /transactions     | Add transaction      |
| GET    | /transactions     | Get all transactions |
| PUT    | /transactions/:id | Update transaction   |
| DELETE | /transactions/:id | Delete transaction   |

---

## Analytics Routes (Premium)

| Method | Endpoint                   | Description         |
| ------ | -------------------------- | ------------------- |
| GET    | /analytics/summary         | Financial summary   |
| GET    | /analytics/categories      | Category breakdown  |
| GET    | /analytics/category-filter | Filter by category  |
| GET    | /analytics/trends          | Monthly trends      |
| GET    | /analytics/dashboard       | Dashboard analytics |

---

## Prediction Routes (Premium)

| Method | Endpoint     | Description         |
| ------ | ------------ | ------------------- |
| GET    | /predictions | Expense predictions |

---

## Financial Health Routes (Premium)

| Method | Endpoint | Description            |
| ------ | -------- | ---------------------- |
| GET    | /health  | Financial health score |

---

## Alert Routes (Premium)

| Method | Endpoint         | Description        |
| ------ | ---------------- | ------------------ |
| GET    | /alerts          | Get alerts         |
| PUT    | /alerts/:id/read | Mark alert as read |

---

## Payment Routes

| Method | Endpoint               | Description           |
| ------ | ---------------------- | --------------------- |
| POST   | /payments/create-order | Create Razorpay order |
| POST   | /payments/verify       | Verify payment        |
| POST   | /payments/webhook      | Razorpay webhook      |

---

## Report Routes (Premium)

| Method | Endpoint          | Description      |
| ------ | ----------------- | ---------------- |
| GET    | /reports          | Generate reports |
| GET    | /reports/download | Download reports |
| GET    | /reports/history  | Download history |

---

## User Routes

| Method | Endpoint       | Description      |
| ------ | -------------- | ---------------- |
| GET    | /user/profile  | Get user profile |
| PUT    | /user/profile  | Update profile   |
| PUT    | /user/password | Change password  |

---

# Environment Variables

Create a `.env` file in the root directory.

```env
PORT=
MONGO_URI=
JWT_SECRET=

CLIENT_URL=

BREVO_API_KEY=

SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_EMAIL=
SMTP_PASS=

AWS_REGION=
AWS_ACCESS_KEY=
AWS_SECRET_KEY=
AWS_BUCKET_NAME=

RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
```

---

# Installation & Setup

## Clone Repository

```bash
git clone https://github.com/Manu22-cloud-cell/FinSight-backend.git
```

## Install Dependencies

```bash
npm install
```

## Run Development Server

```bash
npm run dev
```

---

# Security Features

* JWT Authentication
* Password Hashing using bcrypt
* Route Protection Middleware
* Rate Limiting
* Centralized Error Handling
* Payment Signature Verification

---

# Future Improvements

* Swagger API Documentation
* AI-based Financial Recommendations
* Multi-currency Support
* Export Reports as PDF
* Docker Deployment
* CI/CD Pipeline

---

# Author

Developed by Manoj K Y
