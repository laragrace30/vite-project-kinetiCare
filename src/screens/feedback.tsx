import { useEffect, useState } from "react";
import { db } from "../firebase/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Timestamp } from "firebase/firestore";
import "../styles/feedback.css";
import SideMenu from "../components/sideMenu";

interface Rating {
  id: string;
  feedback: string;
  patientId: string;
  patientName: string;
  rating: number;
  timestamp: Timestamp;
}

interface TherapistRating extends Rating {
  therapistId: string;
  therapistName: string;
}

interface PatientRating extends Rating {
  therapistId: string;
}

function Feedback() {
  const [patientRatings, setPatientRatings] = useState<PatientRating[]>([]);
  const [therapistRatings, setTherapistRatings] = useState<TherapistRating[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRatings = async () => {
      try {
        const patientRatingsCollection = collection(db, "patientRatings");
        const patientRatingsSnapshot = await getDocs(patientRatingsCollection);
        const patientRatingsList = patientRatingsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as PatientRating[];
        setPatientRatings(patientRatingsList);

        const therapistRatingsCollection = collection(db, "therapistRatings");
        const therapistRatingsSnapshot = await getDocs(therapistRatingsCollection);
        const therapistRatingsList = therapistRatingsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as TherapistRating[];
        setTherapistRatings(therapistRatingsList);
      } catch (error) {
        console.error("Error fetching ratings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRatings();
  }, []);

  return (
    <div className="container">
      <SideMenu />
      <div className="details--content">
        <div className="header">
          <h2 className="personalDetails">Feedback</h2>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="feedback-container">
            {/* Patient Ratings Section */}
            <div className="feedback-section patient-feedback">
              <h3 style={{ marginLeft: '5%' }}>Patient Feedback</h3>
              <div className="feedback-content">
                {patientRatings.length > 0 ? (
                  patientRatings.map((rating) => (
                    <div key={rating.id} className="feedback-card">
                      <p><strong>Patient Name:</strong> {rating.patientName}</p>
                      <p><strong>Feedback:</strong> {rating.feedback}</p>
                      <p><strong>Rating:</strong> {rating.rating} / 5</p>
                      <p><strong>Timestamp:</strong> {rating.timestamp.toDate().toLocaleString()}</p>
                    </div>
                  ))
                ) : (
                  <p>No patient feedback available.</p>
                )}
              </div>
            </div>

            {/* Therapist Ratings Section */}
            <div className="feedback-section therapist-feedback">
              <h3 style={{ marginLeft: '50%' }}>Therapist Feedback</h3>
              <div className="feedback-content">
                {therapistRatings.length > 0 ? (
                  therapistRatings.map((rating) => (
                    <div key={rating.id} className="feedback-card">
                      <p><strong>Therapist Name:</strong> {rating.therapistName}</p>
                      <p><strong>Feedback:</strong> {rating.feedback}</p>
                      <p><strong>Rating:</strong> {rating.rating} / 5</p>
                      <p><strong>Timestamp:</strong> {rating.timestamp.toDate().toLocaleString()}</p>
                    </div>
                  ))
                ) : (
                  <p>No therapist feedback available.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Feedback;