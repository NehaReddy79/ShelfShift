import {Route , Routes , BrowserRouter , Link} from "react-router-dom"
import Convert from "./pages/Convert"
import History from "./pages/History"



function App() {
  return(
    <>
      <BrowserRouter>
        <nav>
          <Link to="/">Convert</Link>
          <Link to="/history">History</Link>
        </nav>

        <Routes>
          <Route path="/" element={<Convert />}></Route>
          <Route path="/history" element={<History />}></Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
