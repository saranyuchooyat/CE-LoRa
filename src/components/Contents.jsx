import Cardno2 from "./Cardno2";
import Cardno3 from "./Cardno3";
import CardFilter from "./CardFilter";
import CardnStatus from "./CardStatus";
import Cardno4 from "./Cardno4";

function Contents(){
    return(
        <>
            <div className="mt-3 mx-5">
                <CardnStatus/>
                <CardFilter/>
                <Cardno2/>
                <Cardno3/>
                <Cardno4/>
            </div>
        </>
    )
}

export default Contents;