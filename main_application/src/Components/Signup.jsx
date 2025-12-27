import {useNavigate, Link} from "react-router-dom"
import {useState} from "react"
import {useAuth} from "../AuthContext"

export default function Signup(){
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

    const {refreshMe} = useAuth();
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [first_name, setFirstName] = useState("");
    const [last_name, setLastName] = useState("");


    const handleSubmit = async(e) => {
        e.preventDefault();

        const res = await fetch(API_BASE_URL + "/signup", {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({first_name, last_name, username, email, password})
        });

        if(res.ok){
            await refreshMe();
            navigate("/userProfile");
        }
        else{
            console.error(await res.text())
        }
    }

    return(
        <div className="signup-container">
            <form className = "signup-form" onSubmit={handleSubmit}>
                <h3 className="form-title">Sign Up</h3>

                <div className="form-row form-group first-last">
                    <div>
                        <label htmlFor="first-name" className="form-label">
                            First Name
                        </label>
                        <input
                            type="text"
                            id="first-name"
                            className="form-control"
                            placeholder="Firstname"
                            required
                            value={first_name}
                            onChange={(e) => setFirstName(e.target.value)}
                        />
                    </div>

                    <div>
                        <label htmlFor="last-name" className="form-label">
                            Last Name
                        </label>
                        <input
                            type="text"
                            id="last-name"
                            className="form-control"
                            placeholder="Lastname"
                            value={last_name}
                            onChange={(e) => setLastName(e.target.value)}
                        />
                    </div>
                </div>

                <div className="form-row form-group">
                    <label htmlFor="username" className="form-label">
                        Username
                    </label>
                    <input 
                        type="text" 
                        id="fullname" 
                        className="form-control" 
                        placeholder="Enter your username" 
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>

                <div className="form-row form-group">
                    <label htmlFor="email">Email</label>
                    <input 
                        type="email" 
                        placeholder="Email" 
                        className="form-control" 
                        id="email" 
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                <div className="form-row form-group">
                    <label htmlFor="password" className="password">Password</label>
                    <input 
                        type="password" 
                        placeholder="Password" 
                        className="form-control" 
                        id="password" 
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                <button type="submit" className="btn submit">Sign Up</button>
                <small>Already have an account? Log in <Link to="/user/login" >here</Link></small>
            </form>
        </div>
    );
};