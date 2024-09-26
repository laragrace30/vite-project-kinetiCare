import { useEffect, useState } from 'react';
import '../index.css';
import { db } from '../firebase/firebase';
import { collection, getDocs, query, where } from "firebase/firestore";
import notification from '../assets/notification.png';

const Content = () => {
  const [therapistCount, setTherapistCount] = useState(0);
  const [patientCount, setPatientCount] = useState(0);
  // const [commissionEarned, setCommissionEarned] = useState(0);
  
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const usersCollection = collection(db, "users");
        
        const therapistQuery = query(usersCollection, where("accountType", "==", "therapist"));
        const therapistSnapshot = await getDocs(therapistQuery);
        setTherapistCount(therapistSnapshot.size); 


        const patientQuery = query(usersCollection, where("accountType", "==", "patient"));
        const patientSnapshot = await getDocs(patientQuery);
        setPatientCount(patientSnapshot.size); 

        // // Fetch commission earned (if needed)
        // const commissionData = await fetch('your-backend-url/commission'); // Replace with actual API URL
        // const commission = await commissionData.json();
        // setCommissionEarned(commission.total);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchCounts();
  }, []);

  const card =[
    {
      title: 'Active Patients',
      content: `${patientCount}`,
      image: "src/assets/patients.png"
    },
    {
      title: 'Active Therapists',
      content: `${therapistCount}`,
      image: "src/assets/therapist.png"
    },
    {
      title: 'Commission Earned',
      content: 'content',
      image: "src/assets/commission.png"
    }
  ]

  return (
    <div className='notification'>
      <img src={notification} alt="Notification Icon" className='icon-notify'/>
    <div className='card-container'>
      {card.map((card) => (
        <div className='card' key={card.title}>
          <h5>{card.title}</h5>
          <p>{card.content}</p>
          <img src={card.image} alt={card.title} />
        </div>
      ))}
      </div>
    </div>
  );
};

export default Content;
