// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Write player score
export async function submitGlobalScore(name, coins, spins) {
  const ref = doc(db, "slot_leaderboard", name);
  const existing = await getDoc(ref);
  if (existing.exists()) {
    await setDoc(ref, { name, coins, spins });
  } else {
    await setDoc(ref, { name, coins, spins });
  }
}

// Read all scores
export async function fetchGlobalLeaderboard() {
  const snapshot = await getDocs(collection(db, "slot_leaderboard"));
  const results = [];
  snapshot.forEach(doc => {
    results.push(doc.data());
  });
  return results.sort((a, b) => b.coins - a.coins);
}

export { db };

