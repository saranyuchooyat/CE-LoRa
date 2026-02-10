import UserTrendGraph from '../UserTrendGraph';
import TopZonePieChart from '../TopZonePieChart';

function CardTwoGraph({graphdata,piedata}){

    const usagetrendArray = graphdata?.trend || [];
    const topzonesArray = piedata?.topzones || [];

    return(
        <>
            <div className="flex justify-between h-fit text-center mb-4 gap-4">

                <div className="card flex flex-col justify-start items-center">
                    <p className="my-3 font-bold text-[18px]">แนวโน้มการใช้งานระบบ (30 วันที่ผ่านมา)</p>
                    <div className="rounded-[10px]">
                        <UserTrendGraph graphdata={usagetrendArray}/>
                    </div>
                </div>

                <div className="card flex flex-col justify-start items-center h-fit">
                    <p className="my-3 font-bold text-[18px]">สถิติ Zone ที่ใช้งานมากสุด</p>
                    <div className="rounded-[10px]">
                        <TopZonePieChart piedata={topzonesArray}/>
                    </div>
                </div>

            </div>
        </>
    )
}

export default CardTwoGraph;