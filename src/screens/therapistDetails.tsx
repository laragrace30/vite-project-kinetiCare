import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { db } from '../firebase/firebase';
import { doc, getDoc,updateDoc } from 'firebase/firestore';
import '../styles/details.css';
import SideMenu from '../components/sideMenu';

interface Therapist {
    firstName: string;
    lastName: string;
    email: string;    
    experience: string;
    licenseNumber: string;
    phone: string;
    specialization: string;
    gender: string;
    status: string;
  }

function TherapistDetails() {
    const { id } = useParams<{ id: string }>();
    const [therapist, setTherapist] = useState<Therapist | null>(null);

    useEffect(() => {
        if (!id) {
            console.error('No therapist ID provided');
            return;
        }

        const fetchTherapist = async () => {
            try {
                const docRef = doc(db, 'users', id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setTherapist(docSnap.data() as Therapist);
                } else {
                    console.log('No such document!');
                }
            } catch (error) {
                console.error('Error fetching therapist details:', error);
            }
        };

        fetchTherapist();
    }, [id]);

    if (!therapist) {
        return <div>Loading...</div>;
    }

    const handleApprove = async () => {
      try {
          if (id) {
              const docRef = doc(db, 'users', id);
              await updateDoc(docRef, { status: 'active' });
              setTherapist((prevTherapist) =>
                  prevTherapist ? { ...prevTherapist, status: 'active' } : prevTherapist
              );
          }
      } catch (error) {
          console.error('Error updating status:', error);
      }
  };
  

  return (
    <div className='container'>
      <SideMenu />
      <div className="details--content">
        <div className='header'>
            <h2 className='personalDetails'>Personal Details</h2>
            <h2 className='workDetails'>Work Details</h2>
        </div>
        <div className="details">
        <div className="details-header">
              <p><span>First Name:</span> {therapist.firstName}</p>
              <p><span>Middle Name:</span></p>
              <p><span>Last Name:</span> {therapist.lastName}</p>
              <p><span>Specialization:</span> {therapist.specialization}</p>
              <p><span>Experience:</span> {therapist.experience}</p>
              <p><span>Contact Info:</span> {therapist.phone}</p>
          </div>
          <div className="details-info">
              <p><span>Gender:</span> {therapist.gender}</p>
              <p><span>DOB:</span> </p>
              <p><span>Email:</span> {therapist.email}</p>
              <p><span>Contact Number:</span> {therapist.phone}</p>
              <p><span>Hospital/Clinic:</span> </p>
              <p><span>Address:</span> </p>
          </div>
        </div>
        <div className='buttons'>
        {therapist.status !== 'active' ? (
                <>
                    <button className='approve' onClick={handleApprove}>
                        Approve
                    </button>
                    <button className='decline'>Decline</button>
                </>
            ) : (
                <button className='approved'>Approved</button>
            )}
        </div>
      </div>
    </div>
  );
}

export default TherapistDetails;