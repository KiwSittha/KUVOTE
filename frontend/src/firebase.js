// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getStorage } from "firebase/storage"; 

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyATUaJyWFLnCdYwtA4PNcAUFOsum9fUOMk",
  authDomain: "kuvote-9f476.firebaseapp.com",
  projectId: "kuvote-9f476",
  storageBucket: "kuvote-9f476.firebasestorage.app",
  messagingSenderId: "144879550455",
  appId: "1:144879550455:web:ebedc76815df3b7338f8f2",
  measurementId: "G-CN18LH7DRJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const storage = getStorage(app);