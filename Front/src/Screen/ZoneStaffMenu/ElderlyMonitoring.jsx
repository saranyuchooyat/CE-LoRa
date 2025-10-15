import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useQueries } from "@tanstack/react-query";
import api from "../../components/API";


function ElderlyMonitoring(){

    const location = useLocation();

    const systemQueries = useQueries({
        queries: [
            { queryKey: ['staff'], queryFn: () => api.get('/zones/my-zones').then(res => res.data) },
        ],
    });

    const isSystemLoading = systemQueries.some(query => query.isLoading);
    const isSystemError = systemQueries.some(query => query.isError);

    const zoneData = systemQueries[0].data || [];


    useEffect(() => {
        const tokenInStorage = localStorage.getItem('token');
        if (location.state?.token && location.state.token !== tokenInStorage) {
             localStorage.setItem('token', location.state.token);
             // 💡 เมื่อบันทึก Token ใหม่แล้ว React Query จะทำการ Refetch ให้อัตโนมัติ
             // เนื่องจากทุก Query จะถูก Trigger เมื่อ Token ถูกบันทึกและ Component Rerender
        }
    }, [location.state]);
    //ดึงข้อมูลหลังบ้าน
    
    if (isSystemLoading) {
        return <div className="mx-5 mt-10 text-center text-xl">Loading Dashboard...</div>;
    }
    
    if (isSystemError) {
        return <div className="mx-5 mt-10 text-center text-xl text-red-600">Error fetching data!</div>;
    }

    console.log("data:",zoneData)

    return(
        <>
            <div className="mx-5">

                <h1>ElderlyMonitoring</h1>

            </div>
        </>
    );

}

export default ElderlyMonitoring;