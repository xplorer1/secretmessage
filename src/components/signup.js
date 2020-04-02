import React from 'react';
import {Link} from "react-router-dom";
import HttpService from '../httpservice';
import {Utilities} from './home';
import store from "store";

class SignUp extends React.Component {
	constructor() {
        super();

        this.state = {
            email: "",
            name: "",
            password: "",
            ajaxcalled: false
        }
    }

    handleInput = (e) => {

        this.setState({
            [e.target.name]: e.target.value
        });
    }

    login = (email, password) => {
        let data = {
            email: email, 
            password: password
        }

        HttpService.NoTokenServicePost(data, "auth/login")
            .then((response) => {
                this.setState({ajaxcalled: false})

                if(response.data.token) {

                    store.set("token", response.data.token);

                    let tokendata = window.atob(response.data.token.split(".")[1]);
                    let parseddata = JSON.parse(tokendata);

                    store.set("userdata", {
                        name: parseddata.name, 
                        email: parseddata.email, 
                    });
                    
                    this.props.history.push("/bucketlist");
                }
                else {
                    Utilities.Notify("Please ensure that you have provided the correct email address and password.", "info");
                    console.log("Login failed")
                }
            })
            .catch((error) => {
                console.log("error: ", error);

                Utilities.Notify("Unable to login at this time. Please try again later.", "info");
                this.setState({ajaxcalled: false})
            })
    }

    handleSubmit = (e) => {
        e.preventDefault();

        if(!this.state.email) {
            Utilities.Notify("Please enter your email address.", "error");
        }
        if(!this.state.name) {
            Utilities.Notify("Please enter your name.", "error");
        }
        else if(!this.state.password) {
            Utilities.Notify("Your password is required.", "error");
        }
        else {

            this.setState({ajaxcalled: true});

            let data = {
            	email: this.state.email,
                name: this.state.name,
            	password: this.state.password
            }

            HttpService.NoTokenServicePost(data, "auth/save")
                .then((response) => {
                    console.log("res: ", response);

                    //this.setState({ajaxcalled: false})

                    if(response.status === 200) {

                        this.login(response.data.email, response.data.password);
                    }
                    else {
                        Utilities.Notify("Unable to signup at this time. Please try again later.", "info");
                        console.log("SignUp failed")
                    }
                })
                .catch((error) => {
                    console.log("error: ", error);

                    Utilities.Notify("Unable to login at this time. Please try again later.", "info");
                    this.setState({ajaxcalled: false})
                })
        }
    }

	render() {
		return (
			<article>
				<div className="container">
				    <div className="row">
				        <div className="col-md-12 min-vh-100 d-flex flex-column justify-content-center">
				            <div className="row">
				                <div className="col-lg-6 col-md-8 mx-auto">

				                    <div className="card rounded">
				                        <div className="card-header">
				                            <h3 className="mb-0">Sign Up</h3>
				                        </div>
				                        <div className="card-body">
				                            <form className="form" role="form" autoComplete="off" id="formLogin">
				                                <div className="form-group">
				                                    <label htmlFor="uname1">Email</label>
				                                    <input onChange={this.handleInput} value={this.state.email} 
				                                    	name="email" type="email" className="form-control form-control-lg rounded-0" 
				                                    	id="uname1" required="" placeholder="Email address" />
				                                </div>
                                                <div className="form-group">
                                                    <label htmlFor="uname2">Name</label>
                                                    <input onChange={this.handleInput} value={this.state.name} 
                                                        name="name" type="text" className="form-control form-control-lg rounded-0" 
                                                        id="uname2" required="" placeholder="Name" />
                                                </div>
				                                <div className="form-group">
				                                    <label>Password</label>
				                                    <input onChange={this.handleInput} value={this.state.password} 
				                                    name="password" type="password" 
				                                    className="form-control form-control-lg rounded-0" id="pwd1" required="" 
				                                    placeholder="Password"
				                                />
				                                </div>
				                                <div>
				                                    <label className="custom-control custom-checkbox">
				                                      	<input type="checkbox" className="custom-control-input" />
				                                      	<span className="custom-control-indicator"></span>
				                                    </label>
				                                </div>
				                                <button type="button" className="btn btn-success btn-lg float-right" id="btnLogin" 
                                                onClick={this.handleSubmit}>Sign Up
                                                {this.state.ajaxcalled ? Utilities.Indicator() : <div></div>}
                                                </button>
                                                <div>Already has an account? <Link to="/">Sign in</Link></div>
				                            </form>
				                        </div>
				                    </div>
				                </div>
				            </div>
				        </div>
				    </div>
				</div>
			</article>
		)
	}
}

export default SignUp;