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
  clinicContact: string;
  degrees: string;
  fee: string;
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
      <h2 className="workDetails">Professional Details</h2>
    </div>
    <div className="therapist">
      <div className="details">
        <div className="details-header--therapist">
          <div className="details-header--therapist1">
            <div className="avatar-section--therapist">
              <div className="initials-avatar">
                {getInitials(therapist.firstName, therapist.lastName)}
              </div>
            </div>
            <p><span>First Name:</span> {therapist.firstName}</p>
            <p><span>Middle Name:</span> {therapist.middleName}</p>
            <p><span>Last Name:</span> {therapist.lastName}</p>
          </div>
          <div className="details-header--therapist2">
            <p><span>Gender:</span> {therapist.gender}</p>
            <p><span>Birth Date:</span> {therapist.birthDate}</p>
            <p><span>Phone:</span> {therapist.phone}</p>
            <p><span>Email:</span> {therapist.email}</p>
          </div>
        </div>
      </div>
      <div className="details--work">
          <div className="details-info--therapist">
            <div className="details-info--therapist1">
              <p><span>Specialization:</span> {therapist.specialization}</p>
              <p><span>Experience:</span> {therapist.experience}</p>
              <p><span>Clinic/Hospital:</span> {therapist.clinic}</p>
            </div>
            <div className="details-info--therapist2">
              <p><span>Clinic Address:</span>{therapist.clinicAddress}</p>
              <p><span>Clinic/Hospital Contact:</span> {therapist.clinicContact}</p>
              <p><span>License Number:</span> {therapist.licenseNumber}</p>
            </div>
            {therapist.licenseFilePath && (
              <div className="license-section">
                <a href={therapist.licenseFilePath} target="_blank" rel="noopener noreferrer">
                  View License
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="header2">
      <h2 className="educationDetails">Educational Details</h2>
      </div>
      <div className="education--details">
        <p><span>Degree:</span> {therapist.degrees}</p>
        <p><span>Consultation Fee:</span> {therapist.fee}</p>
      </div>
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
