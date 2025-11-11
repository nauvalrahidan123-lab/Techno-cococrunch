
// FIX: Removed failing vite/client reference and manually defined types for import.meta.env.
// This resolves errors related to missing Vite client type definitions in the project configuration.
interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN: string;
  readonly VITE_FIREBASE_PROJECT_ID: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  readonly VITE_FIREBASE_APP_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

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

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);