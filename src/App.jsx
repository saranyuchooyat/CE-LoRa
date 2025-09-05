import Header from "./components/Header";
import Menu from "./components/Menu";
import Contents from "./components/Contents";

function App() {
  return(
    <>
      <div className="flex flex-col h-screen">
        <Header/>
        <Menu/>
        <div className="mt-4 flex-1 overflow-y-scroll">
          <Contents/>
        </div>
      </div>
      
    </>
  );
}

export default App;
