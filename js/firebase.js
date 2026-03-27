import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDXtKjKkzWFIgid3xgXq4dBl12FFGuAalk",
  authDomain: "trading-app-215a6.firebaseapp.com",
  projectId: "trading-app-215a6",
  storageBucket: "trading-app-215a6.firebasestorage.app",
  messagingSenderId: "838378906372",
  appId: "1:838378906372:web:def69c013e774281a4e651"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ✅ GLOBAL EXPORT
window.db = db;
window.collection = collection;
window.addDoc = addDoc;
window.getDocs = getDocs;
window.deleteDoc = deleteDoc;
window.doc = doc;

