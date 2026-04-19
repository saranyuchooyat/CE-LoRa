import { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useQueries } from "@tanstack/react-query";
import api from "../../components/api";
import MenuNameCard from "../../components/card/menuNameCard";
import SummaryCard from "../../components/card/summaryCard";
import CardFilter from "../../components/card/cardFilter";
import DataTableCard from "../../components/card/dataTableCard";
import Modal from "../../components/modalForm/modal";
import AddUserForm from "../../components/modalForm/addUserForm";
import EditUserForm from "../../components/modalForm/editUserForm";
import SetZoneZoneStaff from "../../components/modalForm/setZoneZoneStaff";

const initialFilters = {
  search: "", 
  role: "ทั้งหมด", 
  status: "ทั้งหมด",
};

function UserManagement(){
    
    const location = useLocation();

    const [filters, setFilters] = useState(initialFilters);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const handleOpenModal = () => setIsModalOpen(true);
    const handleCloseModal = () => setIsModalOpen(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);

    const [isSettingModalOpen, setIsSettingModalOpen] = useState(false);
    const [selectedSettingUserId, setSelectedSettingUserId] = useState(null);

    const handleOpenSettingModal = (userId) => {
        setSelectedSettingUserId(userId);
        setIsSettingModalOpen(true);
    };

    const handleCloseSettingModal = () => {
        setSelectedSettingUserId(null);
        setIsSettingModalOpen(false);
    };

    const userQueries = useQueries({
        queries: [
        { queryKey: ['users'], queryFn: () => api.get('/users').then(res => res.data) },
        ],
    });

    const isSystemLoading = userQueries.some(query => query.isLoading);
    const isSystemError = userQueries.some(query => query.isError);

    const userData = userQueries[0].data || [];

    useEffect(() => {
        const tokenInStorage = sessionStorage.getItem('token');
        if (location.state?.token && location.state.token !== tokenInStorage) {
            sessionStorage.setItem('token', location.state.token);
        }
    }, [location.state]);

    const handleOpenEditModal = (userId) => {
        setSelectedUserId(userId);
        setIsEditModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setSelectedUserId(null);
        setIsEditModalOpen(false);
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleClearFilters = () => {
        setFilters(initialFilters);
    };

    const filteredUsers = useMemo(() => {
        const { search, role, status } = filters;
        let data = userData; 

        if (search) {
            const lowerSearch = search.toLowerCase();
            data = data.filter(user => {
                const fullName = user.first_name ? `${user.first_name} ${user.last_name || ''}`.toLowerCase() : '';
                const nameMatch = fullName.includes(lowerSearch) || (user.name && user.name.toLowerCase().includes(lowerSearch));
                const usernameMatch = user.username && user.username.toLowerCase().includes(lowerSearch);
                const emailMatch = user.email && user.email.toLowerCase().includes(lowerSearch);
                const phoneMatch = user.phone && String(user.phone).includes(lowerSearch);
                
                return nameMatch || usernameMatch || emailMatch || phoneMatch;
            });
        }

        if (role && role !== "ทั้งหมด") {
            data = data.filter((user) => user.role === role);
        }

        if (status && status !== 'ทั้งหมด') {
            data = data.filter((user) => {
                const checkStatus = status.toLowerCase();
                
                if (checkStatus === 'online') {
                    return user.is_online === true;
                } else if (checkStatus === 'offline') {
                    return user.is_online === false || user.is_online === undefined;
                }
                
                return true;
            });
        }
        
        return data;
    }, [userData, filters]);

    const roleCountsObject = userData.reduce((acc, user) => {
        const role = user.role || "ไม่ระบุบทบาท";
        acc[role] = (acc[role] || 0) + 1;
        return acc;
    }, {});

    const staffDataList = Object.entries(roleCountsObject).map(([roleName, count]) => {
        return {
            name: roleName,
            value: count
        };
    });

    const totalStaffObjects = {
        name: "จำนวนทั้งหมด", 
        value: userData.length
    };

    const staffData = [
        totalStaffObjects,
        ...staffDataList
    ];
    
    if (isSystemLoading) {
        return <div className="mx-5 mt-10 text-center text-xl">Loading Dashboard...</div>;
    }
        
    if (isSystemError) {
        return <div className="mx-5 mt-10 text-center text-xl text-red-600">Error fetching data!</div>;
    }

    return(
        <>
            <div className="mx-5">
                <MenuNameCard
                title="จัดการผู้ใช้งาน"
                description="ระบบจัดการบัญชีผู้ใช้และสิทธิ์การเข้าถึง"
                onButtonClick={handleOpenModal} 
                detail={false}
                buttonText="ผู้ใช้งาน"/>

                <SummaryCard data={staffData}/>

                <CardFilter
                    name="ผู้ใช้งาน"
                    placeholderName=" ชื่อ, อีเมล, หรือเบอร์โทรศัพท์"
                    option1Name="สถานะ"
                    option2Name="บทบาท"
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onClear={handleClearFilters}
                    option2Key="role"
                />
                
                <DataTableCard 
                    data={filteredUsers}
                    onEdit={handleOpenEditModal}
                    onSetting={handleOpenSettingModal}
                />
            </div>

            <Modal 
                title="เพิ่มผู้ใช้งานใหม่" 
                isOpen={isModalOpen}
                onClose={handleCloseModal}>

                <AddUserForm 
                    onClose={() => {
                    handleCloseModal();
                    userQueries[0].refetch();
                    }} 
                />
            </Modal>

            <Modal
            title="แก้ไขข้อมูลผู้ใช้งาน"
            isOpen={isEditModalOpen}
            onClose={handleCloseEditModal}
            >
                <EditUserForm 
                    userId={selectedUserId} 
                    onClose={handleCloseEditModal}
                    onSaveSuccess={() => userQueries[0].refetch()}
                />
            </Modal>

            <Modal
                title="ตั้งค่าสิทธิ์พื้นที่ดูแล"
                isOpen={isSettingModalOpen}
                onClose={handleCloseSettingModal}
            >
                <SetZoneZoneStaff 
                    userId={selectedSettingUserId}
                    onClose={handleCloseSettingModal}
                    onSaveSuccess={() => userQueries[0].refetch()}
                />
            </Modal>


        </>
    );
}

export default UserManagement;