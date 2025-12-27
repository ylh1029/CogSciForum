import {Link} from 'react-router-dom';

export default function DiscussionCard(props){
    return(
        <Link to={`/discussion/${props.id}`} className="card discussion" style={{width: '241px'}}>
            <div className="card-body discussion">
                <div className="post-user">
                    <img src={props.src} className="discover" alt={props.alt}/>
                    <span className="card-subtitle text-body-secondary userName">{props.username}</span>
                </div>
                <h5 className="card-title">{props.title}</h5>
                <p className="card-text">{props.short}</p>
            </div>
        </Link>    
    );
};