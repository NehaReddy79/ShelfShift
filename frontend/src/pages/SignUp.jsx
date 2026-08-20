import { useState } from "react";
import api from "../api";
import { useNavigate , Link} from "react-router-dom"
import "./Login.css"

export default function SignUp() {

    const navigate = useNavigate()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState(null)

    async function handleSubmit(e) {
        e.preventDefault()
        try {
            const response = await api.post("/signup", { email, password })
            alert("User created successfully!")
            navigate("/login")
        } catch (err) {
            setError(err.response?.data?.detail || "Signup failed")
        }
    }

    return (
        <>
            <div className="auth-container">
                <div className="auth-card">
                    <h2>Create Account</h2>
                    <p className="auth-subtitle">Sign up to track your conversions.</p>


                    <form onSubmit={handleSubmit}>
                        <input type="email" placeholder="E-mail" className="auth-input" value={email} onChange={(e) => { setEmail(e.target.value) }}></input>
                        <input type="password" placeholder="Password" className="auth-input" value={password} onChange={(e) => { setPassword(e.target.value) }}></input>
                        <button type="submit" className="auth-submit-btn">Submit</button>
                    </form>

                    {error && <p className="error-text"> {error} </p>}

                    <p className="auth-switch">
                        Already have an account? <Link to="/login"> Login</Link>
                    </p>
                </div>
            </div>
        </>
    )
}