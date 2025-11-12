import { initializeApp, getApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

// Konfigurasi ini sekarang berisi kredensial asli dari proyek Firebase Anda.
// Ini akan menghubungkan aplikasi ke database Anda.
const firebaseConfig = {
  apiKey: "AIzaSyD1XcritWqOqugz6UyAvQf3baBiwiZPXaw",
  authDomain: "cococrunch-7f0b6.firebaseapp.com",
  projectId: "cococrunch-7f0b6",
  storageBucket: "cococrunch-7f0b6.firebasestorage.app",
  messagingSenderId: "851739950789",
  appId: "1:851739950789:web:a0597a8c22d8afd0a07aac",
  measurementId: "G-8Z881EWE5D"
};


let app: FirebaseApp;
let db: Firestore | null = null;
let auth: Auth | null = null;
let isFirebaseConfigured = false;

// Robust initialization logic using modern v9+ syntax
try {
  // 1. Check if the configuration looks like a placeholder.
  if (!firebaseConfig.apiKey || firebaseConfig.apiKey.startsWith("GANTI_DENGAN")) {
    throw new Error("Konfigurasi Firebase masih menggunakan placeholder. Harap ganti dengan kredensial asli Anda.");
  }
  
  // 2. Initialize the app, or get the existing one if it's already initialized.
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  
  // 3. If the app is successfully initialized, get the Firestore and Auth services.
  db = getFirestore(app);
  auth = getAuth(app);
  isFirebaseConfigured = true;

} catch (error: any) {
  // 4. If any part of the initialization fails, catch the error.
  isFirebaseConfigured = false;
  db = null;
  auth = null;
  
  // Provide a much more helpful error message in the developer console.
  console.error("KRITIS: Inisialisasi Firebase Gagal!", error);
  console.warn(
    'Aplikasi sekarang berjalan dalam MODE DEMO.\n\n' +
    'PENYEBAB UTAMA: Objek `firebaseConfig` di dalam file `services/firebase.ts` kemungkinan besar salah atau belum diganti. ' +
    'Ini adalah langkah paling penting. Anda HARUS menggantinya dengan kredensial dari proyek Firebase Anda sendiri untuk melanjutkan.'
  );
}

// 5. Export the initialized services (or null if initialization failed).
export { db, auth, isFirebaseConfigured };