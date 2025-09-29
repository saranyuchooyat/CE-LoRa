function Addbutton({buttonText, onButtonClick}){
    console.log(buttonText)
    return(
    
            <button className="add-btn" onClick={onButtonClick}> {buttonText}</button>
    )
}

export default Addbutton;