import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import api from "../../components/API";
import DataTableCard from "../../components/Card/DataTableCard";
import ElderlyProfileView from "../../components/Card/ElderlyProfileView";
import MenuNameCard2 from "../../components/MainCardOption/MenuNameCard2";

function CareGiver() {
    const location = useLocation();
    
    const [userData, setUserData] = useState(null);
    const [assignedEldersData, setAssignedEldersData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [viewingProfile, setViewingProfile] = useState(null);

    useEffect(() => {
        const fetchCareGiverData = async () => {
            setIsLoading(true);
            try {
                const storedUser = sessionStorage.getItem("user");
                if (!storedUser) return;
                
                const userObj = JSON.parse(storedUser);

                // ดึงข้อมูล User ล่าสุดจาก Backend ป้องกันการอัปเดตจาก Admin ที่ยังไม่ sync
                const userRes = await api.get(`/users/${userObj.user_id || userObj.id}`);
                const latestUser = userRes.data;
                setUserData(latestUser);

                if (latestUser.assigned_elders && latestUser.assigned_elders.length > 0) {
                    // ดึง Elderly ทั้งหมด และกรองเฉพาะที่ Caregiver คนนี้ดูแล
                    const eldersRes = await api.get("/elders");
                    const allElders = eldersRes.data;
                    
                    const myElders = allElders.filter(e => latestUser.assigned_elders.includes(e.elder_id));
                    setAssignedEldersData(myElders);
                } else {
                    setAssignedEldersData([]);
                }
            } catch (error) {
                console.error("Failed to fetch caregiver data", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCareGiverData();
    }, []);

    if (isLoading) {
        return <div className="mx-5 mt-10 text-center text-xl">Loading Caregiver Dashboard...</div>;
    }

    if (!userData?.is_caregiver) {
        return <div className="mx-5 mt-10 text-center text-xl text-red-500">Access Denied: You are not a Caregiver.</div>;
    }

    // กรณีมีคนไข้ 1 คน จะแสดงหน้า Profile ทันที
    // ตรวจสอบว่าไม่ได้กดกลับหรือยกเลิกการดู profile
    if (assignedEldersData.length === 1 && !viewingProfile) {
        // สร้าง onBack ที่ไม่มีการทำอะไร (หรือปิดปุ่มกลับในอนาคต)
        return <ElderlyProfileView elderData={assignedEldersData[0]} onBack={null} />;
    }

    if (viewingProfile) {
        return (
            <ElderlyProfileView 
                elderData={viewingProfile} 
                onBack={() => setViewingProfile(null)} 
            />
        );
    }

    return (
        <div className="mx-5 mt-5">
            <MenuNameCard2 
                title={assignedEldersData.length}
                description="จำนวนผู้สูงอายุที่อยู่ในความดูแล"
                onButtonClick={null}
                buttonText=""
            />
            
            <div className="mt-4">
                {assignedEldersData.length > 0 ? (
                    <DataTableCard 
                        data={assignedEldersData}
                        showActions={false}
                        onRowClick={setViewingProfile}
                    />
                ) : (
                    <div className="mt-8 text-center text-gray-500 bg-white p-10 rounded-lg shadow-sm">
                        <p className="text-lg">ยังไม่มีผู้สูงอายุในความดูแลของคุณ</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default CareGiver;
