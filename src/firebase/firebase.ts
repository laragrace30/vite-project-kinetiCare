import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyBI2-FkgQ-JzGCg_nuO86bSzp6FoywLWiM",
    authDomain: "kineticare-7cf80.firebaseapp.com",
    databaseURL: "https://kineticare-7cf80-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "kineticare-7cf80",
    storageBucket: "kineticare-7cf80.appspot.com",
    messagingSenderId: "145067539971",
    appId: "1:145067539971:web:a010086d4c69366ecc1836",
    measurementId: "G-2PXZH3HZ2G"
  };

  const app = initializeApp(firebaseConfig);
  export const db = getFirestore(app);
  export const auth = getAuth(app);