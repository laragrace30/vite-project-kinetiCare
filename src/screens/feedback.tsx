import { useEffect, useState } from "react";
import { db } from "../firebase/firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { Timestamp } from "firebase/firestore";
import "../styles/feedback.css";
import SideMenu from "../components/sideMenu";

interface Rating {
  id?: string;
  feedback: string;
  patientId?: string;
  patientName?: string;
  rating: number;
  timestamp: Timestamp;
}

interface TherapistRating extends Rating {
  therapistId: string;
  therapistName: string;
  patientId: string;
}

interface PatientRating extends Rating {
  therapistId: string;
}

interface AppRating extends Rating {
  therapistId?: string;
  therapistName?: string;
}

interface NameCache {
  [key: string]: string;
}

function Feedback() {
  const [patientRatings, setPatientRatings] = useState<PatientRating[]>([]);
  const [therapistRatings, setTherapistRatings] = useState<TherapistRating[]>([]);
  const [appRatings, setAppRatings] = useState<AppRating[]>([]);
  const [userNames, setUserNames] = useState<NameCache>({});

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

        const appRatingsCollection = collection(db, "appRatings");
        const appRatingsSnapshot = await getDocs(appRatingsCollection);
        const appRatingsList = appRatingsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as AppRating[];
        setAppRatings(appRatingsList);

        const userNamesCache: NameCache = {};
        const uniqueUserIds = [
          ...new Set([
            ...patientRatingsList.map(r => r.patientId).filter(Boolean),
            ...patientRatingsList.map(r => r.therapistId).filter(Boolean),
            ...therapistRatingsList.map(r => r.patientId).filter(Boolean),
            ...therapistRatingsList.map(r => r.therapistId).filter(Boolean),
            ...appRatingsList.map(r => r.therapistId).filter(Boolean)
          ])
        ];
  
        for (const userId of uniqueUserIds) {
          if (userId) {
            const userDoc = await getDoc(doc(db, "users", userId));
            if (userDoc.exists()) {
              userNamesCache[userId] = userDoc.data().firstName || userDoc.data().fullName || userDoc.data().displayName || 'Unknown';
            }
          }
        }
  
        setUserNames(userNamesCache);
  
      } catch (error) {
        console.error("Error fetching ratings:", error);
      }
    };
  
    fetchRatings();
  }, []);

  const renderStars = (rating: number) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  const getInitials = (name?: string) => {
    return name ? name.split(' ').map(word => word[0]).join('').toUpperCase() : 'N/A';
  };

  const getUserName = (id?: string) => {
    return (id && userNames[id]) || 'Unknown';
  };

  const renderFeedbackSection = (ratings: (PatientRating | TherapistRating | AppRating)[], type: 'patient' | 'therapist' | 'app') => {
    return (
      <div className={`feedback-section--${type}-feedback`}>
        <h3 className={`${type}--feedback`}>{type.charAt(0).toUpperCase() + type.slice(1)} Feedback</h3>
        <div className="feedback-content">
          {ratings.length > 0 ? (
            ratings.map((rating) => (
              <div key={rating.id} className="feedback-card">
                <div className="feedback-header">
                  <div className="avatar">
                    {type === 'app' 
                      ? getInitials((rating as AppRating).therapistName || (rating as AppRating).patientName || 'App')
                      : getInitials(type === 'patient' 
                          ? rating.patientName 
                          : (rating as TherapistRating).therapistName)
                    }
                  </div>
                  <div className="name-timestamp">
                    <span className="name">
                      {type === 'patient' 
                        ? rating.patientName || 'Unknown Patient'
                        : type === 'therapist' 
                          ? (rating as TherapistRating).therapistName || 'Unknown Therapist'
                          : (rating as AppRating).therapistName || (rating as AppRating).patientName || 'App Feedback'}
                    </span>
                    <span className="timestamp">
                      {rating.timestamp.toDate().toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="feedback-stars">
                  {renderStars(rating.rating)}
                </div>
                <div className="feedback-text">
                  {rating.feedback}
                </div>
                {type !== 'app' && (
                  <div className="feedback-about">
                    <strong>
                      {type === 'patient' ? 'About Therapist:' : 'About Patient:'}
                    </strong>{' '}
                    {type === 'patient' 
                      ? getUserName(rating.therapistId)
                      : getUserName((rating as TherapistRating).patientId)}
                  </div>
                )}
              </div>
            ))
          ) : (
            <p>No {type} feedback available.</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="container">
      <SideMenu />
      <div className="details--content">
        <div className="feedback--header">
          <h2 className="feedback">Overall Feedback</h2>
        </div>
        <div className="feedback--container1">
          <div className="feedback-container">
            {renderFeedbackSection(patientRatings, 'patient')}
            {renderFeedbackSection(therapistRatings, 'therapist')}
          </div>
            {renderFeedbackSection(appRatings, 'app')}
        </div>
      </div>
    </div>
  );
}

export default Feedback;