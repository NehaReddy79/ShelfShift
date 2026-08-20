import { useState } from "react";
import api from "../api";
import { useNavigate , Link } from "react-router-dom";
import "./Login.css"

export default function Login(){

    const navigate = useNavigate()
    const [email, setEmail] = useState("")
    const [password , setPassword] = useState("")
    const [error , setError] = useState(null)

    async function handleSubmit(e){
        e.preventDefault()

        try{

            const response = await api.post("/login" , {email,password})
            localStorage.setItem("token" ,  response.data.access_token)
            navigate("/")

        }catch(err){
            setError(err.response?.data?.detail || "Login failed")
        }


    }

    return(
        <>
            <div className="auth-container">
                <div className="auth-card">
                    <h2>Welcome Back</h2>
                    <p className="auth-subtitle">Log in to view your conversions.</p>


                    <form onSubmit={handleSubmit}>
                        <input type="email" placeholder="E-mail" className="auth-input" value={email} onChange={(e) => { setEmail(e.target.value) }}></input>
                        <input type="password" placeholder="Password" className="auth-input" value={password} onChange={(e) => { setPassword(e.target.value) }}></input>
                        <button type="submit" className="auth-submit-btn">Submit</button>
                    </form>

                    {error && <p className="error-text"> {error} </p>}

                    <p className="auth-switch">
                        Don't have an account? <Link to="/signup"> Sign Up</Link>
                    </p>
                </div>
            </div>
        </>
    )
}