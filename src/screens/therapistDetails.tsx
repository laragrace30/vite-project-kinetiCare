import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { db } from "../firebase/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { sendEmail } from "../utils/sendEmail";
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
  degreeFilePath: string;
  clinicContact: string;
  degrees: string;
  fee: string;
}

function TherapistDetails() {
  const { id } = useParams<{ id: string }>();
  const [therapist, setTherapist] = useState<Therapist | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTherapist = async () => {
      if (!id) {
        setError("No therapist ID provided");
        setIsLoading(false);
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

            if (data.degreeFilePath) {
              const storage = getStorage();
              const fileRef = ref(storage, data.degreeFilePath);
              const downloadURL = await getDownloadURL(fileRef);
              data.degreeFilePath = downloadURL;
            }

            setTherapist(data as Therapist);
          } else {
            setError("This user is not a therapist.");
          }
        } else {
          setError("No such therapist found!");
        }
      } catch (error) {
        setError("Error fetching therapist details: " + (error as Error).message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTherapist();
  }, [id]);

  const handleApprove = async () => {
    try {
      if (!therapist || !id) {
        setError("Missing therapist information");
        return;
      }
  
      // First update the status in Firebase
      const therapistRef = doc(db, "users", id);
      await updateDoc(therapistRef, {
        status: "Active"
      });
  
      // Then send the email
      await sendEmail({
        to: therapist.email,
        subject: "Your Therapist Application Has Been Approved",
        text: `Dear ${therapist.firstName} ${therapist.lastName},\n\nWe are pleased to inform you that your application to join KinetiCare has been approved. You can now log in to your account and start using our services.`,
        html: `
          <h2>Application Approved</h2>
          <p>Dear ${therapist.firstName} ${therapist.lastName},</p>
          <p>We are pleased to inform you that your application to join KinetiCare has been approved.</p>
          <p>You can now log in to your account and start using our services.</p>
          <br>
        `
      });
  
      // Update local state
      setTherapist(prev => prev ? { ...prev, status: "Active" } : prev);
      console.log("✅ Approval email sent and status updated successfully!");
  
    } catch (error) {
      console.error("❌ Error in approval process:", error);
      setError(`Error in approval process: ${(error as Error).message}`);
    }
  };
  
  const handleDecline = async () => {
    try {
      if (!therapist || !id) {
        setError("Missing therapist information");
        return;
      }
  
      // First update the status in Firebase
      const therapistRef = doc(db, "users", id);
      await updateDoc(therapistRef, {
        status: "Declined"
      });

      await sendEmail({
        to: therapist.email,
        subject: "Update on Your Therapist Application",
        text: `Dear ${therapist.firstName} ${therapist.lastName},\n\nWe regret to inform you that your application has not been approved. If you would like to apply again, please review our requirements and resubmit your application.`,
        html: `
          <h2>Application Status Update</h2>
          <p>Dear ${therapist.firstName} ${therapist.lastName},</p>
          <p>We regret to inform you that your application has not been approved.</p>
          <p>If you would like to apply again, please review our requirements and resubmit your application.</p>
          <br>
        `
      });
  
      // Update local state
      setTherapist(prev => prev ? { ...prev, status: "Declined" } : prev);
      console.log("✅ Decline email sent and status updated successfully!");
  
    } catch (error) {
      console.error("❌ Error in decline process:", error);
      setError(`Error in decline process: ${(error as Error).message}`);
    }
  };

  const getInitials = (firstName: string, lastName: string) =>
    `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!therapist) return <div>No therapist data found</div>;

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
                <p><span>Clinic Address:</span> {therapist.clinicAddress}</p>
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
        <div className="education">
          <div className="education--details">
            <p><span>Degree:</span> {therapist.degrees}</p>
            <p><span>Consultation Fee:</span> {therapist.fee}</p>
          </div>
            {therapist.degreeFilePath && (
              <div className="degree-section">
                <a href={therapist.degreeFilePath} target="_blank" rel="noopener noreferrer">
                  View Degree
                </a>
              </div>
            )}
        </div>
        <div className="buttons">
          {therapist.status === "Active" ? (
            <button className="approved">Approved</button>
          ) : therapist.status === "Declined" ? (
            <button className="declined">Declined</button>
          ) : (
            <>
              <button className="approve" onClick={handleApprove}>Approve</button>
              <button className="decline" onClick={handleDecline}>Decline</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default TherapistDetails;