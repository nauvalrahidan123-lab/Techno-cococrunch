// services/firebase.ts

import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore"; // JANGAN LUPA: Tambahkan import untuk Firestore

// PENTING: Menggunakan import.meta.env untuk membaca kunci dari Vercel
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID // Pastikan kunci ini juga ada di Vercel
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Ekspor layanan yang akan digunakan di seluruh aplikasi:
export const db = getFirestore(app);
export const analytics = getAnalytics(app);

// Catatan: Jika Anda tidak menggunakan Analytics, Anda bisa menghapus semua baris yang merujuk ke getAnalytics.
