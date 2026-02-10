import { useState, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useQueries } from "@tanstack/react-query";
import api from '../../components/API';
import MenuNameCard from "../../components/MainCardOption/MenuNameCard";
import MenuNameCard2 from '../../components/MainCardOption/MenuNameCard2';
import Cardno8 from '../../components/Card/Cardno8';
import Cardno9 from '../../components/Card/Cardno9';
import Cardno5 from '../../components/Card/Cardno5';
import Modal from '../../components/ModalForm/Modal';
import AddElderlyform from '../../components/ModalForm/AddElderly';


function ZoneDashboardDetail (){

    const { zoneid } = useParams();
    const location = useLocation();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const handleOpenModal = () => setIsModalOpen(true);
    const handleCloseModal = () => setIsModalOpen(false);
    


    //ดึงข้อมูลหลังบ้าน
    const zoneDashboardQueries = useQueries({
        queries: [
            { queryKey: ['zoneDashboard'], queryFn: () => api.get(`/zones/${zoneid}/dashboard`).then(res => res.data) },
        ],
    });

    const isDashboardLoading = zoneDashboardQueries.some(query => query.isLoading);
    const isDashboardError = zoneDashboardQueries.some(query => query.isError);

    const zoneDashboard = zoneDashboardQueries[0].data || [];

    console.log("ZoneDashboardData",zoneDashboard)


    useEffect(() => {
        const tokenInStorage = localStorage.getItem('token');
        if (location.state?.token && location.state.token !== tokenInStorage) {
             localStorage.setItem('token', location.state.token);
             // 💡 เมื่อบันทึก Token ใหม่แล้ว React Query จะทำการ Refetch ให้อัตโนมัติ
             // เนื่องจากทุก Query จะถูก Trigger เมื่อ Token ถูกบันทึกและ Component Rerender
        }
    }, [location.state]);
    //ดึงข้อมูลหลังบ้าน

    console.log("ZoneData",zoneDashboard)

    if (isDashboardLoading || !zoneid) { // ตรวจสอบ isLoading และ zoneid
        return <div className="mx-5 mt-10 text-center text-xl">Loading Zone Dashboard...</div>;
    }
    
    if (isDashboardError) {
        return <div className="mx-5 mt-10 text-center text-xl text-red-600">Error fetching data: {error.message}</div>;
    }

    if (!zoneDashboard || Object.keys(zoneDashboard).length === 0) {
        return <div className="mx-5 mt-10 text-center text-xl text-red-600">Zone ID "{zoneid}" not found.</div>;
    }



    // 💡 สมมติ Key ที่จำเป็นสำหรับ MenuNameCard
    const { alerts, deviceStatus, elders, zone } = zoneDashboard;

    const allAlertDetail = alerts;
    // console.log("alert",allAlertDetail)


    const allDeviceStatus = deviceStatus;


    const allEldery = elders
    console.log("Elder",allEldery)


    const zoneDetail = zone;

    const calculateAverages = (eldersList) => {
        if (!eldersList || eldersList.length === 0) return { avgSpO2: 0, avgHR: 0, avgTemp: 0 };

        const totals = eldersList.reduce((acc, elder) => {
            return {
                spo2: acc.spo2 + (elder.vitals?.spo2 || 0),
                hr: acc.hr + (elder.vitals?.heart_rate || 0),
                temp: acc.temp + (elder.vitals?.temperature || 0)
            };
        }, { spo2: 0, hr: 0, temp: 0 });

        return {
            avgSpO2: (totals.spo2 / eldersList.length).toFixed(1),
            avgHR: (totals.hr / eldersList.length).toFixed(1),
            avgTemp: (totals.temp / eldersList.length).toFixed(1)
        };
    };

    const healthAverages = calculateAverages(allEldery);

    const mockGraphData = [
        { date: "2026-02-03", activeUsers: 98, avgHR: 80, avgSpO2: 96, avgTemp: 36.5 },
        { date: "2026-02-04", activeUsers: 105, avgHR: 85, avgSpO2: 97, avgTemp: 36.7 },
        { date: "2026-02-05", activeUsers: 95, avgHR: 82, avgSpO2: 96, avgTemp: 36.4 },
        { date: "2026-02-06", activeUsers: 110, avgHR: 88, avgSpO2: 95, avgTemp: 36.6 },
        { date: "2026-02-07", activeUsers: 120, avgHR: 90, avgSpO2: 96, avgTemp: 36.8 },
        { date: "2026-02-08", activeUsers: 115, avgHR: 95, avgSpO2: 94, avgTemp: 36.3 },
        // วันที่ 7 คือวันปัจจุบันที่ใช้ค่าจริงจากที่คุณส่งมา
        { 
            date: "2026-02-09", 
            activeUsers: 125, 
            avgHR: parseFloat(healthAverages.avgHR), 
            avgSpO2: parseFloat(healthAverages.avgSpO2),
            avgTemp: parseFloat(healthAverages.avgTemp)
        }
    ];

    // console.log("Health Averages:", healthAverages);


    return(
        <>
            <div className="mx-5">
                <MenuNameCard
                    title={zoneDetail?.name || "Zone Detail"}
                    description={"Zone Admin Dashboard"}
                    onButtonClick={false}
                    detail="2/2"
                    buttonText="จำนวนผู้ดูแล"
                />

                <MenuNameCard2
                    title={allEldery.length}
                    description="จำนวนผู้สูงอายุทั้งหมด"
                    onButtonClick={handleOpenModal}
                    buttonText="เพิ่มผู้สูงอายุ"
                />
                
                <Cardno5 data={allAlertDetail}/>
                <Cardno8 healthdata={mockGraphData} devicedata={allDeviceStatus}/>
                <Cardno9 data=""/>
            </div>

            <Modal
                title="เพิ่มข้อมูลผู้สูงอายุ"
                isOpen={isModalOpen}
                onClose={handleCloseModal}
            >
                <AddElderlyform
                    onClose={()=>{
                        handleCloseModal();
                        window.location.reload(); // รีโหลดหน้าเพื่อแสดงข้อมูลใหม่หลังจากเพิ่มผู้สูงอายุ
                    }}
                />
            </Modal>
        </>
    );
}

export default ZoneDashboardDetail;