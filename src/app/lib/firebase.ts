// src/lib/firebase.ts

import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // <-- Importa Firestore

const firebaseConfig = {
  apiKey: "AIzaSyD1jNwAhNzgYm4G3SapoTW6VqQtw24AjRE",
  authDomain: "checklist-4-ilhas-ac28e.firebaseapp.com",
  projectId: "checklist-4-ilhas-ac28e",
  storageBucket: "checklist-4-ilhas-ac28e.appspot.com",
  messagingSenderId: "798347716767",
  appId: "1:798347716767:web:060474657e9f2a254b1aaa"
};

// Só inicializa uma vez (evita erro hot reload)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app); // <-- Exporta o Firestore aqui
