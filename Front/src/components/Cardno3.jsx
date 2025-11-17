import Highcharts from 'highcharts'; // 1. Import Highcharts ตัวหลัก
import HighchartsReact from 'highcharts-react-official'; // 2. Import Wrapper

function Cardno3({data}){

    

    const topzonesArray = data?.topzones || [];
    console.log("topzone",topzonesArray)


    const topZoneData = topzonesArray.map(item => ({
        name: item.zonename, 
        y: item.activeuser
    }));

    const options = {
        chart:{
            type: 'pie',
        },
        title:{
            text:''
        },
        credits:{
            enabled:false
        },
        plotOption:{
            pie:{
                dataLabels:{
                    enabled: true,
                    format: '{point.name}: {point.y}'
                },
                zone:[{
                    value: 50,
                    color: '#f7a35c' // Color for values up to 50
                    }, 
                    {
                    value: 100,
                    color: '#7cb5ec' // Color for values between 51 and 100
                    }, 
                    {
                    color: '#90ed7d' // Color for values above 100
                }]
            }
        },
        series: [
        {
            name: 'Data',
            data: topZoneData
        }
    ]
    };

    return(
        <>
            <div className="flex justify-between h-fit text-center mb-4 gap-4">

                <div className="card flex flex-col justify-start items-center">
                    <p className="mt-3 font-bold text-[18px]">แนวโน้มการใช้งานระบบ (30 วันที่ผ่านมา)</p>
                    <div className="mt-1 bg-gray-300 w-[600px] h-[300px] rounded-[10px]"></div>
                </div>

                <div className="card flex flex-col justify-start items-center h-fit">
                    <p className="mt-3 font-bold text-[18px]">สถิติ Zone ที่ใช้งานมากสุด</p>
                    <div className="rounded-[10px]">
                        <HighchartsReact highcharts={Highcharts} options={options}/>
                    </div>
                </div>

            </div>
        </>
    )
}

export default Cardno3;