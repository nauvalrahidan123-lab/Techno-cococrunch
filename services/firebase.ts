import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth"; // Tambahkan ini untuk login admin
import { getAnalytics } from "firebase/analytics";

// Menggunakan import.meta.env untuk membaca Environment Variables dari Vercel
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Ekspor layanan yang akan digunakan di seluruh aplikasi
export const db = getFirestore(app);
export const auth = getAuth(app); // Ekspor autentikasi
export const analytics = getAnalytics(app);

// Catatan: Pastikan Anda telah mengatur semua variabel VITE_... di Vercel.
