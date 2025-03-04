import { useState, useEffect } from 'react';
import SideMenu from '../components/sideMenu';
import ToggleButton from '../components/toggleButton';
import { useNavigate } from 'react-router-dom';
import '../styles/users.css';
import { db } from '../firebase/firebase';
import { collection, query, where, doc, getDocs, updateDoc} from 'firebase/firestore';
import { useCallback } from 'react';

interface User {
    id: string;
    firstName: string;
    lastName: string;
    status: string;
    email: string;
    specialization?: string;
    accountType: string;
    injury?: string;
}

const STATUS_MAPPING = {
    display: {
        therapist: {
            Pending: 'Pending Approval', 
            Active: 'Approved',          
            Inactive: 'Deactivated'  
        },
        patient: {
            Active: 'Active',
            Inactive: 'Inactive'
        }
    },
    database: {
        'Pending Approval': 'Pending',
        'Deactivated': 'Inactive', 
        Approved: 'Active',
        Inactive: 'Inactive',
        Active: 'Active'
    }
};


function Users() {
    const [activeTab, setActiveTab] = useState(0);
    const [therapists, setTherapists] = useState<User[]>([]);
    const [patients, setPatients] = useState<User[]>([]);
    const [isUpdating, setIsUpdating] = useState(false);
    const [currentPages, setCurrentPages] = useState({
        therapists: 1,
        patients: 1
    });
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState('');
    // const [statusOptions, setStatusOptions] = useState<string[]>([]);
    const [specializationFilter, setSpecializationFilter] = useState('');
    // const [specializations, setSpecializations] = useState<Array<{ id: string; name: string }>>([]);
    const [healthConditionFilter, setHealthConditionFilter] = useState('');
    const [injuryOptions, setInjuryOptions] = useState<string[]>([]);
    const [specializationOptions, setSpecializationOptions] = useState<string[]>([]);
    const [ptStatusOptions, setPTStatusOptions] = useState<string[]>([]);
    const [patientStatusOptions, setPatientStatusOptions] = useState<string[]>([]);

    const itemsPerPage = 10;
    const navigate = useNavigate();

    const getDisplayStatus = (dbStatus: string): string => {
        const mappings = activeTab === 0 
            ? STATUS_MAPPING.display.therapist 
            : STATUS_MAPPING.display.patient;
        return mappings[dbStatus as keyof typeof mappings] || dbStatus;
    };

    const getDatabaseStatus = useCallback((displayStatus: string): string => {
        return STATUS_MAPPING.database[displayStatus as keyof typeof STATUS_MAPPING.database] || displayStatus;
    }, []);    


    useEffect(() => {
        const fetchPTStatus = async () => {
            try {
                const q = query(collection(db, "users"), where("accountType", "==", "therapist"));
                const querySnapshot = await getDocs(q);
                const fetchedPTStatus = querySnapshot.docs.map(doc => doc.data().status).filter(Boolean);
                const uniquePTStatus = Array.from(new Set(fetchedPTStatus));
                setPTStatusOptions(uniquePTStatus);
            } catch (error) {
                console.error("Error fetching status options:", error);
            }
        };
        
        if (activeTab === 1) {
            fetchPTStatus();
        }
    }, [activeTab]);

    useEffect(() => {
        const fetchPatientStatus = async () => {
            try {
                const q = query(collection(db, "users"), where("accountType", "==", "patient"));
                const querySnapshot = await getDocs(q);
                const fetchedPatientStatus = querySnapshot.docs.map(doc => doc.data().status).filter(Boolean);
                const uniquePatientStatus = Array.from(new Set(fetchedPatientStatus));
                setPatientStatusOptions(uniquePatientStatus);
            } catch (error) {
                console.error("Error fetching status options:", error);
            }
        };
        
        if (activeTab === 1) {
            fetchPatientStatus();
        }
    }, [activeTab]);

    useEffect(() => {
        const fetchSpecializations = async () => {
            try {
                const q = query(collection(db, "users"), where("accountType", "==", "therapist"));
                const querySnapshot = await getDocs(q);
                const fetchedSpecializations = querySnapshot.docs.map(doc => doc.data().specialization).filter(Boolean);
                const uniqueSpecializations = Array.from(new Set(fetchedSpecializations));
                setSpecializationOptions(uniqueSpecializations);
            } catch (error) {
                console.error('Error fetching specializations:', error);
            }
        };
        fetchSpecializations();
    }, []);


    useEffect(() => {
        const fetchInjuryOptions = async () => {
            try {
                const q = query(collection(db, "users"), where("accountType", "==", "patient"));
                const querySnapshot = await getDocs(q);
                const injuries = querySnapshot.docs.map(doc => doc.data().injury).filter(Boolean);
                const uniqueInjuries = Array.from(new Set(injuries));
                setInjuryOptions(uniqueInjuries);
            } catch (error) {
                console.error("Error fetching injury options:", error);
            }
        };
        
        if (activeTab === 1) {
            fetchInjuryOptions();
        }
    }, [activeTab]);

    useEffect(() => {
        const fetchUsers = async (type: string) => {
            try {
                const q = query(collection(db, "users"), where("accountType", "==", type));
                const querySnapshot = await getDocs(q);
                const usersData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as User[];
        
                // });
                const filteredUsers = usersData.filter(user => {
                    const nameMatch = `${user.firstName} ${user.lastName}`
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase());
                
                    const statusMatch = !statusFilter || user.status === getDatabaseStatus(statusFilter);
                    const specializationMatch = activeTab === 0 ? !specializationFilter || user.specialization === specializationFilter : true;
                    const healthConditionMatch = activeTab === 1 ? !healthConditionFilter || user.injury === healthConditionFilter : true;
                
                    return nameMatch && statusMatch && specializationMatch && healthConditionMatch;
                });
                
        
                if (type === "therapist") {
                    setTherapists(filteredUsers);
                } else {
                    setPatients(filteredUsers);
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
    }, [activeTab, searchQuery, statusFilter, specializationFilter, healthConditionFilter, getDatabaseStatus]);
    

    const updateUserStatus = async (id: string, newStatus: string) => {
        if (isUpdating) return;
        
        setIsUpdating(true);
        try {
            const userDoc = doc(db, 'users', id);
            const dbStatus = getDatabaseStatus(newStatus);
            await updateDoc(userDoc, { status: dbStatus });
            
            if (activeTab === 0) {
                setTherapists(prev =>
                    prev.map(therapist =>
                        therapist.id === id ? { ...therapist, status: dbStatus } : therapist
                    )
                );
            } else {
                setPatients(prev =>
                    prev.map(patient =>
                        patient.id === id ? { ...patient, status: dbStatus } : patient
                    )
                );
            }
        } catch (error) {
            console.error('Error updating status:', error);
        } finally {
            setIsUpdating(false);
        }
    };


    const handleToggleStatus = (e: React.ChangeEvent<HTMLInputElement>, id: string, currentStatus: string) => {
        e.preventDefault();
        e.stopPropagation();
        
        const currentDisplayStatus = STATUS_MAPPING.display.therapist[currentStatus as keyof typeof STATUS_MAPPING.display.therapist] || currentStatus;
    
        let newDisplayStatus: keyof typeof STATUS_MAPPING.database;
        if (currentDisplayStatus === 'Pending Approval') {
            newDisplayStatus = 'Approved'; // Approve PT
        } else if (currentDisplayStatus === 'Approved') {
            newDisplayStatus = 'Inactive'; // Deactivate PT
        } else {
            newDisplayStatus = 'Approved'; // Reactivate PT
        }
    
        updateUserStatus(id, STATUS_MAPPING.database[newDisplayStatus]);
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

    const currentUsers = activeTab === 0 ? therapists : patients;
    const currentPage = activeTab === 0 
        ? currentPages.therapists 
        : currentPages.patients;

    const setCurrentPage = (pageNumber: number) => {
        setCurrentPages(prev => ({
            ...prev,
            [activeTab === 0 ? 'therapists' : 'patients']: pageNumber
        }));
    };

    const totalPages = Math.ceil(currentUsers.length / itemsPerPage);
    const indexOfLastUser = currentPage * itemsPerPage;
    const indexOfFirstUser = indexOfLastUser - itemsPerPage;
    const currentItems = currentUsers.slice(indexOfFirstUser, indexOfLastUser);

    const renderUserRow = (user: User) => (
        <tr
            key={user.id}
            onClick={(e) => handleRowClick(e, user.id)}
            className='users-row'
        >
            <td>{user.firstName} {user.lastName}</td>
            <td>{getDisplayStatus(user.status)}</td>
            <td>{user.email}</td>
            <td>{activeTab === 0 ? user.specialization : user.injury}</td>
            <td onClick={e => e.stopPropagation()}>
                <ToggleButton 
                    isActive={user.status.toLowerCase() === 'active'}
                    onToggle={(e: React.ChangeEvent<HTMLInputElement>) => handleToggleStatus(e, user.id, user.status)}
                    disabled={isUpdating}
                />
            </td>
        </tr>
    );

    return (
        <div className="container">
            <SideMenu />
            <div className="users">
            <div className="filters">
            <input
                type="text"
                placeholder="Search by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
            {/* {activeTab === 0 ? (
             <select onChange={(e) => setStatusFilter(e.target.value)} value={statusFilter}>
                <option value="">Filter by status</option>
                {ptStatusOptions.map((status, index) => (
                    <option key={index} value={status}>
                        {status}
                    </option>
                ))}
            </select>
            ) : ( */}
            {activeTab === 0 ? (
                <select onChange={(e) => setStatusFilter(e.target.value)} value={statusFilter}>
                    <option value="">Filter by status</option>
                    {ptStatusOptions.map((status, index) => (
                        <option key={index} value={status === "Inactive" ? "Deactivated" : status}>
                            {status === "Inactive" ? "Deactivated" : status}
                        </option>
                    ))}
                </select>
            ) : (
                <select onChange={(e) => setStatusFilter(e.target.value)} value={healthConditionFilter}>
                <option value="">Filter by status</option>
                {patientStatusOptions.map((status, index) => (
                    <option key={index} value={status}>
                        {status}
                    </option>
                ))}
            </select>
            )}

            {activeTab === 0 ? (
                <select onChange={(e) => setSpecializationFilter(e.target.value)} value={specializationFilter}>
                    <option value="">Filter by specialization</option>
                    {specializationOptions.map((specialization, index) => (
                        <option key={index} value={specialization}>
                            {specialization}
                        </option>
                    ))}
                </select>
            ) : (
                <select onChange={(e) => setHealthConditionFilter(e.target.value)} value={healthConditionFilter}>
                    <option value="">Filter by health condition</option>
                    {injuryOptions.map((injury, index) => (
                        <option key={index} value={injury}>
                            {injury}
                        </option>
                    ))}
                </select>
            )} 
        </div>

                <div className="tabs-container">
                    <div
                        className={`tabs ${activeTab === 0 ? 'activePT-tabs' : ''}`}
                        onClick={() => {
                            setActiveTab(0);
                            setCurrentPages(prev => ({ ...prev, therapists: 1 }));
                        }}
                    >
                        Physical Therapist
                    </div>
                    <div
                        className={`tab ${activeTab === 1 ? 'activePatient-tabs' : ''}`}
                        onClick={() => {
                            setActiveTab(1);
                            setCurrentPages(prev => ({ ...prev, patients: 1 }));
                        }}
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
                                    <th>Activate/Deactivate</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentItems.map(renderUserRow)}
                            </tbody>
                        </table>
                        {totalPages > 1 && (
                            <div className="pagination">
                                <span 
                                    onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
                                    className={`pagination-nav ${currentPage === 1 ? 'disabled' : ''}`}
                                >
                                    &lt;
                                </span>
                                {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                                    <span
                                        key={pageNumber}
                                        onClick={() => setCurrentPage(pageNumber)}
                                        className={`pagination-number ${currentPage === pageNumber ? 'active' : ''}`}
                                    >
                                        {pageNumber}
                                    </span>
                                ))}
                                <span 
                                    onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
                                    className={`pagination-nav ${currentPage === totalPages ? 'disabled' : ''}`}
                                >
                                    &gt;
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Users;