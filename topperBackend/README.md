# TopperNotes Backend API (`topperBackend`) ⚙️

A scalable and high-performance Node.js & Express application providing the engine for the TopperNotes ecosystem.

---

## 🏗️ Structure

*   `src/`: Primary source code.
    *   `controllers/`: Request handling and response formatting.
    *   `models/`: Mongoose schemas for MongoDB.
    *   `routes/`: API endpoint definitions and middleware.
    *   `services/`: Business logic and external integrations (Storage, Payments).
    *   `middleware/`: Authentication (JWT), file uploads (Multer), and rate limiting.
    *   `config/`: Global configurations for DB, Redis, and Firebase.
*   `tests/`: Suite of tests for platform reliability.
*   `uploads/`: Temporary storage for file processing.

---

## 🛠️ Tech Stack & Dependencies

*   **Node.js**: The powerful JavaScript runtime.
*   **Express.js (v5+)**: Fast, unopinionated, minimalist web framework.
*   **MongoDB & Mongoose**: Flexible document-based database and data modeling.
*   **Redis (ioredis)**: High-speed caching for rate limiting and task queues (BullMQ).
*   **Firebase Admin**: Secure cloud storage for topper-uploaded notes.
*   **Razorpay SDK**: Official integration for payment processing and payouts.
*   **PDF Processing**: `pdf-parse` and `pdf2pic` for extracting preview content from notes.
*   **Security**: `helmet`, `cors`, and `express-rate-limit` for robust protection.

---

## ✨ Features Highlight

1.  **Student Management**: Tracking activity stats, followers, and learning streaks.
2.  **Topper Analytics**: Calculating sales, revenue, and content ratings.
3.  **Note Engine**: Processing uploaded PDFs, generating thumbnails, and serving secure note content.
4.  **Transaction History**: Secure logging and verification of payment IDs and status.
5.  **Role-based Access**: Dynamic permissions for Students, Toppers, and Administrators.

---

## 🚀 Running Locally

1.  Ensure you have Node.js, MongoDB, and Redis installed.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure your environment:
    *   Create a `.env` file based on the environment requirements.
    *   Include MongoDB URI, Redis credentials, and API keys.
4.  Start the development server:
    ```bash
    npm run dev
    ```

---

## 🛡️ Security
*   **Rate Limiting**: Integrated with Redis to prevent DDoS and brute-force attacks.
*   **JWT Authentication**: Securely managing user sessions with token-based auth.
*   **Input Validation**: Using **Joi** for comprehensive request body verification.
