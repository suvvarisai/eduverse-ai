import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCzHSPnhHByS7iD0U_rsyEmk8btt3mFUQo",
  authDomain: "ai-learning-app-96519.firebaseapp.com",
  databaseURL: "https://ai-learning-app-96519-default-rtdb.firebaseio.com",
  projectId: "ai-learning-app-96519",
  storageBucket: "ai-learning-app-96519.firebasestorage.app",
  messagingSenderId: "1054939595439",
  appId: "1:1054939595439:web:9bf8ea5100e704c0a00a5a",
  measurementId: "G-WTH7ECYY7S",
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export {
  app,
  analytics,
  auth,
  db,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
};
