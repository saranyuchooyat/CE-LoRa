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