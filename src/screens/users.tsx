import { useState, useEffect } from 'react';
import SideMenu from '../components/sideMenu';
import ToggleButton from '../components/toggleButton';
import { useNavigate } from 'react-router-dom';
import '../styles/users.css';
import { db } from '../firebase/firebase';
import { collection, query, where, doc, getDocs, updateDoc } from 'firebase/firestore';

interface User {
    id: string;
    firstName: string;
    lastName: string;
    status: string;
    email: string;
    specialization?: string;
    accountType: string;
    briefDescription?: string;
}

function Users() {
    const [activeTab, setActiveTab] = useState(0);
    const [therapists, setTherapists] = useState<User[]>([]);
    const [patients, setPatients] = useState<User[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUsers = async (type: string) => {
            try {
                const q = query(collection(db, "users"), where("accountType", "==", type));
                const querySnapshot = await getDocs(q);
                const usersData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as User[];

                if (type === "therapist") {
                    setTherapists(usersData);
                } else {
                    setPatients(usersData);
                }
            } catch (error) {
                console.error(`Error fetching ${type}s:`, error);
            }
        };

        if (activeTab === 0) {
            fetchUsers("therapist");
        } else if (activeTab === 1) {
            fetchUsers("patient");
        }
    }, [activeTab]);

    const updateUserStatus = async (id: string, newStatus: string) => {
        const userDoc = doc(db, 'users', id);
        await updateDoc(userDoc, { status: newStatus });
    };

    const handleToggleStatus = (id: string, currentStatus: string) => {
        const newStatus = currentStatus.toLowerCase() === 'active' ? 'inactive' : 'active';
        console.log(`Toggling user with ID: ${id} to ${newStatus}`);

        if (activeTab === 0) {
            setTherapists(prevTherapists =>
                prevTherapists.map(therapist =>
                    therapist.id === id ? { ...therapist, status: newStatus } : therapist
                )
            );
        } else if (activeTab === 1) {
            setPatients(prevPatients =>
                prevPatients.map(patient =>
                    patient.id === id ? { ...patient, status: newStatus } : patient
                )
            );
        }

        updateUserStatus(id, newStatus);
    };

    const handleTap = (userId: string) => {
        if (activeTab === 0) {
            navigate(`/therapistDetails/${userId}`);
        } else if (activeTab === 1) {
            navigate(`/patientDetails/${userId}`);
        }
    };

    return (
        <div className="container">
            <SideMenu />
            <div className="users">
                <div className="tabs-container">
                    <div
                        className={`tabs ${activeTab === 0 ? 'activePT-tabs' : ''}`}
                        onClick={() => setActiveTab(0)}
                    >
                        Physical Therapist
                    </div>
                    <div
                        className={`tab ${activeTab === 1 ? 'activePatient-tabs' : ''}`}
                        onClick={() => setActiveTab(1)}
                    >
                        Patients
                    </div>
                </div>
                <div className="content-tabs">
                    {activeTab === 0 && (
                        <div className="content active-content">
                            <table className="users-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Status</th>
                                        <th>Email</th>
                                        <th>Specialization</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {therapists.map((therapist) => (
                                        <tr key={therapist.id} onClick={() => handleTap(therapist.id)} className='users-row'>
                                            <td>{therapist.firstName} {therapist.lastName}</td>
                                            <td>{therapist.status}</td>
                                            <td>{therapist.email}</td>
                                            <td>{therapist.specialization}</td>
                                            <td>
                                                <ToggleButton 
                                                    isActive={therapist.status.toLowerCase() === 'active'}
                                                    onToggle={() => handleToggleStatus(therapist.id, therapist.status)}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    {activeTab === 1 && (
                        <div className="content active-content">
                            <table className="patients-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Status</th>
                                        <th>Email</th>
                                        <th>Health Condition</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {patients.map((patient) => (
                                        <tr key={patient.id} onClick={() => handleTap(patient.id)} className='users-row'>
                                            <td>{patient.firstName} {patient.lastName}</td>
                                            <td>{patient.status}</td>
                                            <td>{patient.email}</td>
                                            <td>{patient.briefDescription}</td>
                                            <td>
                                                <ToggleButton 
                                                    isActive={patient.status.toLowerCase() === 'active'}
                                                    onToggle={() => handleToggleStatus(patient.id, patient.status)}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Users;
