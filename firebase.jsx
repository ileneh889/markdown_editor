
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, collection } from "firebase/firestore"


const firebaseConfig = {
  apiKey: "AIzaSyBq_pYKh0Q2uFvUSlkCGEo_y137JUgfltI",
  authDomain: "notepad-287f5.firebaseapp.com",
  projectId: "notepad-287f5",
  storageBucket: "notepad-287f5.firebasestorage.app",
  messagingSenderId: "921577740597",
  appId: "1:921577740597:web:af67130c4a2a81e35a547c",
  measurementId: "G-2T28TG0CNT"
};


const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

//
export const db = getFirestore(app)
export const notesCollection = collection(db, "notes")