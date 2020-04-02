import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter as Router, Switch, Route} from "react-router-dom";
import {Home} from "./components/home";
import SignUp from "./components/signup";
import NotFound from "./components/notfound";
import Login from "./components/login";
import Item from "./components/item";
import Swagger from "./components/swagger";

function App() {
    return (
        <Router>
            <Switch>
	    		<Route exact path='/' component={Home} />
	    		<Route exact path='/signup' component={SignUp} />
	    		<Route exact path='/login' component={Login} />
	    		<Route exact path='/item' component={Item} />
	    		<Route exact path='/api/vi/api-docs' component={Swagger} />
	    		<Route path='' component={NotFound} />
			</Switch>
        </Router>
    )
}

ReactDOM.render(
	<App />,
	document.getElementById("root")
)