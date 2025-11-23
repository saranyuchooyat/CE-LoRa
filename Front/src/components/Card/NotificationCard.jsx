function CardNotification({ data }){

    const typeCheck = (type) =>{
        console.log("type",type)
        switch (type) {
            case 'info':
                return 'color-complete';
            case 'warning':
                return 'color-warn';
            case 'critical':
                return 'color-alert';
            default:
                return 'text-gray-700 bg-gray-200';
        }
    };

    return(
        <>
            <div className="flex flex-col gap-3">
                {/* <button className="card-noti color-alert">
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
                </button> */}

                {data.map((card, index) => {

                    const typeClass = typeCheck(card.type);

                    return(
                    <button key={index} className={`card-noti ${typeClass}`}>
                        <p className="font-bold">{card.title}</p>
                        <p>{card.description}</p>
                        <p className="text-gray-500">{card.createdAt}</p>
                    </button>);
                })} 

            </div>
        </>
    )
}

export default CardNotification;