# TopperNotes Mobile App (TopperApp) 📱

A high-performance, premium React Native application built with Expo to serve as the primary interface for the TopperNotes ecosystem.

---

## 🏗️ Structure

*   `src/`: Core source code.
    *   `screens/`: Student and Topper screen implementations.
    *   `components/`: Reusable UI elements (Buttons, Modals, Cards).
    *   `features/`: Redux Toolkit slices and RTK Query API slices.
    *   `theme/`: Global theme system and styling constants.
    *   `routes/`: Navigation structure (Tabs, Stacks).
    *   `hooks/`: Custom React hooks for business logic.
    *   `context/`: Context API for alerts, auth, etc.
*   `assets/`: Static files (Images, Fonts, Icons).

---

## 🛠️ Tech Stack & Dependencies

*   **Expo (v54+)**: Cross-platform development framework.
*   **React Navigation**: Dynamic navigation for both students and toppers.
*   **Redux Toolkit (RTK)**: State management and RTK Query for API integration.
*   **React Native Sheets**: Modular bottom-sheet system for filters and actions.
*   **Vector Icons**: Comprehensive icon sets from `@expo/vector-icons`.
*   **Linear Gradient**: Premium background effects using `expo-linear-gradient`.
*   **Redux Persistence**: Managing student sessions using `AsyncStorage`.

---

## ✨ Features Highlight

1.  **Student Profile**: Featuring a dynamic **Learning Streak** with gamified milestones.
2.  **Marketplace**: Infinite-scrolling notes store with advanced filtering and sorting.
3.  **Real-time Analytics**: Toppers can track their sales and followers synchronously.
4.  **Note Preview**: Specialized image-based preview system with zoom functionality.
5.  **Secure Payments**: Integrated with Razorpay for a seamless checkout experience.

---

## 🚀 Running Locally

1.  Ensure you have Node.js and the Expo Go app (on mobile) installed.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npx expo start
    ```
4.  Scan the QR code with your Expo Go app or use an Android/iOS emulator.

---

## 🎨 Theme System
The app uses a centralized theme system located in `src/theme/Theme.js`.
*   **Global Modal Styling**: Backgrounds and item surfaces are managed globally for consistency.
*   **Responsive Layout**: Uses context and layout constants for diverse screen sizes.
