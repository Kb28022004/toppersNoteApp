# TopperNotes Ecosystem 🚀

Welcome to **TopperNotes**, a comprehensive ed-tech platform designed to bridge the gap between academic excellence and accessibility. This ecosystem consists of a high-performance Mobile App for students and toppers, a robust Node.js Backend, and a specialized Admin Dashboard for platform management.

---

## 🏗️ Project Architecture

The project is divided into three main components:

1.  **Mobile App (`TopperApp/`)**: A premium React Native (Expo) application for both Students and Toppers.
2.  **Backend (`topperBackend/`)**: A scalable Node.js & Express API powered by MongoDB and Redis.
3.  **Admin Panel (`topperAdmin/`)**: A React-Vite dashboard for managing users, notes, and financial transactions.

---

## ✨ Key Features

### 🎓 For Students
*   **Notes Marketplace**: Browse and purchase verified notes from top-performing students.
*   **Learning Library**: Access all purchased notes in a clean, organized interface.
*   **Learning Streak**: Gamified engagement with daily activity tracking and milestones.
*   **Study Buddy AI (Future)**: Interactive AI chat for explaining complex concepts within purchased notes.
*   **Following System**: Follow your favorite toppers to stay updated on their latest uploads.

### 🌟 For Toppers
*   **Content Monetization**: Upload high-quality notes and earn revenue from sales.
*   **Performance Analytics**: Track sales, followers, and note ratings in real-time.
*   **Profile Management**: Showcase academic expertise and build a following.

### 🛡️ For Administrators
*   **Note Verification**: Review and approve/reject uploaded notes for quality control.
*   **User Management**: Monitor student and topper activity across the platform.
*   **Financial Tracking**: Manage transactions, payouts, and platform revenue.

---

## 🛠️ Tech Stack

### Frontend (Mobile)
*   **Framework**: React Native with Expo (v54+)
*   **State Management**: Redux Toolkit & RTK Query
*   **Navigation**: React Navigation (Native, Bottom Tabs, Stack)
*   **Styling**: Premium Custom Theme System (Dark Mode optimized)
*   **Storage**: AsyncStorage

### Backend
*   **Runtime**: Node.js
*   **Framework**: Express.js
*   **Database**: MongoDB (Mongoose)
*   **Caching**: Redis (BullMQ, Rate Limiting)
*   **Auth**: JWT (JSON Web Tokens) & Bcryptjs
*   **Payments**: Razorpay Integration
*   **File Handling**: Multer & Firebase Admin

### Admin Dashboard
*   **Framework**: React (v19) with Vite
*   **UI Library**: Material UI (MUI)
*   **Visualization**: Recharts for analytics
*   **State Management**: Redux Toolkit

---

## 🚀 Getting Started

### Prerequisites
*   Node.js (v18+)
*   npm or yarn
*   Expo Go (for mobile testing)
*   MongoDB & Redis instances

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd toppersNoteApp
    ```

2.  **Setup Backend:**
    ```bash
    cd topperBackend
    npm install
    # Configure your .env file
    npm run dev
    ```

3.  **Setup Mobile App:**
    ```bash
    cd TopperApp
    npm install
    npx expo start
    ```

4.  **Setup Admin Panel:**
    ```bash
    cd topperAdmin
    npm install
    npm run dev
    ```

---

## 🔮 Roadmap (Future Goals)
*   **RAG-based AI Agent**: Implementing Retrieval-Augmented Generation to allow students to "chat" with their notes.
*   **Video Samples**: Supporting short video explanations for complex note chapters.
*   **Offline Mode**: Downloading notes for offline study.
*   **Community Forums**: Subject-specific discussion boards for students.

---

## 📄 License
This project is proprietary and confidential. Authorized access only.
