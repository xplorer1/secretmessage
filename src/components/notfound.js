import React from 'react';
import {Link} from "react-router-dom";

class NotFound extends React.Component {
    constructor() {
        super();
    }

    render() {
        return (
            <article className="cont-mother">
                <section className="mx-auto w-75">
                    <div className="w-100 text-center mt-5 mb-3 tradecolordk font-weight-bold">
                        Sorry, this page is not available.
                    </div>

                    <div className="text-center">
                    	The link you followed may have been broken, or the page may have been removed. <Link to="/">Go back.</Link>
                    </div>
                </section>
                
            </article>
        );
    }
}

export default NotFound;