import {useEffect, useState} from 'react';
import {useNavigate, Link, NavLink } from "react-router-dom";
import {useAuth} from "../AuthContext"

export default function Navbar() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
  const navigate = useNavigate();
  const {me, loading, logout} = useAuth();
  const [keyword, setKeyword] = useState("");
  
  if(loading) return null;
  const loggedIn = !!me;

  const handleSubmit = async(e) => {
    e.preventDefault();
    
    try {
      if(keyword === undefined || keyword.length == 0){
        return;
      }
      const response = await fetch(
        `${API_BASE_URL}/searchResults?keyword=${keyword}`
      );

      const data = await response.json();
      
      setKeyword("")
      navigate(`/searchResults?keyword=${keyword}`, {
        state: {results: data}
      });

    } catch (err){
      console.error("Error fetching search results:", err);
    }
  }

  const handleInput = (e) => {
    setKeyword(e.target.value);
  }

  const handleLogout = async(e) => {
    await logout();
    navigate('/')
  }

  return(
    <div className="navbar navbar-top">
      <nav className="navbar w-100">
        <div className="container-fluid">
          
          <NavLink to={`/`} className="navbar-brand">
            CogSci Forum
          </NavLink>

          <form onSubmit={handleSubmit} className="d-flex search_keywords" role="search">
            <input
              className="form-control me-2"
              type="search"
              placeholder="Search by keywords..."
              aria-label="Search"
              value = {keyword}
              onChange={handleInput}
            />
            <button
            type="submit" 
            className="btn btn-primary search-btn"
            >
              Search
            </button>
          </form>
          <div className="navbar">
            {loggedIn ? (
              <>
                <button className="btn log-in" onClick={handleLogout}>Log out</button>
                <Link to="/addDiscussion" type="button" className = "btn new-discussion">New Discussion</Link>
              </>
            ) : (
              <>
                <Link to="/user/login" type="button" className="btn log-in">Log in</Link>
                <Link to="/user/signup" type="button" className = "btn sign-up">Sign up</Link>
              </>
            )}
          </div>
          
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="offcanvas"
            data-bs-target="#offcanvasNavbar"
            aria-controls="offcanvasNavbar"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div
            className="offcanvas offcanvas-end"
            tabIndex="-1"
            id="offcanvasNavbar"
            aria-labelledby="offcanvasNavbarLabel"
          >
            <div className="offcanvas-header">
              <h5 className="offcanvas-title" id="offcanvasNavbarLabel">
                Menu
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="offcanvas"
                aria-label="Close"
              ></button>
            </div>
            <div className="offcanvas-body">
              <ul className="navbar-nav justify-content-end flex-grow-1 pe-3">
                <li className="nav-item">
                  <NavLink to={`/`} 
                  className={({isActive})=> `nav-link ${isActive? "active" : ""}`
                  }>
                    Home
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to={`/explore`} 
                  className={({isActive})=> `nav-link ${isActive? "active" : ""}`
                  }>
                    Explore Page
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to={`/popular-recent`} 
                  className={({isActive})=> `nav-link ${isActive? "active" : ""}`
                  }>
                    Popular/ Recent Discussions
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to={`/userProfile`} 
                  className={({isActive})=> `nav-link ${isActive? "active" : ""}`
                  }>
                    User Profile
                  </NavLink>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </nav>
    </div>
  )
}
