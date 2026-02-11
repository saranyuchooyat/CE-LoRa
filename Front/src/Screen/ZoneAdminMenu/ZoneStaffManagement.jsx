import { useState, useEffect, useMemo } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useQueries } from "@tanstack/react-query";
import api from "../../components/API";
import MenuNameCard from "../../components/MainCardOption/MenuNameCard";
import CardFilter from "../../components/Card/CardFilter";
import CardFull from "../../components/Card/Cardno5";
import Modal from "../../components/ModalForm/Modal";

const initialFilters = {
    search: '', 
    zonestaff: 'ทั้งหมด', 
    status: 'ทั้งหมด'
};

function ZoneStaffManagement() {
    // 1. ดึงค่าพารามิเตอร์จาก URL ให้ถูกต้อง
    const userid = 2; 
    const location = useLocation();

    const [filters, setFilters] = useState(initialFilters);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const handleOpenModal = () => setIsModalOpen(true);
    const handleCloseModal = () => setIsModalOpen(false);

    // 2. ดึงข้อมูลจาก API โดยใช้ค่าที่ดึงมา
    const userQueries = useQueries({
        queries: [
            { 
                queryKey: ['zoneStaff', userid], 
                queryFn: () => api.get(`/zones/${userid}/staff`).then(res => res.data),
                enabled: !!userid // ทำงานเมื่อมี userid เท่านั้น
            },
            { 
                queryKey: ['myzones'], 
                queryFn: () => api.get('/zones/my-zones').then(res => res.data) 
            },
        ],
    });

    const isSystemLoading = userQueries.some(query => query.isLoading);
    const isSystemError = userQueries.some(query => query.isError);

    // 3. จัดการเรื่อง Token
    useEffect(() => {
        const tokenInStorage = localStorage.getItem('token');
        if (location.state?.token && location.state.token !== tokenInStorage) {
            localStorage.setItem('token', location.state.token);
        }
    }, [location.state]);

    // 4. เตรียมข้อมูล Data
    const zoneStaffData = userQueries[0].data || [];
    const myZones = userQueries[1].data || [];

    // 5. ดึงค่า zoneid ออกมาโดยใช้ useMemo เพื่อป้องกัน Infinite Loop
    const myZoneIDs = useMemo(() => {
        return myZones.map(zone => zone.zonename);
    }, [myZones]);

    // 6. ระบบ Filter ข้อมูล
    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleClearFilters = () => setFilters(initialFilters);

    const filteredUsers = useMemo(() => {
        const { search, zonestaff, status } = filters;
        let data = zoneStaffData;

        if (search) {
            const lowerSearch = search.toLowerCase();
            data = data.filter(user => 
                (user.name && user.name.toLowerCase().includes(lowerSearch)) ||
                (user.email && user.email.toLowerCase().includes(lowerSearch)) ||
                (user.phone && String(user.phone).includes(lowerSearch))
            );
        }

        if (zonestaff && zonestaff !== 'ทั้งหมด') {
            data = data.filter(user => user.zone === zonestaff);
        }

        if (status && status !== 'ทั้งหมด') {
            data = data.filter(user => user.status === status);
        }
        return data;
    }, [zoneStaffData, filters]);

    if (isSystemLoading) return <div className="mx-5 mt-10 text-center text-xl">Loading...</div>;
    if (isSystemError) return <div className="mx-5 mt-10 text-center text-xl text-red-600">Error fetching data!</div>;

    return (
        <div className="mx-5">
            {/* ปรับปรุง MenuNameCard ให้แสดงทั้ง Banner และปุ่ม */}
            <MenuNameCard
                title="จัดการ Zone Staff"
                description={null}
                onButtonClick={handleOpenModal}
                detail={false}
                buttonText=" Zone Staff "
            />

            <CardFilter
                name="ผู้ใช้งาน"
                placeholderName=" ชื่อ, อีเมล, หรือเบอร์โทรศัพท์"
                option1Name="สถานะ"
                option2Name="พื้นที่ดูแล"
                filters={filters}
                onFilterChange={handleFilterChange}
                onClear={handleClearFilters}
                data={myZoneIDs}
                option2Key="zonestaff"
            />

            {/* แสดงตารางข้อมูล */}
            <CardFull 
                data={filteredUsers} 
                onEdit={(user) => console.log("Edit User:", user)}
            />

            <Modal title="เพิ่มผู้ใช้งานใหม่" isOpen={isModalOpen} onClose={handleCloseModal}>
                {/* ใส่ฟอร์มเพิ่มเจ้าหน้าที่ตรงนี้ */}
            </Modal>
        </div>
    );
}

export default ZoneStaffManagement;