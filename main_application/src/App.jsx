import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.min.css'
import {HashRouter, Routes, Route} from "react-router-dom";

import './App.css'
import Navbar from './Components/Navbar'
import Home from './Components/Home'
import Footer from './Components/Footer'
import Explore from './Components/Explore'
import PopularRecent from './Components/PopularRecent'
import UserProfile from './Components/UserProfile'
import SearchResults from './Components/SearchResults'
import DisplayDiscussion from './Components/DisplayDiscussion'
import Signup from './Components/Signup'
import Login from './Components/Login';
import AddDiscussion from "./Components/AddDiscussion"
import AddDiscussion_Research from './Components/AddDiscussion_Research';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

function App() {
  return (
    <>
      <HashRouter>
        <Navbar/>
        <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="/explore" element={<Explore/>}/>
          <Route path="/popular-recent" element={<PopularRecent/>}/>
          <Route path="/userProfile" element={<UserProfile/>}/>
          <Route path="/searchResults" element={<SearchResults/>}/>
          <Route path="/discussion/:id" element={<DisplayDiscussion/>}/>
          <Route path="/user/signup" element={<Signup/>}/>
          <Route path="/user/login" element={<Login/>}/>
          <Route path="addDiscussion" element={<AddDiscussion/>}/>
          <Route path="/addDiscussion/Research" element={<AddDiscussion_Research/>}/>
        </Routes>

      </HashRouter>
      <Footer/>
    </>
  )
}

export default App
