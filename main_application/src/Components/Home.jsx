import Card from './Card'
import Header from './Header'

export default function Home(){
    return(
        <div className = "home">
            <meta name="description" content="Home page: A page for students and researchers to discuss 
                        cognitive science-related academic papers and topics"/>
            <Header/>
            <div className="home-cards">
                <Card
                    atag = "popular-recent"
                    src = "img/discussion_header.jpeg"
                    alt = "Cover image for discussion card"
                    body = "Popular/ Recent"
                />
                
                <Card
                    atag = "explore"
                    src = "img/researchPaper_header.jpeg"
                    alt = "Cover image for research paper card"
                    body = "Explore"
                />
                <Card
                    atag = "userProfile"
                    src = "img/userProfile_header.jpeg"
                    alt = "Cover image for user profile card"
                    body = "User Profile"
                />
            </div>
        </div>
    );
}