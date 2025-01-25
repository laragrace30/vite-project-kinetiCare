import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { db } from '../firebase/firebase';
import { doc, getDoc} from 'firebase/firestore';
import '../styles/patientDetails.css';
import SideMenu from '../components/sideMenu';

interface Patient {
    firstName: string;
    middleName: string;
    lastName: string;
    email: string; 
    phone: string;
    briefDescription: string;
    gender: string;
    contactFirstName: string;
    contactMiddleName: string;
    contactLastName: string;
    contactPhone: string;
    birthDate: string;
    relationship: string;
}

function PatientDetails() {
    const { id } = useParams<{ id: string }>();
    const [patient, setPatient] = useState<Patient | null>(null);

    useEffect(() => {
        if (!id) {
            console.error('No patient ID provided');
            return;
        }

        const fetchPatient = async () => {
            try {
                const docRef = doc(db, 'users', id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setPatient(docSnap.data() as Patient);
                } else {
                    console.log('No such document!');
                }
            } catch (error) {
                console.error('Error fetching patient details:', error);
            }
        };

        fetchPatient();
    }, [id]);

    const getInitials = (firstName: string, lastName: string) => {
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    };

    if (!patient) {
        return <div>Loading...</div>;
    }

    return (
        <div className='container'>
            <SideMenu />
            <div className="details--content">
                <div className="header--patient">
                    <h2 className='personalDetails'>Personal Details</h2>
                    <h2 className='emergencyDetails'>Emergency Contact</h2>
                </div>
                <div className="details--patient">
                    <div className="details-header">
                        <div className="details-header1">
                            <div className="avatar-section">
                                <div className="initials-avatar">
                                    {getInitials(patient.firstName, patient.lastName)}
                                </div>
                            </div>
                            <p><span>First Name:</span> {patient.firstName}</p>
                            <p><span>Middle Name:</span> {patient.middleName}</p>
                            <p><span>Last Name:</span> {patient.lastName}</p>
                        </div>
                        <div className="details-header2">
                            <p><span>Gender:</span> {patient.gender}</p>
                            <p><span>Date of Birth:</span> {patient.birthDate}</p>
                            <p><span>Email:</span> {patient.email}</p>
                            <p><span>Contact Number:</span> {patient.phone}</p>
                        </div>
                        </div>
                    <div className="details-emergency">
                        <div className="details-emergency1">
                            <p><span>First Name:</span> {patient.contactFirstName}</p>
                            <p><span>Middle Name:</span> {patient.contactMiddleName}</p>
                            <p><span>Last Name:</span> {patient.contactLastName}</p>
                        </div>
                        <div className="details-emergency2">
                            <p><span>Relationship:</span> {patient.relationship}</p>
                            <p><span>Contact Number:</span> {patient.contactPhone}</p>
                        </div>
                    </div>
                </div>
                <div className="header--patient2">
                    <h2 className='healthDetails'>Health Concern</h2>
                </div>
                <div className="health--details">
                    <p><span>Brief Description:</span> {patient.briefDescription}</p>
                </div>
            </div>
        </div>
    );
}

export default PatientDetails;