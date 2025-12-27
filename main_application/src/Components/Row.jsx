import Horizontal from "./Horizontal"
import {Link} from "react-router-dom";

export default function Row(props){
    return(
        <div className="searchResults-row">
            <h2>{props.title}</h2>
            <div className="authors-row">
                <span>Authors: </span>
                {
                    props.authors && props.authors.length === 0 ? (
                        <span className="author">No authors found</span>
                    ) : (
                        props.authors?.map(author => (
                            <span className = "author" key={author}>{author}</span>
                        ))
                    )
                }
            </div>
            
            <div className="tag-icons">
                <span className="bg-success">Reference count: {props.refCnt}</span>
                <span className="bg-success">Citation count: {props.citeCnt}</span>
                <span className="bg-primary"><Link to={props.url} target="_blank">Read More Here</Link></span>
                <span className="bg-danger"><Link 
                                            to="/addDiscussion/Research"
                                            state={{title: props.title,
                                                    paperUrl: props.url,
                                            }}
                                            >Add to Discussion</Link></span>
            </div>

            <Horizontal/>
        </div>
    );
}