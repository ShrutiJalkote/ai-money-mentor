// Import Firebase
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// तुझा config (already correct 👍)
const firebaseConfig = {
  apiKey: "AIzaSyCxuoiOa4x8YGmx4lajLaf_-7MMZ-8KFmo",
  authDomain: "ai-money-mentor-aea2b.firebaseapp.com",
  projectId: "ai-money-mentor-aea2b",
  storageBucket: "ai-money-mentor-aea2b.firebasestorage.app",
  messagingSenderId: "1023598812784",
  appId: "1:1023598812784:web:fff0a51c291062a2125eb5",
  measurementId: "G-DJ0MRKKRQY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// 🔐 Authentication setup (IMPORTANT)
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();