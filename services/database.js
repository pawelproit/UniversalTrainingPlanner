
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  where,
  deleteDoc,
  doc,
  limit,
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

export async function deleteTrainingFromDB(uid, type, trainingId) {
  try {
    await deleteDoc(doc(db, "users", uid, type, trainingId));
    return true;
  } catch (error) {
    console.error("Error deleting training:", error);
    throw error;
  }
}

export async function getUserStats(uid) {
  try {
    const types = ["running", "swimming", "strength"];
    const stats = {
      totalTrainings: 0,
      byType: {},
      recentTrainings: [],
      volumeStats: {}
    };

    for (const type of types) {
      const colRef = collection(db, "users", uid, type);
      
      const snapshot = await getDocs(colRef);
      const count = snapshot.size;
      
      stats.byType[type] = count;
      stats.totalTrainings += count;

      const qRef = query(colRef, orderBy("createdAt", "desc"), limit(5));
      const snap = await getDocs(qRef);
      snap.forEach((doc) => {
        stats.recentTrainings.push({ id: doc.id, type, ...doc.data() });
      });

      if (type === 'strength') {
        let totalVolume = 0;
        snapshot.forEach((doc) => {
          const data = doc.data();
          if (data.tasks) {
            data.tasks.forEach(task => {
              const sets = parseInt(task.sets) || 0;
              const reps = parseInt(task.reps) || 0;
              const weight = parseFloat(task.weight) || 0;
              totalVolume += sets * reps * weight;
            });
          }
        });
        stats.volumeStats.strength = Math.round(totalVolume);
      }
    }

    stats.recentTrainings.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    stats.recentTrainings = stats.recentTrainings.slice(0, 10);

    return stats;
  } catch (error) {
    console.error("Error loading user stats:", error);
    throw error;
  }
}

export async function getTrainingsByFilter(uid, filters = {}) {
  try {
    const { type, dateFrom, dateTo, search } = filters;
    const types = type ? [type] : ["running", "swimming", "strength"];
    const allTrainings = [];

    for (const trainingType of types) {
      let qRef = query(
        collection(db, "users", uid, trainingType),
        orderBy("createdAt", "desc")
      );

      const snap = await getDocs(qRef);
      snap.forEach((doc) => {
        const training = { id: doc.id, type: trainingType, ...doc.data() };
        
        let include = true;
        
        if (dateFrom) {
          const trainingDate = new Date(training.createdAt);
          const filterDateFrom = new Date(dateFrom);
          if (trainingDate < filterDateFrom) include = false;
        }
        
        if (dateTo) {
          const trainingDate = new Date(training.createdAt);
          const filterDateTo = new Date(dateTo);
          filterDateTo.setHours(23, 59, 59, 999);
          if (trainingDate > filterDateTo) include = false;
        }
        
        if (include) {
          allTrainings.push(training);
        }
      });
    }

    if (search) {
      const searchLower = search.toLowerCase();
      return allTrainings.filter(training => 
        training.name.toLowerCase().includes(searchLower) ||
        training.tasks?.some(task => 
          task.name?.toLowerCase().includes(searchLower) ||
          task.description?.toLowerCase().includes(searchLower)
        )
      );
    }

    return allTrainings;
  } catch (error) {
    console.error("Error loading filtered trainings:", error);
    throw error;
  }
}

export { db };