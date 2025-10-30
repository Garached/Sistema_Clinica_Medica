import { initializeApp } from "firebase/app";
import { getFirestore, collection } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDHSB2vlJtX0q2lby1xil8tYIy0Ytu75cQ",
  authDomain: "clinicamedicadb-4e2b0.firebaseapp.com",
  projectId: "clinicamedicadb-4e2b0",
  storageBucket: "clinicamedicadb-4e2b0.firebasestorage.app",
  messagingSenderId: "951187123911",
  appId: "1:951187123911:web:fdbac75e45a50974c698e2",
  measurementId: "G-PB8YZNVZDZ"
};

const app = initializeApp(firebaseConfig);
console.log("Firebase App Initialized successfully!");
export const db = getFirestore(app);

export const pacientesCollection = collection(db, "pacientes");
export const medicosCollection = collection(db, "medicos");
export const agendamentosCollection = collection(db, "agendamentos");
export const vacinasCollection = collection(db, "vacinas");
