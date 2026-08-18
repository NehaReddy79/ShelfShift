import { useState  } from "react";
import api from "../api";
import {useNavigate} from "react-router-dom"

export default function SignUp(){

    const navigate = useNavigate()
    const [email , setEmail] = useState("")
    const [password , setPassword] = useState("")
    const [error , setError] = useState(null)

    async function handleSubmit(e){
        e.preventDefault()
        try{
            const response = await api.post("/signup" , {email , password})
            alert("User created successfully!")
            navigate("/login")
        }catch(err){
            setError(err.response?.data?.detail ||"Signup failed")
        }
    }

    return(
        <>
            <form onSubmit={handleSubmit}>
                <input type="email" placeholder="E-mail" value={email} onChange={(e) => {setEmail(e.target.value)}}></input>
                <input type="password" placeholder="Password" value={password} onChange={(e) => {setPassword(e.target.value)}}></input>
                <button type="submit">Submit</button>
            </form>
            {error && <p className="error-text">{error}</p>}
        </>
    )
}