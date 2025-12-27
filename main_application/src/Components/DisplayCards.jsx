import Card from './SavedCard'
import {useState} from "react"

export default function DisplayCards(props){
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
    const [cardList, setCardList] = useState(props.list)

    if(props.test === "hi"){
        console.log(cardList)
    }
    const handleRemove = async(card_id) => {
        const result = confirm("You sure you want to remove this discussion?");
        if(result){
            const newList = cardList.filter((card) => {
                if(card.discussion_id != card_id){
                    return true;
                }
            })
            setCardList(newList);
            console.log("After removal:", newList)

            if(props.state === "saved"){
            //Remove the relationship
                try{
                    const res = await fetch(
                        `${API_BASE_URL}/user/saved?id=${encodeURIComponent(card_id)}`,
                        {
                        method: "DELETE",
                        headers: { "Content-Type": "application/json" },
                        credentials: "include",
                        }
                    );
                }
                catch(error){
                    console.error("Couldn't delete the discussion")
                }
            }
            else{
            //Remove the discussion
                try{
                    const res = await fetch(
                        `${API_BASE_URL}/discussions?id=${encodeURIComponent(card_id)}`,
                        {
                        method: "DELETE",
                        headers: { "Content-Type": "application/json" },
                        }
                    );
                }
                catch(error){
                    console.error("Couldn't delete the discussion")
                }

            }
            

            return true;
        }
        return false;
    }

    return(
        <div className="savedCards">
            {cardList.length > 0 ? (
                cardList.map((card) => (
                    <Card 
                        key={card.id} 
                        {...card} 
                        handleRemove={handleRemove} 
                        saved 
                        state={props.state}
                    />
                ))
                ) : (
                <div className="text-center py-4">
                    <h6 className="mb-1">No results found</h6>
                </div>
            )}
        </div>
    );
}