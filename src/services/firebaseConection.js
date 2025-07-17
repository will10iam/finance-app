import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
	apiKey: "AIzaSyDnFpdy0gIocZwYgDw2C2VhnZ5KT_nwnyA",
	authDomain: "app-finance-e5e30.firebaseapp.com",
	projectId: "app-finance-e5e30",
	storageBucket: "app-finance-e5e30.firebasestorage.app",
	messagingSenderId: "982915678817",
	appId: "1:982915678817:web:7ab965e9e7d808cd39e020",
	/* measurementId: "G-TW8K0DJ1WZ" */
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);

export { auth, db, storage };
