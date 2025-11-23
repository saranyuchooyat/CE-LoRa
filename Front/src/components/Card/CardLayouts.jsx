import DeviceCard from "./DeviceCard";
import ZoneStaffCard from "./ZoneStaffCard";


function CardLayouts({ name, data }) {

    const gridCheck = () =>{
        if(name == 'device'){
            return `grid-cols-3`
        }
        else if(name == 'staff'){
            return `grid-cols-2`
        }
    };

    const componentCheck = () =>{

        if(name == 'device'){
            return <DeviceCard data={data}/>
        }
        else if(name == 'staff'){
            return <ZoneStaffCard data={data}/>
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