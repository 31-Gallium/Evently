// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC7yQcb1qeKcDBxsiYvkrPTkmnpGgz6qjg",
  authDomain: "canteen-ordering-app-f5c8f.firebaseapp.com",
  projectId: "canteen-ordering-app-f5c8f",
  storageBucket: "canteen-ordering-app-f5c8f.firebasestorage.app",
  messagingSenderId: "366546717965",
  appId: "1:366546717965:web:dfef100f158a2be3453444",
  measurementId: "G-VQSRDFSEYT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
