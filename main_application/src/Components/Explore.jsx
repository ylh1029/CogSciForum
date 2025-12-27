import Swiper from "./ArticleSwiper";
import {useState, useEffect} from "react"

export default function Explore(){
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

    const [selectedTopic, setSelectedTopic] = useState("");
    const [discussions, setDiscussions] = useState([]);
    const [featured, setFeatured] = useState([]);
    const [tagList, setTagList] = useState([]);

    const filter = (e) => {
        e.preventDefault();

        if(!selectedTopic || selectedTopic.length == 0){
            return;
        } 
    }

    const getDiscussions = async() => {
        const apiResponse = await fetch(API_BASE_URL + '/discussions')
        const apiResults = await apiResponse.json()
        setDiscussions(apiResults.discussions)
    }

    const getTagList = async() => {
        const apiResponse = await fetch(API_BASE_URL + '/getTags')
        const apiResults = await apiResponse.json()
        setTagList(apiResults.tags)
    }

    const getFeatured = async() => {
        const apiResponse = await fetch(API_BASE_URL + '/featuredDiscussions')
        const apiResults = await apiResponse.json()
        setFeatured(apiResults.discussions)
    }

    useEffect(() => {
        getDiscussions();
        getTagList();
        getFeatured();
    }, [])

    return(
        <div className = "explore">
            <meta name="description" content="This page acts like a explore page where you can filter
                        discussions by topics and keywords"/>

            <form method="GET" className = "topicSelectForm" onSubmit={filter}>
                <label htmlFor="filterByTopic">Filter by Topics: </label>
                <div className="myRow">
                    <select 
                    className="form-select" 
                    aria-label="filterByTopics" 
                    id="filterByTopics" 
                    name="filterByTopics "
                    style={{width:"200px"}}
                    value = {selectedTopic}
                    onChange={(e) => {
                        setSelectedTopic(e.target.value);
                    }}>
                        <option value="">Search for All</option>
                        {
                            tagList.map((tag) => {
                                return(
                                    <option value={tag.category} key={tag.tag_id}>{tag.category}</option>
                                );
                            })

                        }

                    </select>
                    <button type="submit" className="btn">
                        Apply
                    </button>
                </div>
            </form>

            <h2>Featured Papers</h2>
            <Swiper
                discussions={featured}
            ></Swiper>

            <h2>Recent Discussions</h2>
            <Swiper
                discussions={discussions}
            ></Swiper>
        </div>
    );
}