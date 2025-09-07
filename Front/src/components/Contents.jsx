import Cardno2 from "./Cardno2";
import Cardno3 from "./Cardno3";
import CardFilter from "./CardFilter";
import CardnStatus from "./CardStatus";
import Cardno4 from "./Cardno4";
import Cardno5 from "./Cardno5";
import Cardno6 from "./Cardno6";

function Contents(){
    return(
        <>
            <div className="mx-5">
                <CardnStatus/>
                <CardFilter/>
                <Cardno2/>
                <Cardno3/>
                <Cardno4/>
                <Cardno5/>
                <Cardno6/>
            </div>
        </>
    )
}

export default Contents;