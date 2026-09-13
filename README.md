# 📚 Library Sathi — SaaS Library Management System

A full-stack, multi-tenant SaaS Library Management System built to help libraries manage students, books, seats, shifts, lockers, subscriptions, payments, invoices, and administrative operations from a centralized platform.

The system provides separate portals for **Students, Library Admins, and Super Admins**.

## 🚀 Live Demo

**Frontend:**  
https://saas-library-managment-system.vercel.app

**Backend API:**  
http://ec2-13-232-105-239.ap-south-1.compute.amazonaws.com

**Health Check:**  
http://ec2-13-232-105-239.ap-south-1.compute.amazonaws.com/api/health

---

## ✨ Features

### 👨‍🎓 Student Portal
- Student authentication
- Student dashboard
- Profile management
- Seat assignment
- Shift information
- Locker information
- Subscription details
- Payment history
- Invoice information

### 👨‍💼 Library Admin Portal
- Admin authentication
- Dashboard and analytics
- Student management
- Book management
- Book issue and return
- Seat management
- Shift management
- Locker management
- Subscription management
- Student payments
- Invoice management
- Library operations management

### 👑 Super Admin Portal
- Super Admin authentication
- Platform dashboard
- Lead management
- Tenant/library management
- Plan management
- Feature management
- Subscription management

---

## 🏢 Multi-Tenant SaaS Architecture

The application is designed as a multi-tenant SaaS platform where individual libraries operate as separate tenants.

