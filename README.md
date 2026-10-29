# ReWear – Community Clothing Exchange 👕

ReWear is a web-based platform designed to encourage sustainable fashion by allowing users to exchange unused clothing. Whether through direct swaps or a point-based redemption system, ReWear helps reduce textile waste and promotes a circular economy.

> ✅ **Status:** Production-ready with Docker deployment support for Azure VM

---

## 🌍 Overview

**ReWear** empowers individuals to:
- Swap wearable garments with others
- Purchase pre-loved clothing
- Promote eco-conscious fashion practices

By creating a platform for easy clothing exchange, ReWear aims to reduce landfill waste and give clothing a second life.

---

## 🚀 Core Features

### 🔐 User Authentication
- Email/password registration and login
- Google OAuth integration
- JWT-based authentication

### 🏠 Landing Page
- Introduction to the platform
- Featured items carousel
- Quick access to browse and upload

### 👤 User Dashboard
- View and edit user profile
- Current points balance
- Uploaded items overview
- Swap and purchase history

### 📦 Item Listing
- Browse all available items
- Detailed product pages with image galleries
- Upload new items with multiple images
- Cloudinary-powered image storage

### 🔄 Swap System
- Request swaps with points
- Accept/reject swap requests
- Points-based economy
- Transaction tracking

### 💰 Purchase System
- Buy items directly
- Purchase history
- Messaging between buyers and sellers

### 🛠️ Admin Panel
- User management
- Platform statistics
- Activity monitoring
- Content moderation

---

## 📅 Development Status

✅ **Completed Features:**
- User authentication (Email/Password + Google OAuth)
- Product listing and browsing
- Image upload with Cloudinary
- Swap system with points
- Purchase tracking
- Messaging system
- Admin panel
- Docker deployment ready

The platform is production-ready and can be deployed on Azure VM using Docker.

## 🧑‍💻 Tech Stack

- **Frontend:** HTML, CSS, JavaScript (Nginx)
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (MongoDB Atlas)
- **Authentication:** JWT + Passport.js (Google OAuth)
- **Image Storage:** Cloudinary
- **Deployment:** Docker + Azure VM
- **Version Control:** Git & GitHub

---

## 🚀 Deployment

### Quick Start (Local)
```bash
# Backend
cd BE
npm install
cp .env.example .env
# Configure .env
npm run dev

# Frontend
# Open docs/index.html in browser
```

### Docker Deployment (Azure VM)
```bash
# On Azure VM
git clone <your-repo-url>
cd ReWear
cp .env.production .env
# Configure .env
chmod +x deploy.sh
./deploy.sh
```

**Documentation:**
- 📖 [Docker Deployment Guide](DOCKER_DEPLOYMENT.md)
- ✅ [Azure Deployment Checklist](AZURE_DEPLOYMENT_CHECKLIST.md)
- 🚀 [Quick Start Guide](QUICKSTART.md)
- 📁 [Project Structure](PROJECT_STRUCTURE.md)
- 🐳 [Docker README](DOCKER_README.md)

---

## 🤝 Contributing

Want to contribute? Fork the repo, make changes, and create a pull request! Suggestions and feedback are also welcome as issues.

---

## 📄 License

This project is open-source and will be licensed under [MIT License](LICENSE) (to be added).

---

## 🌱 Let's Build a More Sustainable World – One Swap at a Time!
