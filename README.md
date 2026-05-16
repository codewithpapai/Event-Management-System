# Event Management System

A complete, fully functional web application for managing events, built with Node.js, Express, MongoDB, and EJS. Designed with a modern Glassmorphism UI.

## 🌟 Features

### For Users:
- **Authentication**: Secure Login and Registration using JWT and Bcrypt.
- **Browse Events**: Search and filter events by title and category.
- **View Details**: Check event description, date, location, and seat availability.
- **RSVP/Register**: One-click registration for events.
- **My Dashboard**: View and manage registered events, or cancel registrations.
- **Profile Management**: Update name and email address.

### For Admins:
- **Dashboard Analytics**: View total events, users, and registrations at a glance.
- **Event Management**: Create, delete, and approve events.
- **User Management**: View all registered users in the system.
- **Image Uploads**: Upload posters for events using Multer.
- **Approval System**: Events can be set to "pending" or "approved".

## 🛠️ Tech Stack
- **Frontend**: HTML5, CSS3 (Vanilla), EJS (Embedded JavaScript)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Security**: JWT (JSON Web Tokens), Bcryptjs
- **File Handling**: Multer

## 🚀 Installation & Setup

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (LTS version recommended)
- [MongoDB Community Server](https://www.mongodb.com/try/download/community)

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory and add:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/event_management
JWT_SECRET=your_secret_key
```

### 4. Seed Admin Account
Run this to create the default admin user:
```bash
node scripts/seedAdmin.js
```
- **Username**: `admin`
- **Password**: `admin123`

### 5. Run the Application
```bash
node server.js
```
Visit `http://localhost:3000` in your browser.

## 🎨 Design System
- **Theme**: Dark Purple / Dark Blue
- **Style**: Glassmorphism (Blur effects, semi-transparent cards)
- **Animations**: Smooth fade-ins and hover transitions.

## 📄 License
This project is created for educational purposes as a college project.
