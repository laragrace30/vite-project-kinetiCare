// index.cjs
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc, setDoc } = require('firebase/firestore');

// Initialize express
const app = express();
app.use(bodyParser.json());
app.use(cors());

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBI2-FkgQ-JzGCg_nuO86bSzp6FoywLWiM",
  authDomain: "kineticare-7cf80.firebaseapp.com",
  projectId: "kineticare-7cf80",
  storageBucket: "kineticare-7cf80.appspot.com",
  messagingSenderId: "145067539971",
  appId: "1:145067539971:android:80069b455ed9f8d5cc1836",
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

// API routes
app.get("/api/weights", async (req, res) => {
  try {
    const docRef = doc(db, "weights", "recommendation");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      res.json(docSnap.data());
    } else {
      res.status(404).json({ error: "Weights not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/weights", async (req, res) => {
  try {
    const weights = req.body;
    const docRef = doc(db, "weights", "recommendation");
    await setDoc(docRef, weights);
    res.status(200).json({ message: "Weights updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
