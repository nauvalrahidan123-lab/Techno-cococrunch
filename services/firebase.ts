// FIX: The original imports for `initializeApp` and `getAuth` are for Firebase v9+, but the error message "has no exported member"
// strongly suggests an older version of Firebase (like v8) is installed.
// We will switch to the v8 compatibility library to match the likely environment.
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";

// ====================================================================================
// KONFIGURASI FIREBASE ANDA (Dimasukkan secara langsung untuk perbaikan cepat)
// ====================================================================================
// Aplikasi sekarang akan terhubung ke proyek Firebase Anda.
const firebaseConfig = {
  apiKey: "AIzaSyD1XcritWqOqugz6UyAvQf3baBiwiZPXaw",
  authDomain: "cococrunch-7f0b6.firebaseapp.com",
  projectId: "cococrunch-7f0b6",
  storageBucket: "cococrunch-7f0b6.firebasestorage.app",
  messagingSenderId: "851739950789",
  appId: "1:851739950789:web:a0597a8c22d8afd0a07aac",
  measurementId: "G-8Z881EWE5D"
};


// --- Kode Asli (Menggunakan Environment Variables - Praktik Terbaik untuk Deployment) ---
// Untuk deployment production di Vercel nanti, disarankan untuk kembali menggunakan metode ini.
// Cukup hapus komentar di bawah ini dan hapus objek firebaseConfig di atas.
/*
const env = (import.meta as any).env;

const firebaseConfig = {
  apiKey: env?.VITE_FIREBASE_API_KEY,
  authDomain: env?.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env?.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env?.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env?.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env?.VITE_FIREBASE_APP_ID
};
*/

export let isFirebaseConfigured = true;
let db: firebase.firestore.Firestore | null = null;
let auth: firebase.auth.Auth | null = null;

// Logika ini sekarang akan menemukan konfigurasi Anda dan mengaktifkan koneksi Firebase.
// Mode Demo akan otomatis nonaktif.
if (!firebaseConfig.apiKey || !firebaseConfig.projectId || !firebaseConfig.appId) {
    isFirebaseConfigured = false;
    console.warn(
        'Konfigurasi Firebase tidak ditemukan atau tidak lengkap! Aplikasi berjalan dalam MODE DEMO.\n\n' +
        'Data tidak akan disimpan. Untuk fungsionalitas penuh, atur environment variables Anda atau masukkan konfigurasi langsung di services/firebase.ts'
    );
}


// Initialize Firebase only if it's configured and hasn't been already.
if (isFirebaseConfigured && !firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    auth = firebase.auth();
}

export { db, auth };