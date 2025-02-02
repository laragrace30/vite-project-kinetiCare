import { useEffect, useState } from 'react';
import '../index.css';
import { db } from '../firebase/firebase';
import { collection, getDocs, query, where, Timestamp } from "firebase/firestore";

interface Therapist {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
  specialization?: string;
  createdAt?: Timestamp;
}

const Content = () => {
  const [therapistCount, setTherapistCount] = useState(0);
  const [patientCount, setPatientCount] = useState(0);
  const [commissionEarned, setCommissionEarned] = useState(0);
  const [pendingTherapists, setPendingTherapists] = useState<Therapist[]>([]);
  
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

        const pendingTherapistQuery = query(
          usersCollection, 
          where("accountType", "==", "therapist"),
          where("status", "==", "Pending")
        );
        const pendingTherapistSnapshot = await getDocs(pendingTherapistQuery);
        const pendingTherapistsList = pendingTherapistSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Therapist));
        setPendingTherapists(pendingTherapistsList);

        const paymentsCollection = collection(db, "payments"); 
        const paymentsSnapshot = await getDocs(paymentsCollection);

        let totalCommission = 0;
        paymentsSnapshot.forEach(doc => {
          totalCommission += doc.data().convenienceFee || 0; 
        });

        setCommissionEarned(totalCommission);

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
      content: `PHP ${commissionEarned}`,
      image: "src/assets/commission.png"
    }
  ]

  const formatDate = (timestamp: Timestamp | undefined) => {
    if (!timestamp) return 'N/A';
    
    try {
      const date = timestamp.toDate();
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: true,
        timeZone: 'Asia/Manila' 
      });
    } catch (error) {
      return 'N/A';
    }
  };

  return (
    <div>
      <div className='card-container'>
        {card.map((card) => (
          <div className='card' key={card.title}>
            <h5>{card.title}</h5>
            <p className="number">{card.content}</p>
            <img src={card.image} alt={card.title} />
          </div>
        ))}
      </div>

       {pendingTherapists.length > 0 && (
        <div className='pending-therapists-section'>
          <h4 className="pending">Pending Therapists</h4>
          <div className='table-container'>
            <table className='pending-therapists-table'>
              <tbody>
                {pendingTherapists.map((therapist) => (
                  <tr key={therapist.id} className='table-row'>
                    <td>
                      <div className='therapist-name'>{therapist.firstName} {therapist.lastName}</div>
                      <div className='therapist-specialization'>{therapist.specialization || 'No Specialization'}</div>
                    </td>
                    <td className='status-column'>
                      <div className="status">Pending</div>
                      <div className='date'>{formatDate(therapist.createdAt)}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Content;