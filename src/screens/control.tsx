// import { useState, useEffect } from "react";
// import { db } from "../firebase/firebase";
// import { collection, query, where, getDocs } from "firebase/firestore";
// import "../styles/control.css";

// interface Weights {
//   specialization: number;
//   location: number;
//   price: number;
//   [key: string]: number;
// }

// interface User {
//   id: string;
//   accountType: string;
//   specialization?: string;
//   fee?: number;
//   clinicAddress?: string;
//   address?: string; 
// }

// function Control() {
//   const [weights, setWeights] = useState<Weights>({
//     specialization: 0,
//     location: 0,
//     price: 0,
//   });

//   const [therapists, setTherapists] = useState<User[]>([]);
//   const [patients, setPatients] = useState<User[]>([]);
//   const [isUpdating, setIsUpdating] = useState(false);

//   // Fetch therapists and patients from Firebase
//   useEffect(() => {
//     const fetchUsers = async () => {
//       try {
//         // Fetch therapists
//         const therapistQuery = query(
//           collection(db, "users"),
//           where("accountType", "==", "therapist")
//         );
//         const therapistSnapshot = await getDocs(therapistQuery);
//         const therapistData = therapistSnapshot.docs.map((doc) => ({
//           id: doc.id,
//           ...doc.data(),
//         })) as User[];

//         setTherapists(therapistData);

//         // Fetch patients
//         const patientQuery = query(
//           collection(db, "users"),
//           where("accountType", "==", "patient")
//         );
//         const patientSnapshot = await getDocs(patientQuery);
//         const patientData = patientSnapshot.docs.map((doc) => ({
//           id: doc.id,
//           ...doc.data(),
//         })) as User[];

//         setPatients(patientData);
//       } catch (error) {
//         console.error("Error fetching users:", error);
//       }
//     };

//     fetchUsers();
//   }, []);

//   // Handle input changes for manual weight adjustment
//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setWeights((prev) => ({ ...prev, [name]: Number(value) }));
//   };

//   // Save updated weights
//   const handleSubmit = async () => {
//     if (isUpdating) return;

//     setIsUpdating(true);
//     try {
//       console.log("Saving weights to Firebase...", weights);
//       // You can implement the Firebase save logic here.
//       alert("Weights updated successfully!");
//     } catch (error) {
//       console.error("Error updating weights:", error);
//     } finally {
//       setIsUpdating(false);
//     }
//   };

//   return (
//     <div className="control-container">
//       <h1>Adjust Recommendation Weights</h1>

//       <form className="control-form">
//         <div className="form-group">
//           <label>Specialization:</label>
//           <input
//             type="number"
//             name="specialization"
//             value={weights.specialization}
//             onChange={handleChange}
//             min="0"
//             max="100"
//           />
//         </div>

//         <div className="form-group">
//           <label>Location:</label>
//           <input
//             type="number"
//             name="location"
//             value={weights.location}
//             onChange={handleChange}
//             min="0"
//             max="100"
//           />
//         </div>

//         <div className="form-group">
//           <label>Price:</label>
//           <input
//             type="number"
//             name="price"
//             value={weights.price}
//             onChange={handleChange}
//             min="0"
//             max="100"
//           />
//         </div>

//         <button
//           type="button"
//           onClick={handleSubmit}
//           disabled={isUpdating}
//           className={isUpdating ? "button-disabled" : ""}
//         >
//           {isUpdating ? "Updating..." : "Save"}
//         </button>
//       </form>

//       <h2>Data Preview</h2>
//       <div>
//         <h3>Therapists</h3>
//         <ul>
//           {therapists.map((therapist) => (
//             <li key={therapist.id}>
//               {therapist.specialization || "N/A"} - Fee: {therapist.fee || "N/A"} - Address:{" "}
//               {therapist.clinicAddress || "N/A"}
//             </li>
//           ))}
//         </ul>

//         <h3>Patients</h3>
//         <ul>
//           {patients.map((patient) => (
//             <li key={patient.id}>
//               Address: {patient.address || "N/A"}
//             </li>
//           ))}
//         </ul>
//       </div>
//     </div>
//   );
// }

// export default Control;
import { useState, useEffect } from "react";
import SideMenu from "../components/sideMenu";
import { db } from "../firebase/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import "../styles/control.css";

interface Weights {
  specialization: number;
  location: number;
  price: number;
  [key: string]: number;
}

function Control() {
  const [weights, setWeights] = useState<Weights>({
    specialization: 0,
    location: 0,
    price: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch weights from Firebase
  useEffect(() => {
    const fetchWeights = async () => {
      try {
        const docRef = doc(db, "weights", "recommendation");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setWeights(docSnap.data() as Weights);
        } else {
          console.error("No weights data found");
        }
      } catch (error) {
        console.error("Error fetching weights:", error);
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchWeights();
  }, []);
  

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setWeights((prev) => ({ ...prev, [name]: Number(value) }));
  };

  // Save updated weights
  const handleSubmit = async () => {
    if (isUpdating) return;

    setIsUpdating(true);
    try {
      const docRef = doc(db, "weights", "recommendation");
      await updateDoc(docRef, weights);
      alert("Weights updated successfully!");
    } catch (error) {
      console.error("Error updating weights:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="container">
      <SideMenu />
      <div className="users">
        <h1 className="page-title">Admin Control Panel</h1>
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <form className="control-form">
            <div className="form-group">
              <label>Specialization:</label>
              <input
                type="number"
                name="specialization"
                value={weights.specialization}
                onChange={handleChange}
                min="0"
                max="100"
              />
            </div>
            <div className="form-group">
              <label>Location:</label>
              <input
                type="number"
                name="location"
                value={weights.location}
                onChange={handleChange}
                min="0"
                max="100"
              />
            </div>
            <div className="form-group">
              <label>Price:</label>
              <input
                type="number"
                name="price"
                value={weights.price}
                onChange={handleChange}
                min="0"
                max="100"
              />
            </div>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isUpdating}
              className={isUpdating ? "button-disabled" : ""}
            >
              {isUpdating ? "Updating..." : "Save"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default Control;