```text
                    SaaS Platform
                         |
          +--------------+--------------+
          |              |              |
      Library A      Library B      Library C
          |              |              |
       Students        Students        Students
       Books           Books           Books
       Seats           Seats           Seats
       Shifts          Shifts          Shifts
       Lockers         Lockers         Lockers

Tenant-specific resources are associated with their respective library administrator.

🏗️ System Architecture
                    Users
                      |
                      v
             +------------------+
             |     Vercel       |
             | React + Vite     |
             |    Frontend      |
             +--------+---------+
                      |
                   /api proxy
                      |
                      v
             +------------------+
             |      Nginx       |
             | Reverse Proxy    |
             +--------+---------+
                      |
                      v
             +------------------+
             |     AWS EC2      |
             | Node.js/Express  |
             |     Backend      |
             +--------+---------+
                      |
             +--------+--------+
             |                 |
             v                 v
      +-------------+    +-------------+
      | MongoDB     |    |    Redis    |
      |   Atlas     |    |    Cache    |
      +-------------+    +-------------+
🛠️ Tech Stack
Frontend
React
Vite
JavaScript
React Router
Fetch API
CSS
Google OAuth
Razorpay
Backend
Node.js
Express.js
MongoDB
Mongoose
Redis
JWT
bcryptjs
Express Validator
Multer
Nodemailer
Razorpay
Infrastructure & Deployment
AWS EC2
Docker
Docker Compose
Nginx
MongoDB Atlas
Redis
Vercel
📁 Project Structure
library-sathi/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   ├── student/
│   │   │   └── super-admin/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .gitignore
│   ├── package.json
│   ├── vercel.json
│   └── vite.config.js
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   └── server.js
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── package.json
│   └── .env
│
└── README.md
🔐 Authentication & Authorization

The application supports role-based authentication for:

Student
Library Admin
Super Admin

Authentication technologies include:

JWT authentication
bcrypt password hashing
Google OAuth
Role-based authorization
Redis session/cache support
                 Authentication
                       |
        +--------------+--------------+
        |              |              |
     Student         Admin       Super Admin
        |              |              |
      JWT            JWT            JWT
🗄️ Database

MongoDB Atlas is used as the production database with Mongoose as the ODM.

Main collections include:

superadmins
admins
students
books
bookissues
seats
shifts
lockers
plans
features
subscriptions
studentpayments
studentinvoices
demorequests
⚡ Redis

Redis is used for session and cache-related functionality.

The production deployment runs Redis using Docker:

Redis 7 Alpine

Redis data is persisted using a Docker volume.

🐳 Docker

The backend and Redis services are containerized using Docker Compose.

Start services
docker compose up -d --build
Check services
docker compose ps
Backend logs
docker compose logs backend --tail=50
Redis logs
docker compose logs redis --tail=50
Stop services
docker compose down
☁️ Deployment
Frontend

The frontend is deployed on Vercel using React + Vite.

API requests are routed through the Vercel /api proxy to the AWS EC2 backend.

Frontend API configuration:

VITE_API_BASE_URL=/api
Backend

The backend runs on an AWS EC2 Ubuntu server using Docker.

Architecture:

Internet
   |
   v
Nginx :80
   |
   v
Node.js / Express
   |
   v
Docker Container :5000

The backend port is bound to localhost rather than being directly exposed publicly.

Database

Production data is hosted on MongoDB Atlas.

Redis

Redis runs as a Docker container on the EC2 instance.

🔑 Environment Variables
Frontend

Create a .env file inside frontend/:

VITE_API_BASE_URL=/api
VITE_APP_NAME=Library Sathi
VITE_GOOGLE_CLIENT_ID=
VITE_RAZORPAY_KEY_ID=
Backend

Create a .env file inside backend/:

MONGO_URI=

NODE_ENV=production
PORT=5000

REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

JWT_SECRET=
JWT_EXPIRES_IN=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=

SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=

FROM_EMAIL=
FROM_NAME=

UPLOAD_DIR=uploads
MAX_FILE_SIZE=

Never commit real credentials or secrets to GitHub.

🧪 Local Development
Frontend
cd frontend
npm install
npm run dev
Backend
cd backend
npm install
npm run dev

Backend normally runs on:

http://localhost:5000

Health endpoint:

http://localhost:5000/api/health
🔍 API Health Check

The backend provides a health-check endpoint:

GET /api/health

Example response:

{
  "success": true
}

This can be used to verify that the backend is running correctly.

💳 Payment Integration

The application integrates Razorpay for payment-related functionality.

Features include:

Student payments
Subscription payments
Payment status tracking
Invoice management
Transaction tracking

Payment credentials are stored using environment variables.

🔒 Security

The application implements several security mechanisms:

JWT authentication
bcrypt password hashing
Role-based authorization
Express request validation
CORS configuration
Nginx reverse proxy
Environment-based secrets
Dockerized backend
MongoDB Atlas network restrictions
Redis-backed session/cache functionality
Never commit
.env
.env.local
*.pem
API keys
JWT secrets
MongoDB credentials
OAuth client secrets
Razorpay secrets
SMTP passwords
📌 Deployment Stack
Component	Technology
Frontend	React + Vite
Frontend Hosting	Vercel
Backend	Node.js + Express
Backend Hosting	AWS EC2
Reverse Proxy	Nginx
Database	MongoDB Atlas
Cache	Redis
Containers	Docker
Payments	Razorpay
Authentication	JWT + Google OAuth
🚧 Future Improvements
Custom domain
HTTPS for backend
Cloudflare integration
CI/CD pipeline
Automated database backups
Centralized logging
Monitoring and alerting
Improved tenant isolation
Automated testing
Swagger/OpenAPI documentation
Rate limiting
Advanced audit logging
🤝 Contributing

Contributions are welcome.

Clone the repository
git clone https://github.com/benkatesh2003/saas--library-Managment-System.git
cd saas--library-Managment-System
Create a feature branch
git checkout -b feature/new-feature
Commit changes
git add .
git commit -m "Add new feature"
Push changes
git push origin feature/new-feature

Then create a Pull Request.

👨‍💻 Author

Benkatesh Narayan

GitHub:
https://github.com/benkatesh2003

📄 License

This project is currently intended for educational, development, and demonstration purposes.
