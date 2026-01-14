import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js"; // Dodaj ten import

const firebaseConfig = {
  apiKey: "AIzaSyCiEcksBi4G9OR7H3GA8VYwm7G73YlspaI",
  authDomain: "universaltrainingplanner-241fc.firebaseapp.com",
  databaseURL: "https://universaltrainingplanner-241fc-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "universaltrainingplanner-241fc",
  storageBucket: "universaltrainingplanner-241fc.firebasestorage.app",
  messagingSenderId: "1087012477704",
  appId: "1:1087012477704:web:c30b98af4a5691e3726abd",
  measurementId: "G-NYJPYV8ZFG",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };