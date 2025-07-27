// src/lib/firebase.ts
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  "projectId": "timewise-94kug",
  "appId": "1:800034535600:web:7038c25eb790ae0f462375",
  "storageBucket": "timewise-94kug.firebasestorage.app",
  "apiKey": "AIzaSyByQcR9EBCiJ4vk8Pn6qF8nJ-o7Vhxi5NI",
  "authDomain": "timewise-94kug.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "800034535600"
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
}

const db = getFirestore(app);

export { db };
