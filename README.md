# Student Service and Complaint Management System (SSCMS)

A comprehensive full-stack application for managing student complaints, service requests, and institutional operations. The system provides role-based access control, real-time notifications, activity tracking, and advanced analytics for educational institutions.

## 🎯 Overview

SSCMS is designed to streamline the management of student-related services and complaints in educational institutions. It provides:

- **Complaint Management**: Track and resolve various types of complaints (harassment, safety concerns, facility issues)
- **Service Requests**: Manage dormitory maintenance, cafeteria services, and other institutional services
- **Multi-role System**: Support for students, staff, managers, investigators, and administrators
- **Analytics & Reporting**: Dashboard with charts, statistics, and comprehensive reports
- **AI Advisory**: Machine learning-powered recommendations for complaint resolution
- **Activity Tracking**: Full audit trail of system activities
- **Real-time Notifications**: Instant updates for stakeholders

## 📋 Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Features](#features)
- [Getting Started](#getting-started)
- [Environment Setup](#environment-setup)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Database](#database)
- [Testing](#testing)
- [Development Workflow](#development-workflow)
- [Deployment](#deployment)

## 🛠️ Tech Stack

### Frontend

- **React** 18+ - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **shadcn/ui & Radix UI** - Component library
- **React Query (@tanstack/react-query)** - Server state management
- **React Hook Form** - Form management
- **Axios** - HTTP client
- **Vitest** - Testing framework

### Backend

- **Node.js** with **Express.js** - API server
- **Prisma** - ORM for database management
- **PostgreSQL** - Primary database
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Nodemailer** - Email delivery
- **Resend** - Email service
- **Multer** - File upload handling
- **Cloudinary** - Image hosting
- **Swagger** - API documentation
- **Vitest & Supertest** - Testing

### AI & Analytics

- **Python** - AI service
- **Machine Learning Models** - Complaint analysis and recommendations

## 📁 Project Structure

```
sscms/
├── client2/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   ├── pages/           # Page components (organized by role)
│   │   ├── contexts/        # React context for state
│   │   ├── hooks/           # Custom React hooks
│   │   ├── services/        # API client services
│   │   ├── lib/             # Utilities and helpers
│   │   └── assets/          # Images, fonts, etc.
│   ├── vite.config.js       # Vite configuration
│   └── package.json
│
├── server/                  # Express backend application
│   ├── src/
│   │   ├── app.js           # Express app setup
│   │   ├── routes/          # API route handlers
│   │   ├── modules/         # Feature modules
│   │   ├── middlewares/     # Express middlewares
│   │   ├── services/        # Business logic
│   │   ├── config/          # Configuration files
│   │   └── lib/             # Utilities
│   ├── prisma/
│   │   ├── schema.prisma    # Database schema
│   │   ├── migrations/      # Database migrations
│   │   └── seed.js          # Seed data script
│   ├── tests/               # Test files
│   ├── index.js             # Server entry point
│   └── package.json
│
├── ai-service/              # Python AI service
│   ├── main.py              # AI service entry point
│   ├── train.py             # Model training script
│   ├── requirements.txt      # Python dependencies
│   └── dataset.csv          # Training data
│
├── docs/                    # Documentation
│   ├── COMPONENT_LIBRARY.md
│   ├── frontend-api-reference.md
│   └── UI_UPGRADE_GUIDE.md
│
└── package.json             # Root workspace configuration
```

## ✨ Key Features

### User Management

- Multi-role authentication (Student, Staff, Manager, Investigator, Admin)
- JWT-based session management
- Password reset functionality
- Activity logging

### Complaint Management

- Multiple complaint categories (harassment, safety, discrimination, etc.)
- Status tracking (Open, In Progress, Resolved, Closed)
- Assignment to investigators
- Comments and resolution tracking
- Reopening capability with reason documentation

### Service Request Management

- Service types: Dormitory, Cafeteria, Library, IT Support
- Status workflow (Pending, In Progress, Completed, Canceled)
- Priority levels
- Assignment to service managers and staff
- File attachments support

### Analytics & Dashboard

- Real-time statistics on complaints and service requests
- Distribution charts by type and status
- Trend analysis
- Department-wise performance metrics
- Export reports functionality

### Communication

- Email notifications for status updates
- Real-time in-app notifications
- Activity feed
- Audit trails

### Admin Features

- User management and role assignment
- Bulk student import
- System reports
- Data analytics
- Configuration management

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ (for backend and frontend)
- Python 3.8+ (for AI service)
- PostgreSQL 12+ (for database)
- npm or yarn (package manager)
- Git

### Quick Start

1. **Clone the repository**

```bash
git clone <repository-url>
cd sscms
```

2. **Install dependencies**

```bash
# Install root dependencies (if any)
npm install

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client2
npm install
```

3. **Set up environment variables** (see [Environment Setup](#environment-setup) below)

4. **Initialize the database**

```bash
cd server
npm run prisma:migrate
npm run prisma:seed
```

5. **Start the application**

```bash
# Terminal 1: Backend
cd server
npm run dev

# Terminal 2: Frontend
cd client2
npm run dev

# Terminal 3: AI Service (optional)
cd ai-service
python main.py
```

The application will be available at:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3000`
- API Documentation: `http://localhost:3000/api-docs`

## 🔧 Environment Setup

### Backend (.env in `server/` directory)

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/sscms"

# JWT Secrets
JWT_SECRET="your-jwt-secret-key"
REFRESH_TOKEN_SECRET="your-refresh-token-secret"

# Email Configuration
RESEND_API_KEY="your-resend-api-key"
MAIL_FROM="noreply@yourdomain.com"

# Cloudinary (for image uploads)
CLOUDINARY_NAME="your-cloudinary-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Node Environment
NODE_ENV="development"
PORT=3000

# CORS Origins
CORS_ORIGINS="http://localhost:5173,http://localhost:3000"
```

### Frontend (.env in `client2/` directory)

```env
VITE_API_URL="http://localhost:3000/api"
```

### AI Service (.env in `ai-service/` directory)

```env
FLASK_ENV="development"
FLASK_PORT=5000
```

## ▶️ Running the Application

### Development Mode

**Backend:**

```bash
cd server
npm run dev
```

Runs with hot-reload using nodemon.

**Frontend:**

```bash
cd client2
npm run dev
```

Runs Vite dev server with hot module replacement.

**AI Service:**

```bash
cd ai-service
python main.py
```

### Production Build

**Frontend:**

```bash
cd client2
npm run build
npm run preview
```

**Backend:**

```bash
cd server
npm run start
```

## 📚 API Documentation

The API documentation is automatically generated with Swagger/OpenAPI and available at:

```
http://localhost:3000/api-docs
```

### Main API Endpoints

#### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout

#### Users

- `GET /api/users` - Get users list
- `GET /api/users/:id` - Get user details
- `PATCH /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

#### Complaints

- `GET /api/complaints` - List complaints
- `POST /api/complaints` - Create complaint
- `GET /api/complaints/:id` - Get complaint details
- `PATCH /api/complaints/:id` - Update complaint
- `POST /api/complaints/:id/comments` - Add comment
- `POST /api/complaints/:id/reopen` - Reopen complaint

#### Service Requests

- `GET /api/service-requests` - List service requests
- `POST /api/service-requests` - Create service request
- `GET /api/service-requests/:id` - Get details
- `PATCH /api/service-requests/:id` - Update service request
- `DELETE /api/service-requests/:id` - Delete service request

#### Reports & Analytics

- `GET /api/reports/dashboard` - Dashboard statistics
- `GET /api/reports/complaints` - Complaint reports
- `GET /api/reports/services` - Service request reports
- `GET /api/activity-logs` - Activity audit trail

## 🗄️ Database

### Schema Overview

**Key Models:**

- `User` - System users with roles
- `Complaint` - Student complaints
- `ServiceRequest` - Service requests
- `ServiceManager` - Manages specific service types
- `ComplaintManager` - Manages complaint investigations
- `ActivityLog` - Audit trail
- `Notification` - User notifications
- `MisuseReport` - Reports for misuse
- `MaterialRequest` - Material requests

### Database Migrations

```bash
# Create new migration
npm run prisma:migrate -- --name migration_name

# View database in Prisma Studio
npm run prisma:studio

# Reset database (caution: deletes all data)
npm run prisma:reset
```

## ✅ Testing

### Backend Tests

```bash
cd server

# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests
npm run test:integration

# Watch mode
npm test -- --watch
```

### Frontend Tests

```bash
cd client2

# Run tests
npm test

# Watch mode
npm run test:watch
```

## 🔄 Development Workflow

1. **Create a feature branch**

```bash
git checkout -b feature/your-feature-name
```

2. **Make changes and test**

```bash
# Run linter
npm run lint

# Run tests
npm test
```

3. **Commit changes**

```bash
git add .
git commit -m "description of changes"
```

4. **Push and create pull request**

```bash
git push origin feature/your-feature-name
```

## 🌐 Deployment

### Frontend Deployment (Vercel)

The frontend is configured for Vercel deployment:

```bash
cd client2
npm run build
# Deploy to Vercel
```

### Backend Deployment

Ensure environment variables are set in your hosting platform:

```bash
# Build and deploy
npm run prisma:migrate -- --deploy
npm run start
```

### Database

- Host PostgreSQL database (e.g., AWS RDS, Railway, etc.)
- Update `DATABASE_URL` in environment variables
- Run migrations: `npm run prisma:deploy`

## 📦 Key Dependencies

See [client2/package.json](client2/package.json) and [server/package.json](server/package.json) for complete dependency lists.

## 📝 License

ISC

## 👥 Support

For issues, questions, or contributions, please refer to the project documentation in the `docs/` directory or contact the development team.

## 🔐 Security

- JWT authentication with secure token handling
- Password hashing with bcrypt
- Rate limiting on API endpoints
- CORS configuration
- Input validation and sanitization
- SQL injection prevention (via Prisma ORM)
- XSS protection

## 📖 Additional Documentation

- [Component Library Guide](docs/COMPONENT_LIBRARY.md)
- [Frontend API Reference](docs/frontend-api-reference.md)
- [Manager Dashboard Enhancements](docs/MANAGER_DASHBOARD_ENHANCEMENTS.md)
- [UI Upgrade Guide](docs/UI_UPGRADE_GUIDE.md)
- [Email Credential Delivery Implementation](EMAIL_CREDENTIAL_DELIVERY_IMPLEMENTATION.md)
