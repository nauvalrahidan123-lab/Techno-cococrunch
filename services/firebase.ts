import { initializeApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

// Konfigurasi ini sekarang berisi kredensial asli dari proyek Firebase Anda.
const firebaseConfig = {
  apiKey: "AIzaSyD1XcritWqOqugz6UyAvQf3baBiwiZPXaw",
  authDomain: "cococrunch-7f0b6.firebaseapp.com",
  projectId: "cococrunch-7f0b6",
  storageBucket: "cococrunch-7f0b6.firebasestorage.app",
  messagingSenderId: "851739950789",
  appId: "1:851739950789:web:a0597a8c22d8afd0a07aac",
  measurementId: "G-8Z881EWE5D"
};


// Inisialisasi Firebase.
// Pola ini lebih sederhana dan lebih andal untuk memastikan layanan diekspor 
// hanya setelah inisialisasi berhasil. Jika gagal, aplikasi akan berhenti
// dan menampilkan layar error yang jelas, yang lebih baik untuk debugging.
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
} catch (error) {
    console.error("KRITIS: Inisialisasi Firebase Gagal!", error);
    console.error(
      "Pastikan kredensial di `services/firebase.ts` sudah benar dan " +
      "sesuai dengan proyek Firebase Anda di console.firebase.google.com"
    );
    // Melemparkan error akan menghentikan aplikasi dan ditangkap oleh ErrorBoundary,
    // yang akan menunjukkan masalahnya dengan jelas kepada pengembang.
    throw new Error("Gagal menginisialisasi Firebase. Aplikasi tidak dapat berjalan.");
}

export { db, auth };