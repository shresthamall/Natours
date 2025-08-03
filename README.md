# Natours - Adventure Tours Booking Platform

A full-stack web application for booking adventure tours, built with Node.js, Express, MongoDB, and modern web technologies.

## 🌟 Live Demo

**Live Application:** https://natours-rv3k.onrender.com/

## 📋 Table of Contents

- [Features](#-features)
- [Technologies Used](#-technologies-used)
- [Project Structure](#-project-structure)
- [Installation](#-installation)
- [Environment Variables](#-environment-variables)
- [API Documentation](#-api-documentation)
- [Security Features](#-security-features)
- [Payment Integration](#-payment-integration)
- [Email System](#-email-system)
- [Scripts](#-scripts)

## ✨ Features

### 🏔️ Tour Management
- **Comprehensive Tour Data**: Each tour includes name, duration, group size, difficulty level, pricing, and detailed descriptions
- **Geospatial Features**: Tours include start locations and multiple waypoints with coordinates
- **Rich Media**: Multiple images per tour with cover images
- **Advanced Filtering**: Filter tours by price, difficulty, duration, and ratings
- **Search & Pagination**: Full-text search with paginated results
- **Rating System**: User reviews and ratings with average calculations

### 👤 User Authentication & Authorization
- **JWT Authentication**: Secure token-based authentication
- **Role-based Access**: User, guide, lead-guide, and admin roles
- **Password Security**: Bcrypt hashing with salt rounds
- **Password Reset**: Email-based password reset functionality
- **Account Management**: User profile updates and account settings

### 💳 Payment Integration
- **Stripe Integration**: Secure payment processing
- **Checkout Sessions**: Seamless booking experience
- **Webhook Handling**: Real-time payment confirmation
- **Booking Management**: Complete booking lifecycle

### 📧 Email System
- **Welcome Emails**: Automated welcome messages for new users
- **Password Reset**: Secure password reset via email
- **Template System**: Pug-based email templates
- **Multiple Providers**: Support for SendGrid and Nodemailer

### 🛡️ Security Features
- **Rate Limiting**: API request throttling
- **Data Sanitization**: MongoDB injection protection
- **XSS Protection**: Cross-site scripting prevention
- **HTTP Security Headers**: Helmet.js implementation
- **CORS Configuration**: Cross-origin resource sharing
- **Input Validation**: Comprehensive data validation

### 🎨 Frontend Features
- **Responsive Design**: Mobile-first approach
- **Interactive Maps**: Leaflet.js integration
- **Real-time Updates**: Dynamic content without page refresh
- **Modern UI**: Clean and intuitive user interface
- **Pug Templates**: Server-side rendering

## 🛠️ Technologies Used

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **Bcrypt** - Password hashing
- **Stripe** - Payment processing
- **Nodemailer** - Email functionality
- **Multer** - File upload handling
- **Sharp** - Image processing

### Frontend
- **Pug** - Template engine
- **CSS3** - Styling
- **JavaScript (ES6+)** - Client-side functionality
- **Leaflet.js** - Interactive maps
- **Axios** - HTTP client
- **Parcel** - Bundler

### Security & Performance
- **Helmet** - Security headers
- **Rate Limiting** - API protection
- **Compression** - Response compression
- **CORS** - Cross-origin handling
- **Morgan** - HTTP request logging

## 📁 Project Structure

```
natours/
├── controllers/          # Route handlers
├── models/              # Database schemas
├── routes/              # API routes
├── views/               # Pug templates
├── public/              # Static assets
│   ├── css/            # Stylesheets
│   ├── js/             # Client-side JavaScript
│   └── img/            # Images
├── utils/               # Utility functions
├── dev-data/            # Development data
└── server.js            # Entry point
```

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd natours
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `config.env` file in the root directory (see Environment Variables section)

4. **Import development data**
   ```bash
   npm run start:dev
   ```

5. **Start the development server**
   ```bash
   npm run start:dev
   ```

## 🔧 Environment Variables

Create a `config.env` file with the following variables:

```env
NODE_ENV=development
PORT=3000
DATABASE=mongodb://localhost:27017/natours
PASSWORD=your_database_password
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=90d
COOKIE_EXPIRES_IN=90

# Email Configuration
EMAIL_HOST=smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_USERNAME=your_email_username
EMAIL_PASSWORD=your_email_password
EMAIL_FROM=noreply@natours.com

# Stripe Configuration
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEEBOOK_SECRET=your_stripe_webhook_secret

# SendGrid (for production)
SENDGRID_USERNAME=your_sendgrid_username
SENDGRID_PASSWORD=your_sendgrid_password
```

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/v1/users/signup` - User registration
- `POST /api/v1/users/login` - User login
- `POST /api/v1/users/logout` - User logout
- `POST /api/v1/users/forgotPassword` - Request password reset
- `PATCH /api/v1/users/resetPassword/:token` - Reset password

### Tour Endpoints
- `GET /api/v1/tours` - Get all tours (with filtering)
- `GET /api/v1/tours/:id` - Get specific tour
- `POST /api/v1/tours` - Create tour (admin only)
- `PATCH /api/v1/tours/:id` - Update tour (admin only)
- `DELETE /api/v1/tours/:id` - Delete tour (admin only)

### Review Endpoints
- `GET /api/v1/tours/:tourId/reviews` - Get tour reviews
- `POST /api/v1/tours/:tourId/reviews` - Create review
- `PATCH /api/v1/reviews/:id` - Update review
- `DELETE /api/v1/reviews/:id` - Delete review

### Booking Endpoints
- `GET /api/v1/bookings` - Get user bookings
- `POST /api/v1/bookings/checkout-session/:tourId` - Create checkout session
- `POST /webHook-Checkout` - Stripe webhook handler

## 🔒 Security Features

### Authentication & Authorization
- JWT-based authentication with secure token storage
- Role-based access control (User, Guide, Lead Guide, Admin)
- Password hashing with bcrypt
- Secure cookie configuration

### API Protection
- Rate limiting (100 requests per hour per IP)
- Request size limiting (10kb)
- CORS configuration
- Helmet.js security headers
- MongoDB injection protection
- XSS protection

### Data Validation
- Input sanitization
- Schema validation with Mongoose
- Custom validation functions
- Error handling middleware

## 💳 Payment Integration

### Stripe Implementation
- Secure checkout sessions
- Webhook handling for payment confirmation
- Client-side Stripe integration
- Server-side payment processing

### Booking Flow
1. User selects a tour
2. Creates Stripe checkout session
3. Redirects to Stripe payment page
4. Webhook confirms payment
5. Booking is created in database

## 📧 Email System

### Email Templates
- Welcome emails for new users
- Password reset emails
- Pug-based HTML templates
- Text fallback support

### Email Providers
- **Development**: Nodemailer with Mailtrap
- **Production**: SendGrid integration

## 📜 Scripts

```json
{
  "start": "NODE_ENV=production npx nodemon server.js",
  "start:dev": "npx nodemon server.js",
  "debug": "ndb server.js",
  "build": "npx parcel build public/js/index.js --dist-dir public/dist/ --no-cache",
  "watch:js": "npx parcel watch public/.dist/_index.js",
  "build:js": "npx parcel watch public/js/index.js --out-dir public/js/ --out-file bundle.js --public-url ./"
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 👨‍💻 Author

**Shrestha Mall** - Full Stack Developer

## 📚 Course Information

This project was created as part of the **Complete Node.js Bootcamp** course on Udemy.

**Course Instructor:** Jonas Schmedtmann  
**Course:** [Node.js, Express, MongoDB & More: The Complete Bootcamp 2024](https://www.udemy.com/course/nodejs-express-mongodb-bootcamp/)

---

**Note**: This is a course project demonstrating modern Node.js development practices, security implementations, and full-stack web application architecture. The original course content and project structure are created by Jonas Schmedtmann.
