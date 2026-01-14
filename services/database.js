import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { db } from '../config/firebase.js';

export async function saveTrainingToDB(uid, type, data) {
  try {
    const docRef = await addDoc(
      collection(db, "users", uid, type),
      {
        ...data,
        createdAt: new Date().toISOString(),
      }
    );
    return docRef.id;
  } catch (error) {
    console.error("Error saving training:", error);
    throw error;
  }
}

export async function loadTrainingsFromDB(uid, types) {
  try {
    const allTrainings = [];

    for (const type of types) {
      const qRef = query(
        collection(db, "users", uid, type),
        orderBy("createdAt", "desc")
      );
      const snap = await getDocs(qRef);
      snap.forEach((doc) => {
        allTrainings.push({ id: doc.id, type, ...doc.data() });
      });
    }

    return allTrainings.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  } catch (error) {
    console.error("Error loading trainings:", error);
    throw error;
  }
}

export { db };