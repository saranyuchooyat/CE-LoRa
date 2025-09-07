function CardNotification(){
    return(
        <>
            <div className="flex flex-col gap-3">
                <button className="card-noti color-alert">
                    <p className="font-bold">! Critical: Analytics Server Memory Usage</p>
                    <p>Memory usage has reached 94% (30.1GB/32GB). Immediate action required to prevent system instability.</p>
                    <p className="text-gray-500">time</p>
                </button>

                <button className="card-noti color-warn">
                    <p className="font-bold">! Critical: Analytics Server Memory Usage</p>
                    <p>Memory usage has reached 94% (30.1GB/32GB). Immediate action required to prevent system instability.</p>
                    <p className="text-gray-500">time</p>
                </button>

                <button className="card-noti color-complete">
                    <p className="font-bold">! Critical: Analytics Server Memory Usage</p>
                    <p>Memory usage has reached 94% (30.1GB/32GB). Immediate action required to prevent system instability.</p>
                    <p className="text-gray-500">time</p>
                </button>

                <button className="card-noti color-alert">
                    <p className="font-bold">! Critical: Analytics Server Memory Usage</p>
                    <p>Memory usage has reached 94% (30.1GB/32GB). Immediate action required to prevent system instability.</p>
                    <p className="text-gray-500">time</p>
                </button>

                <button className="card-noti color-alert">
                    <p className="font-bold">! Critical: Analytics Server Memory Usage</p>
                    <p>Memory usage has reached 94% (30.1GB/32GB). Immediate action required to prevent system instability.</p>
                    <p className="text-gray-500">time</p>
                </button>

            </div>
        </>
    )
}

export default CardNotification;