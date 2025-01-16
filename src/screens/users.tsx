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
    const [isUpdating, setIsUpdating] = useState(false);
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
        if (isUpdating) return;
        
        setIsUpdating(true);
        try {
            const userDoc = doc(db, 'users', id);
            await updateDoc(userDoc, { status: newStatus });
            
            if (activeTab === 0) {
                setTherapists(prev =>
                    prev.map(therapist =>
                        therapist.id === id ? { ...therapist, status: newStatus } : therapist
                    )
                );
            } else {
                setPatients(prev =>
                    prev.map(patient =>
                        patient.id === id ? { ...patient, status: newStatus } : patient
                    )
                );
            }
        } catch (error) {
            console.error('Error updating status:', error);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleToggleStatus = (e: React.MouseEvent, id: string, currentStatus: string) => {
        e.preventDefault();
        e.stopPropagation();
        
        const newStatus = currentStatus.toLowerCase() === 'active' ? 'Inactive' : 'Active';
        updateUserStatus(id, newStatus);
    };

    const handleRowClick = (e: React.MouseEvent, userId: string) => {
        const target = e.target as HTMLElement;
        if (!target.closest('.toggle-button')) {
            if (activeTab === 0) {
                navigate(`/therapistDetails/${userId}`);
            } else {
                navigate(`/patientDetails/${userId}`);
            }
        }
    };

    const renderUserRow = (user: User) => (
        <tr
            key={user.id}
            onClick={(e) => handleRowClick(e, user.id)}
            className='users-row'
        >
            <td>{user.firstName} {user.lastName}</td>
            <td>{user.status}</td>
            <td>{user.email}</td>
            <td>{activeTab === 0 ? user.specialization : user.briefDescription}</td>
            <td onClick={e => e.stopPropagation()}>
                <ToggleButton 
                    isActive={user.status.toLowerCase() === 'active'}
                    onToggle={(e) => handleToggleStatus(e, user.id, user.status)}
                    disabled={isUpdating}
                />
            </td>
        </tr>
    );

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
                    <div className="content active-content">
                        <table className={activeTab === 0 ? "users-table" : "patients-table"}>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Status</th>
                                    <th>Email</th>
                                    <th>{activeTab === 0 ? 'Specialization' : 'Health Condition'}</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {activeTab === 0
                                    ? therapists.map(renderUserRow)
                                    : patients.map(renderUserRow)
                                }
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Users;