import DeviceCard from "./DeviceCard";


function CardLayouts() {
    return(
        <>
            <div className="grid grid-cols-3 justify-center text-center gap-4">
                <DeviceCard/>
            </div>
        </>
    );
}

export default CardLayouts;