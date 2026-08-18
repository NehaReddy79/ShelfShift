import { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

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
            navigate("/history")

        }catch(err){
            setError(err.response?.data?.detail || "Login failed")
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