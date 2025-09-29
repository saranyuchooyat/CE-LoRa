import DeviceCard from "./DeviceCard";
import ZoneStaffCard from "./ZoneStaffCard";


function CardLayouts({ data }) {

    const gridCheck = () =>{
        if(data == 'device'){
            return `grid-cols-3`
        }
        else if(data == 'staff'){
            return `grid-cols-2`
        }
    };

    const componentCheck = () =>{

        if(data == 'device'){
            return <DeviceCard/>
        }
        else if(data == 'staff'){
            return <ZoneStaffCard/>
        }

    };

    return(
        <>
            <div className={`grid ${gridCheck()} justify-center text-center gap-4`}>
                {componentCheck()}
            </div>
        </>
    );
}

export default CardLayouts;