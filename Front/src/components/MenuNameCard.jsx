function MenuNameCard({title, description, buttonText}){
    return(
        <>
            <div className="card flex justify-between items-center">
                <div className="ml-3">
                    <p className="text-[22px] font-bold text-start">{title}</p>
                    <p>{description}</p>
                </div>
                <button className="add-btn">{buttonText}</button>
            </div>
        </>
    )
}

export default MenuNameCard;