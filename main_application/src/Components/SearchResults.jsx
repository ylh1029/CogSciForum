import { useLocation} from "react-router-dom";
import Row from './Row'

export default function SearchResults(props){
    const { state } = useLocation();
    const results = state?.results;

    return(
        <div className = "searchResults">
            <meta name="description" content="A page for displaying search results!"/>

                <div className="searchResults-container">
                    {results.length} result(s).
                    <div className="searchResults-flexContainer">
                    {
                        results.map((paper, index) => {
                            return(
                                <Row
                                    key = {index}
                                    title = {paper.title}
                                    refCnt = {paper.referenceCount}
                                    citeCnt = {paper.citationCount}
                                    url = {paper.pdf? paper.pdfUrl.url: paper.url}
                                    authors = {paper.authors}
                                ></Row>
                            );
                        })
                    }
                    </div>
                </div>
        </div>
    );
}