import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// =========================================================================
// PERBAIKAN ERROR TS2339: Menambahkan deklarasi tipe untuk 'import.meta.env'
// =========================================================================
declare global {
  interface ImportMeta {
    readonly env: {
      readonly [key: string]: string | undefined;
    };
  }
}
// =========================================================================


// Variabel Environment. Kita asumsikan ini berjalan di lingkungan VITE atau sejenisnya.
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export layanan Firestore dan Auth
export const db = getFirestore(app);
export const auth = getAuth(app);
