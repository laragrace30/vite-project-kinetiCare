import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { db } from "../firebase/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import "../styles/details.css";
import SideMenu from "../components/sideMenu";

interface Therapist {
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  experience: string;
  licenseNumber: string;
  phone: string;
  specialization: string;
  gender: string;
  status: string;
  clinic: string;
  clinicAddress: string;
  birthDate: string;
  licenseFilePath: string;
}

function TherapistDetails() {
  const { id } = useParams<{ id: string }>();
  const [therapist, setTherapist] = useState<Therapist | null>(null);

  useEffect(() => {
    const fetchTherapist = async () => {
      if (!id) {
        console.error("No therapist ID provided");
        return;
      }

      try {
        const docRef = doc(db, "users", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();

          if (data.accountType === "therapist") {
            if (data.licenseFilePath) {
              const storage = getStorage();
              const fileRef = ref(storage, data.licenseFilePath);
              const downloadURL = await getDownloadURL(fileRef);
              data.licenseFilePath = downloadURL;
            }

            setTherapist(data as Therapist);
          } else {
            console.error("This user is not a therapist.");
          }
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching therapist details:", error);
      }
    };

    fetchTherapist();
  }, [id]);

  const handleApprove = async () => {
    try {
      if (id) {
        const docRef = doc(db, "users", id);
        await updateDoc(docRef, { status: "Active" });
        setTherapist((prev) => (prev ? { ...prev, status: "Active" } : prev));
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  if (!therapist) return <div>Loading...</div>;

  const getInitials = (firstName: string, lastName: string) =>
    `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  return (
    <div className="container">
      <SideMenu />
      <div className="details--content">
  <div className="header">
    <h2 className="personalDetails">Personal Details</h2>
  </div>
  <div className="details">
    <div className="details-header">
      <div className="avatar-section">
        <div className="initials-avatar">
          {getInitials(therapist.firstName, therapist.lastName)}
        </div>
      </div>
      <p><span>First Name:</span> {therapist.firstName}</p>
      <p><span>Last Name:</span> {therapist.lastName}</p>
      <p><span>Specialization:</span> {therapist.specialization}</p>
    </div>
    <div className="details-info">
      <p><span>Email:</span> {therapist.email}</p>
      <p><span>Experience:</span> {therapist.experience}</p>
      <p><span>Gender:</span> {therapist.gender}</p>
      <p><span>Phone:</span> {therapist.phone}</p>
      <p><span>Clinic:</span> {therapist.clinic}</p>
      <p><span>Clinic Address:</span> {therapist.clinicAddress}</p>
      <p><span>Birth Date:</span> {therapist.birthDate}</p>
    </div>
    {therapist.licenseFilePath && (
      <div className="license-section">
        <a href={therapist.licenseFilePath} target="_blank" rel="noopener noreferrer">
          Download License
        </a>
      </div>
    )}
  </div>
  {/* Buttons are placed here, outside of the scrollable content */}
  <div className="buttons">
    {therapist.status !== "Active" ? (
      <>
        <button className="approve" onClick={handleApprove}>Approve</button>
        <button className="decline">Decline</button>
      </>
    ) : (
      <button className="approved">Approved</button>
    )}
  </div>
</div>

    </div>
  );
}

export default TherapistDetails;
