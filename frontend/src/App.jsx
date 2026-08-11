import {Route , Routes , BrowserRouter , NavLink} from "react-router-dom"
import Convert from "./pages/Convert"
import History from "./pages/History"
import './components/Navbar.css'



function App() {
  return(
    <>
      <BrowserRouter>
        <nav className="navbar">
          <NavLink to="/" className={({ isActive }) => isActive? "nav-link active" : "nav-link"}>
            Convert
          </NavLink>
          
          <NavLink to="/history" className={({ isActive }) => isActive? "nav-link active" : "nav-link"}>
            History
          </NavLink>
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
