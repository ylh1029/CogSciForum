import {useNavigate, Link} from "react-router-dom"
import {useState} from "react"
import {useAuth} from "../AuthContext"

export default function Login(){
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
    const {refreshMe} = useAuth();
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    
    const handleSubmit = async(e) => {
        e.preventDefault();

        await fetch(API_BASE_URL + "/login", {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({username, password})
        });
        await refreshMe();
        navigate("/userProfile")
    }

    return(
        <div className="login-container">
            <form className = "login-form" onSubmit={handleSubmit}>
                <h3 className="form-title">Log In</h3>
                <div className="form-row form-group">
                    <label htmlFor="username" className="form-label">
                        Username
                    </label>
                    <input 
                        type="text" 
                        id="fullname" 
                        className="form-control" 
                        placeholder="Enter your username" 
                        value={username} 
                        required
                        onChange={(e) => setUsername(e.target.value)}
                        />
                </div>

                <div className="form-row form-group">
                    <label htmlFor="password">Password</label>
                    <input 
                        type="password" 
                        placeholder="Password" 
                        className="form-control" 
                        id="password" 
                        value={password} 
                        required
                        onChange={(e) => setPassword(e.target.value)}
                        />
                </div>

                <button type="submit" className="btn submit">Log in</button>
                <small>Don't have account? Sign up <Link to="/user/signup">here</Link></small>
            </form>
        </div>
    );
};