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

// FIX: Safely access environment variables to prevent runtime errors if import.meta.env is undefined.
const env = (import.meta as any).env;

const firebaseConfig = {
  apiKey: env?.VITE_FIREBASE_API_KEY,
  authDomain: env?.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env?.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env?.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env?.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env?.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
export const db = firebase.firestore();
export const auth = firebase.auth();
