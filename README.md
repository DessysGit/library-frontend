# 📚 Des2 Library Management System

A modern, full-stack library management application with AI-powered recommendations and real-time analytics dashboard.

![Node.js](https://img.shields.io/badge/Node.js-v18+-green)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-13+-blue)
![License](https://img.shields.io/badge/license-ISC-orange)

---

## 🌟 Features

### For Users
- 📖 **Browse & Search Books** - Advanced search by title, author, and genre
- ⭐ **Review & Rate** - Share your thoughts and rate books 1-5 stars
- 🤖 **AI Recommendations** - Get personalized book suggestions powered by HuggingFace
- 💬 **Chatbot Assistant** - Interactive helper for finding books and getting recommendations
- 📥 **Download Books** - Access PDF versions of books (stored in Cloudinary)
- 📧 **Email Verification** - Secure account with email verification system
- 🔐 **Password Reset** - Easy password recovery via email

### For Admins
- 📊 **Analytics Dashboard** - Real-time statistics and insights
  - Total users, books, reviews, and downloads
  - Genre distribution charts
  - User growth trends (30-day view)
  - Popular books ranking
  - Recent activity feed
  - Top reviewers leaderboard
  - Books needing reviews
- 📚 **Book Management** - Full CRUD operations for books
- 👥 **User Management** - View and manage user accounts
- ☁️ **Cloud Storage** - Automatic file upload to Cloudinary

---

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js (Express.js)
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Passport.js, bcrypt
- **Session Management**: express-session, connect-pg-simple
- **File Upload**: Multer, Cloudinary
- **Email**: Resend / Gmail SMTP / SendGrid

### Frontend
- **UI**: Vanilla JavaScript, HTML5, CSS3
- **Styling**: Bootstrap 4, Font Awesome
- **Charts**: Chart.js
- **Design**: Responsive, mobile-first

### AI/ML
- **Recommendations**: HuggingFace API
- **Chatbot**: Custom rule-based system
- **Python Integration**: Python script for advanced recommendations

### Cloud Services
- **File Storage**: Cloudinary (production)
- **Database Hosting**: Supabase
- **Backend Hosting**: Render
- **Frontend Hosting**: Netlify

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18 or higher
- PostgreSQL database (Supabase recommended)
- Cloudinary account (for file uploads)
- Email service account (Resend/Gmail/SendGrid)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/Library_Project.git
cd Library_Project
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# Server
NODE_ENV=development
PORT=3000
SESSION_SECRET=your_secret_key_here

# URLs
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:3000

# Admin Account
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password
ADMIN_EMAIL=admin@yourlibrary.com

# Cloudinary (for file uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email Service (choose one)
# Option 1: Resend (recommended - 3,000 emails/month free)
RESEND_API_KEY=re_your_api_key
EMAIL_FROM=noreply@yourdomain.com

# Option 2: Gmail SMTP
# GMAIL_USER=your.email@gmail.com
# GMAIL_APP_PASSWORD=your_16_char_app_password
# EMAIL_FROM=your.email@gmail.com

# Option 3: SendGrid
# SENDGRID_API_KEY=SG.your_api_key
# SENDGRID_FROM_EMAIL=noreply@yourdomain.com

# AI (optional)
HUGGINGFACE_API_KEY=hf_your_api_key
```

4. **Add timestamps to database tables** (optional but recommended)
```bash
npm run add-timestamps
```

5. **Start the development server**
```bash
npm run dev
```

6. **Access the application**
- Frontend: http://localhost:3000
- Admin Dashboard: http://localhost:3000/admin-dashboard.html

---

## 📋 Available Scripts

### Development
- `npm run dev` - Start server with nodemon (auto-restart)
- `npm start` - Start production server

### Database
- `npm run test:connection` - Test database connection
- `npm run diagnose` - Run connection diagnostics
- `npm run add-timestamps` - Add created_at columns to tables

### Testing
- `npm run test-deployment` - Test all endpoints
- `npm run test-dashboard` - Test analytics endpoints
- `npm run test-email` - Test email service

### Deployment
- `npm run verify-production` - Check production environment config
- `npm run fix-cloudinary` - Fix malformed Cloudinary URLs

---

## 📁 Project Structure

```
Library_Project/
├── src/
│   ├── config/
│   │   ├── database.js          # PostgreSQL connection
│   │   ├── cloudinary.js        # Cloudinary setup
│   │   ├── environment.js       # Environment config
│   │   └── passport.js          # Authentication strategy
│   ├── middleware/
│   │   ├── auth.js              # Authentication middleware
│   │   └── rateLimiter.js       # Rate limiting
│   ├── routes/
│   │   ├── auth.js              # Login, register, password reset
│   │   ├── books.js             # Book CRUD operations
│   │   ├── reviews.js           # Review system
│   │   ├── users.js             # User management
│   │   ├── analytics.js         # Admin analytics API
│   │   ├── recommendations.js   # AI recommendations
│   │   ├── chatbot.js           # Chatbot responses
│   │   ├── download.js          # File downloads
│   │   └── newsletter.js        # Email subscriptions
│   ├── services/
│   │   ├── emailService.js      # Email sending
│   │   └── databaseService.js   # Database utilities
│   └── app.js                   # Express app configuration
├── public/
│   ├── index.html               # Main application
│   ├── admin-dashboard.html     # Analytics dashboard
│   ├── book-details.html        # Book details page
│   ├── reset-password.html      # Password reset page
│   ├── script.js                # Main frontend logic
│   ├── admin-dashboard.js       # Dashboard logic
│   ├── style.css                # Global styles
│   └── chatbot/                 # Chatbot interface
├── uploads/                     # Local file storage (dev only)
├── server.js                    # Application entry point
├── recommend.py                 # Python recommendation script
├── package.json
└── README.md
```

---

## 🎯 Key Features Explained

### 1. Admin Analytics Dashboard
Real-time insights with interactive visualizations:
- **Statistics Cards**: Total users, books, reviews, downloads
- **Charts**: Genre distribution (doughnut), user growth (line)
- **Data Tables**: Popular books, recent activity, top reviewers
- **Auto-refresh**: Updates every 5 minutes

### 2. AI-Powered Recommendations
Multiple recommendation strategies:
- **Content-based filtering**: Based on genres and authors
- **Collaborative filtering**: Based on user behavior
- **HuggingFace integration**: Advanced ML recommendations
- **Python fallback**: Local recommendation script

### 3. Email System
Flexible email service with multiple options:
- **Verification emails**: Secure account activation
- **Password reset**: Token-based recovery
- **Templates**: Beautiful HTML email templates
- **Multi-provider**: Resend, Gmail, SendGrid support

### 4. Security Features
- **Password hashing**: bcrypt with salt rounds
- **Session management**: PostgreSQL-backed sessions
- **Email verification**: Required for account activation
- **Rate limiting**: Prevent brute force attacks
- **CSRF protection**: SameSite cookie policy
- **Role-based access**: Admin vs. User permissions

---

## 🔧 Configuration

### Database Setup (Supabase)

1. Create a Supabase project
2. Use **Session Mode** connection (port 5432)
3. Copy the connection string
4. Add to `.env` as `DATABASE_URL`

Tables are created automatically on first run.

### Cloudinary Setup

1. Create account at https://cloudinary.com
2. Get your Cloud Name, API Key, and API Secret
3. Add credentials to `.env`
4. Files are uploaded automatically when adding books

### Email Service Setup

**Option 1: Resend (Recommended)**
1. Sign up at https://resend.com
2. Create API key
3. Add `RESEND_API_KEY` to `.env`
4. Use `onboarding@resend.dev` for testing

**Option 2: Gmail**
1. Enable 2-Step Verification on Google account
2. Generate App Password
3. Add credentials to `.env`

**Option 3: SendGrid**
1. Sign up at https://sendgrid.com
2. Create API key
3. Add to `.env`

---

## 👥 Default Admin Account

**Username**: `admin`  
**Password**: Set in `.env` file (`ADMIN_PASSWORD`)

The admin account is created automatically on first server start.

---

## 🐛 Troubleshooting

### Database Connection Issues

```bash
# Test your connection
npm run diagnose

# Common fixes:
# 1. Use Session Mode (port 5432), not Transaction Mode
# 2. Check Supabase project is not paused
# 3. Verify DATABASE_URL is correct
```

### Email Not Sending

```bash
# Test email service
npm run test-email your.email@example.com

# Check:
# 1. API keys are correct
# 2. Email service is configured
# 3. Check spam folder
```

### Cloudinary Upload Failing

```bash
# Verify credentials in .env
# Check Cloudinary dashboard for errors
# Ensure CLOUDINARY_CLOUD_NAME, API_KEY, API_SECRET are set
```

### Dashboard Not Loading

```bash
# Test analytics endpoints
npm run test-dashboard

# Make sure you're logged in as admin
# Check browser console for errors
```

---

## 📊 Analytics Dashboard Access

1. Login as admin
2. Click hamburger menu (☰)
3. Select "Analytics Dashboard"
4. View real-time statistics and charts

**Features:**
- Statistics overview cards
- Genre distribution chart
- User growth chart (30 days)
- Popular books ranking
- Recent activity feed
- Top reviewers leaderboard
- Books without reviews

---

## 🚢 Deployment

### Backend (Render)

1. Push code to GitHub
2. Create new Web Service on Render
3. Connect GitHub repository
4. Add environment variables
5. Set `NODE_ENV=production`
6. Deploy

### Frontend (Netlify)

1. Deploy `public/` folder
2. Set build command: (none)
3. Set publish directory: `public`
4. Add environment variables if needed

### Environment Variables for Production

Make sure to set all variables in Render/Netlify dashboard:
- `NODE_ENV=production`
- `DATABASE_URL` (production database)
- `CLOUDINARY_*` credentials
- Email service credentials
- `FRONTEND_URL` and `BACKEND_URL`

---

## 📈 Future Enhancements

Potential features to add:
- [ ] Book borrowing system with due dates
- [ ] Advanced search with filters
- [ ] Dark mode toggle
- [ ] Progressive Web App (PWA)
- [ ] Download tracking
- [ ] Reading lists/collections
- [ ] Social sharing features
- [ ] Discussion forums
- [ ] Mobile app

---

## 📝 License

ISC License - see LICENSE file for details

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

## 🙏 Acknowledgments

- **Chart.js** - Beautiful charts for analytics
- **Bootstrap** - Responsive UI framework
- **Font Awesome** - Icon library
- **Supabase** - PostgreSQL hosting
- **Cloudinary** - File storage
- **Render** - Backend hosting
- **HuggingFace** - AI/ML models

---

**Built with ❤️ for book lovers**

---

## 📸 Screenshots

### Main Library Interface
Browse, search, and download books with an intuitive interface.

### Admin Analytics Dashboard
Real-time statistics with interactive charts and data visualization.

### Book Details Page
Detailed book information with reviews, ratings, and download options.

### AI Chatbot Assistant
Get personalized recommendations and help finding books.

---

**Last Updated**: November 2025  
**Version**: 1.0.0
