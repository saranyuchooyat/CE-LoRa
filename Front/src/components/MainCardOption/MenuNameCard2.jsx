function MenuNameCard2({title, description}){
    
    return(
        <>
            <div className="card flex gap-4">
                <p className="text-[30px] font-bold text-start">{title}</p>
                <p className="text-[16px] text-start self-center">{description}</p>
            </div>
        </>
    )
}

export default MenuNameCard2;