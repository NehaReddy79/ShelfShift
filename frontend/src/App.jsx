import { Route, Routes, BrowserRouter, NavLink, useNavigate } from "react-router-dom"
import Convert from "./pages/Convert"
import History from "./pages/History"
import Login from "./pages/Login"
import SignUp from "./pages/SignUp"
import './components/Navbar.css'



function App() {


  return (
    <>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </>
  )
}

function AppContent() {
  const navigate = useNavigate()
  const isLoggedIn = !!localStorage.getItem("token")

  function handleLogout() {
    localStorage.removeItem("token")
    navigate("/login")
  }

  return (
    <>
      <nav className="navbar">
        <NavLink to="/" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
          Convert
        </NavLink>

        {isLoggedIn ? (
          <>
            <NavLink to="/history" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
              History
            </NavLink>

            <button onClick={handleLogout} className="nav-link nav-logout-btn">
              Logout
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
              Login
            </NavLink>


            <NavLink to="/signup" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
              Signup
            </NavLink>
          </>
        )}

      </nav>

      <Routes>
        <Route path="/" element={<Convert />}></Route>
        <Route path="/history" element={<History />}></Route>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
      </Routes>
    </>
  )
}

export default App
