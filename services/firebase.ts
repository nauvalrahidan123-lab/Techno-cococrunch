// FIX: The original imports for `initializeApp` and `getAuth` are for Firebase v9+, but the error message "has no exported member"
// strongly suggests an older version of Firebase (like v8) is installed.
// We will switch to the v8 compatibility library to match the likely environment.
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";

// ====================================================================================
// PENTING: Konfigurasi Kunci API Serverless untuk Vercel
// ====================================================================================
// 1. BUAT PROYEK FIREBASE:
//    - Kunjungi https://console.firebase.google.com/
//    - Buat proyek baru.
//    - Di dalam proyek Anda, buka "Project Settings" (ikon gerigi) > "General".
//    - Scroll ke bawah ke bagian "Your apps" dan klik ikon web (`</>`) untuk mendaftarkan aplikasi web baru.
//    - Beri nama aplikasi Anda dan klik "Register app".
//    - Firebase akan memberikan Anda objek `firebaseConfig`. Salin semua isinya.

// 2. SET ENVIRONMENT VARIABLES DI VERCEL:
//    - Buka dashboard proyek Anda di Vercel.
//    - Pergi ke tab "Settings" > "Environment Variables".
//    - Buat variabel untuk setiap kunci dari objek `firebaseConfig` yang Anda salin.
//    - PENTING: Setiap nama variabel HARUS diawali dengan `VITE_`.
//      - VITE_FIREBASE_API_KEY = "nilai_api_key_anda"
//      - VITE_FIREBASE_AUTH_DOMAIN = "nilai_auth_domain_anda"
//      - VITE_FIREBASE_PROJECT_ID = "nilai_project_id_anda"
//      - VITE_FIREBASE_STORAGE_BUCKET = "nilai_storage_bucket_anda"
//      - VITE_FIREBASE_MESSAGING_SENDER_ID = "nilai_sender_id_anda"
//      - VITE_FIREBASE_APP_ID = "nilai_app_id_anda"
//    - Simpan variabel-variabel tersebut. Vercel akan secara otomatis menyediakannya selama proses build.

// Safely access environment variables.
const env = (import.meta as any).env;

const firebaseConfig = {
  apiKey: env?.VITE_FIREBASE_API_KEY,
  authDomain: env?.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env?.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env?.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env?.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env?.VITE_FIREBASE_APP_ID
};

export let isFirebaseConfigured = true;
let db: firebase.firestore.Firestore | null = null;
let auth: firebase.auth.Auth | null = null;

// FIX: Instead of throwing a crashing error, we now check for config and set a flag.
// This allows the app to run in a "Demo Mode" with mock data if Firebase isn't configured.
if (!firebaseConfig.apiKey || !firebaseConfig.projectId || !firebaseConfig.appId) {
    isFirebaseConfigured = false;
    // We still log a detailed warning to the console to guide the developer.
    console.warn(
        'Konfigurasi Firebase tidak ditemukan atau tidak lengkap! Aplikasi berjalan dalam MODE DEMO.\n\n' +
        'Data tidak akan disimpan. Untuk fungsionalitas penuh, atur environment variables Anda:\n\n' +
        'SOLUSI:\n' +
        '1. Jika menjalankan secara lokal: Buat file bernama `.env.local` di folder utama proyek Anda.\n' +
        '2. Salin-tempel (copy-paste) semua variabel dari `firebaseConfig` proyek Firebase Anda ke dalam file `.env.local` tersebut.\n' +
        '   Contoh isi file `.env.local`:\n' +
        '   VITE_FIREBASE_API_KEY="AIzaSy...YOUR_KEY"\n' +
        '   VITE_FIREBASE_AUTH_DOMAIN="...your-project.firebaseapp.com"\n' +
        '   VITE_FIREBASE_PROJECT_ID="...your-project-id"\n' +
        '   VITE_FIREBASE_STORAGE_BUCKET="...your-project.appspot.com"\n' +
        '   VITE_FIREBASE_MESSAGING_SENDER_ID="...your-sender-id"\n' +
        '   VITE_FIREBASE_APP_ID="1:...:web:..."\n\n' +
        '3. Jika men-deploy ke Vercel: Pastikan semua variabel di atas (diawali dengan VITE_) sudah ditambahkan di menu "Settings" > "Environment Variables" di dashboard Vercel Anda.\n\n' +
        'Setelah melakukan perubahan, Anda mungkin perlu me-restart server pengembangan lokal Anda.'
    );
}


// Initialize Firebase only if it's configured and hasn't been already.
if (isFirebaseConfigured && !firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    auth = firebase.auth();
}

export { db, auth };
