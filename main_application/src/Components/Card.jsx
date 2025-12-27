import {Link} from 'react-router-dom';

export default function Card(props){
    return(
        <Link to={props.atag} className="card displaying" style={{width: '250px'}}>
            <div className="card-container"><img src={props.src} className="card-img-top home-card" alt={props.alt}/></div>
            <div className="card-body">
                <p className="card-text">{props.body}</p>
            </div>
        </Link>
    );
}