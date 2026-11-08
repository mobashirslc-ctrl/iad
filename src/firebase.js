import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore"; // Firestore ইমপোর্ট করা হলো

const firebaseConfig = {
  apiKey: "AIzaSyCxfrCdcmRIjI6xnevVIJrhm8T_wWaTlwk",
  authDomain: "iadeduaimers.firebaseapp.com",
  projectId: "iadeduaimers",
  storageBucket: "iadeduaimers.firebasestorage.app",
  messagingSenderId: "73779131565",
  appId: "1:73779131565:web:9d4a19ea47db19ef4dc224",
  measurementId: "G-KFRLNHS03H"
};

const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const db = getFirestore(app); // db রিমোট ডাটাবেস হিসেবে এক্সপোর্ট করা হলো