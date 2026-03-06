// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getStorage } from "firebase/storage"; 

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyChUqEN2DayHrf7N65REfbOIXNKfHefXYM",
  authDomain: "kuvote-d0556.firebaseapp.com",
  projectId: "kuvote-d0556",
  storageBucket: "kuvote-d0556.firebasestorage.app",
  messagingSenderId: "412120860525",
  appId: "1:412120860525:web:9927e44ad6e68ee4f9fc64",
  measurementId: "G-25ZQRQMFWG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const storage = getStorage(app);