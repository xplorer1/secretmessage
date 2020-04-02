import React from 'react';
import {Link} from "react-router-dom";
import HttpService from '../httpservice';
import store from "store";
import Noty from 'noty';

const Utilities = {
    Notify: function(msg, type, done) {//alert, success, warning, error, info/information
        new Noty({
            type: type,
            layout: 'topRight',
            theme: 'nest',
            text: msg,
            timeout: '5000',
            progressBar: true,
            closeWith: ['click'],
            killer: true,
            callbacks: {
                beforeShow: function() {
                   // console.log('beforeend', 'Preparing... ⏱<br/>');
                },
                onShow: function() {
                   // console.log('beforeend', 'Showed ✨<br/>');
                },
                onHover: function() {
                   // console.log('beforeend', 'Hovered 👀<br/>');
                },
                onClick: function() {
                  // console.log('beforeend', 'Clicked ✅<br/>');
                },
                onClose: function() {
                   // console.log('beforeend', 'Bye 👋🏻<br/>');
                   if(done) return done.call();
                }
            },
        }).show();
    },

    Indicator: function() {
        return (
            <div className="spinner-border" role="status" style={{
                marginLeft: ".5rem",
                width: "1.2rem",
                height: "1.2rem",
                marginBottom: "2px"
            }}>
                <span className="sr-only">Loading...</span>
            </div>
        )
    },

    PageLoader: function() {
        return (
            <div className="container-fluid">
                <div className="container">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="preloader1">
                                <div className="loader loader-inner-1">
                                    <div className="loader loader-inner-2">
                                        <div className="loader loader-inner-3">
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    },

    NavBar: function(props) {
        return (
            <nav className="navbar navbar-light bg-light justify-content-between">
                <a className="navbar-brand">{props.name || "BucketList"}</a>
                {props.signOut}
            </nav>
        )
    }
}


class Home extends React.Component {
	constructor() {
        super();

        this.state = {
            ajaxcalled: false,
            ajaxcalled2: false,
            ajaxcalled3: false,
            pageloading: true,
            listofbuckets: [],
            activebucket: {},
            name: "",

            bucketname: "",
            itemname: "",
            targetbucket: "",
            done: false,

            listview: true,
            listofitems: [],
            editname: "",
            editid: "",

            edititemname: "", 
            editdone: "",
            itemsarrived: false,

            activeitem: {},
            activecard: ""
        }
    }

    handleInput = (e) => {

        this.setState({
            [e.target.name]: e.target.value
        });
    }

    handleSignOut = () => {
        let token = store.get("token");

        if(token) {
            HttpService.TokenServiceGetNoJson("auth/logout", token)
                .then((response) => {
                    if(response.status === 200) {
                        store.remove("token");
                        store.remove("userdata");

                        this.props.history.push("/");
                    }
                    else if(response.status === 401) {
                        store.remove("token");
                        store.remove("userdata");
                        store.remove("buckets");
                        store.remove("item");

                        this.props.history.push("/");
                    }
                })
                .catch((error) => {
                    Utilities.Notify("Unable to sign out at this time. Please try again later.", "info");
                })
        }
        else {
            this.props.history.push("/");
        }
    }

    handleSubmit = (e) => {
        e.preventDefault();

        if(!this.state.bucketname) {
            Utilities.Notify("Please enter the bucket name.", "error");
        }
        else {

            this.setState({ajaxcalled: true});

            let data = {
            	name: this.state.bucketname
            }

            let token = store.get("token");

            if(!token) {
                this.handleSignOut();
            }

            HttpService.TokenServicePost(data, "bucketlists", token, "POST")
                .then((response) => {
                    this.setState({ajaxcalled: false});

                    if(response.status === 200) {
                        Utilities.Notify("Bucket added successfully.", "success");

                        let newlist = this.state.listofbuckets.concat(response.data);

                        this.setState({listofbuckets: newlist});
                    }
                })
                .catch((error) => {
                    console.log("error: ", error);

                    Utilities.Notify("Unable to login at this time. Please try again later.", "info");
                    this.setState({ajaxcalled: false})
                })
        }
    }

    handleEditBucket = (e) => {
        e.preventDefault();

        this.setState({ajaxcalled: true});

        let data = {
            name: this.state.editname || this.state.bucketname
        }

        let token = store.get("token");

        if(!token) {
            this.handleSignOut();
        }

        HttpService.TokenServicePost(data, "bucketlists/" + this.state.activebucket.id, token, "PUT")
            .then((response) => {
                this.setState({ajaxcalled: false});

                if(response.status === 200) {
                    Utilities.Notify("Operations was successful.", "success");

                    this.setState({activebucket: response.data[0]});
                }
            })
            .catch((error) => {
                console.log("error: ", error);

                Utilities.Notify("Could not complete your request. Please try again later.", "info");
                this.setState({ajaxcalled: false})
            })
    }

    handleDeleteBucket = (e) => {
        e.preventDefault();

        this.setState({ajaxcalled3: true});

        let data = {
            name: this.state.editname || this.state.bucketname
        }

        let token = store.get("token");

        if(!token) {
            this.handleSignOut();
        }

        HttpService.TokenServicePost(data, "bucketlists/" + this.state.activebucket.id, token, "DELETE")
            .then((response) => {
                this.setState({ajaxcalled3: false});

                if(response.status === 200) {
                    Utilities.Notify("Operations was successful.", "success");

                    let oldlist = this.state.listofbuckets;

                    let newlist = oldlist.filter((list) => {
                        return list.id !== this.state.activebucket.id
                    });

                    this.setState({listofbuckets: newlist, listview: true});
                }
                else if(response.status === 401) {
                    this.handleSignOut();
                }
            })
            .catch((error) => {
                console.log("error: ", error);

                Utilities.Notify("Could not complete your request. Please try again later.", "info");
                this.setState({ajaxcalled: false})
            })
    }

    handleAddItem = (e) => {
        e.preventDefault();

        if(!this.state.itemname) {
            Utilities.Notify("Please enter the bucket name.", "error");
        }
        else if(!this.state.targetbucket) {
            Utilities.Notify("Please select a bucket.", "error");
        }
        else {

            this.setState({ajaxcalled: true});

            let data = {
                name: this.state.itemname,
                done: this.state.done
            }

            console.log("da: ", data);

            let token = store.get("token");

            if(!token) {
                this.handleSignOut();
            }

            HttpService.TokenServicePost(data, "bucketlists/" + this.state.targetbucket + "/items", token, "POST")
                .then((response) => {
                    this.setState({ajaxcalled: false});
                    console.log("response: ", response);

                    if(response.status === 200) {
                        Utilities.Notify("Item added successfully.", "success");

                        //let newlist = this.state.listofbuckets.concat(response.data);

                        //this.setState({listofbuckets: newlist});
                    }
                    else {
                         Utilities.Notify("Unable to add item.", "info");
                    }
                })
                .catch((error) => {
                    console.log("error: ", error);

                    Utilities.Notify("Unable to login at this time. Please try again later.", "info");
                    this.setState({ajaxcalled: false})
                })
        }
    }

    handleCheck = (e) => {

        this.setState({
            [e.target.name]: e.target.checked
        });
    }

    handleViewItems = (id, name) => {
        let token = store.get("token");
        if(id) {

            this.setState({
                ajaxcalled2: true, 
                editid: id, 
                editname: name
            });

            HttpService.TokenServiceGet("bucketlists/" + id + "/items", token)
                .then((response) => {

                    if(response.status === 401 || response.status === 403) {

                        this.handleSignOut();
                    }

                    else if(response.status === 500) {
                        Utilities.Notify("Sorry. Unable to reach server. Please try again later.", "info");
                    }

                    else if(response.status === 200) {
                        this.setState({
                            ajaxcalled2: false,
                            listofitems: response.data,
                            itemsarrived: true
                        })
                    }
                    else {
                        Utilities.Notify("Sorry. Unable to reach server. Please try again later.", "info");
                    }
                })
                .catch((error) => {
                    console.log("error: ", error);
                })
        }
    }

    fetchbucket = (id, name) => {
        let token = store.get("token");
        if(id) {

            this.setState({
                pageloading: true
            });

            HttpService.TokenServiceGet("bucketlists/" + id, token)
                .then((response) => {
                    console.log("res: ", response);

                    this.setState({pageloading: false});

                    if(response.status === 401 || response.status === 403) {

                        this.handleSignOut();
                    }

                    else if(response.status === 500) {
                        Utilities.Notify("Sorry. Unable to reach server. Please try again later.", "info");
                    }

                    else if(response.status === 200) {
                        this.setState({
                            activebucket: response.data[0],
                            listview: false
                        })
                    }
                    else {
                        Utilities.Notify("Sorry. Unable to reach server. Please try again later.", "info");
                    }
                })
                .catch((error) => {
                    console.log("error: ", error);
                })
        }
    }

    fetchItem = (id, bucketid) => {

        let token = store.get("token");
        if(id && bucketid) {

            this.setState({
                ajaxcalled2: true
            });

            HttpService.TokenServiceGet("bucketlists/" + bucketid + "/items/" + id, token)
                .then((response) => {
                    this.setState({activeitem: {}, activeitemclassName: "hide", ajaxcalled2: false});

                    if(response.status === 401 || response.status === 403) {

                        this.handleSignOut();
                    }

                    else if(response.status === 500) {
                        Utilities.Notify("Sorry. Unable to reach server. Please try again later.", "info");
                    }

                    else if(response.status === 200) {
                        store.set("item", response.data[0]);

                        this.props.history.push("/item");
                    }
                    else {
                        Utilities.Notify("Sorry. Unable to reach server. Please try again later.", "info");
                    }
                })
                .catch((error) => {
                    console.log("error: ", error);
                })
        }
    }

    handleEditItem = (e) => {
        e.preventDefault();

        this.setState({ajaxcalled: true});

        let data = {
            name: this.state.edititemname || this.state.itemname,
            done: this.state.editdone || this.state.done
        }

        let token = store.get("token");

        if(!token) {
            this.handleSignOut();
        }

        HttpService.TokenServicePost(data, "bucketlists/" + this.state.activeitem.bucketid + "/items" + this.state.activeitem.item, token, "PUT")
            .then((response) => {
                this.setState({ajaxcalled: false});

                if(response.status === 200) {
                    Utilities.Notify("Operations was successful.", "success");

                    this.setState({listofitems: response.data});
                }
            })
            .catch((error) => {
                console.log("error: ", error);

                Utilities.Notify("Could not complete your request. Please try again later.", "info");
                this.setState({ajaxcalled: false})
            })
    }

    signOut = () => {
        return (<a classNameName="navbar-brand cp" onClick={this.handleSignOut}>Sign Out</a>)
    }

	render() {
		return (
			<article>
                <nav className="navbar navbar-expand-lg navbar-light fixed-top py-3" id="mainNav">
                    <div className="container">
                        <a className="navbar-brand js-scroll-trigger" href="#page-top">SiriWhat</a>
                        <button className="navbar-toggler navbar-toggler-right" type="button" data-toggle="collapse" data-target="#navbarResponsive" aria-controls="navbarResponsive" aria-expanded="false" aria-label="Toggle navigation">
                            <span className="navbar-toggler-icon"></span>
                        </button>
                        <div className="collapse navbar-collapse" id="navbarResponsive">
                            <ul className="navbar-nav ml-auto my-2 my-lg-0">
                                <li className="nav-item">
                                    <a className="nav-link js-scroll-trigger" href="#about">About</a>
                                </li>
                                <li className="nav-item">
                                    <a className="nav-link js-scroll-trigger" href="#services">Services</a>
                                </li>
                                <li className="nav-item">
                                    <a className="nav-link js-scroll-trigger" href="#contact">Contact</a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </nav>

                <header className="masthead">
                    <div className="container h-100">
                        <div className="row h-100 align-items-center justify-content-center text-center">
                            <div className="col-lg-10 align-self-end">
                                <h1 className="text-uppercase text-white font-weight-bold">
                                    Send secret anonymous messages to anyone.
                                </h1>
                                <hr className="divider my-4" />
                            </div>
                            <div className="col-lg-8 align-self-baseline">
                                <p className="text-white-75 font-weight-light mb-5">
                                With the help of SiriWhat, you can send and recieve anonymous messages easily for free!</p>
                                <a className="btn btn-primary btn-xl js-scroll-trigger" href="#about">Find Out More</a>
                            </div>
                        </div>
                    </div>
                </header>

                <section className="page-section bg-primary" id="about">
                    <div className="container">
                        <div className="row justify-content-center">
                            <div className="col-lg-8 text-center">
                                <h2 className="text-white mt-0">We've got what you need!</h2>
                                <hr className="divider light my-4" />
                                <p className="text-white-50 mb-4">Our Anonymous Messaging App comes along with many great features. 
                                Here we are going to list some of them. Have a look below. </p>
                                <a className="btn btn-light btn-xl js-scroll-trigger" href="#services">Get Started!</a>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="page-section" id="services">
                    <div className="container">
                        <h2 className="text-center mt-0">At Your Service</h2>
                        <hr className="divider my-4" />

                        <div className="row">
                            <div className="col-lg-3 col-md-6 text-center">
                                <div className="mt-5">
                                    <i className="fas fa-4x fa-gem text-primary mb-4"></i>
                                    <h3 className="h4 mb-2">Anonymity</h3>
                                    <p className="text-muted mb-0">
                                        Our Platform ensures your privacy so that you stay anonymous everytime you send someone a secret message. You are anonymous until you ever choose to reveal your identity.
                                    </p>
                                </div>
                            </div>

                            <div className="col-lg-3 col-md-6 text-center">
                                <div className="mt-5">
                                    <i className="fas fa-4x fa-laptop-code text-primary mb-4"></i>
                                    <h3 className="h4 mb-2">Safe & Secure</h3>
                                    <p className="text-muted mb-0">We do not keep or store any personal details or the messages you send. Once you hit the send button, it would be like it never happened.</p>
                                </div>
                            </div>

                            <div className="col-lg-3 col-md-6 text-center">
                                <div className="mt-5">
                                    <i className="fas fa-4x fa-globe text-primary mb-4"></i>
                                    <h3 className="h4 mb-2">24/7 Support</h3>
                                    <p className="text-muted mb-0">If there is anything that you need help with related to our anonymous messaging and feedback platform, We are always here for you. 24 hours a day and 7 days a week.</p>
                                </div>
                            </div>

                            <div className="col-lg-3 col-md-6 text-center">
                                <div className="mt-5">
                                    <i className="fas fa-4x fa-heart text-primary mb-4"></i>
                                    <h3 className="h4 mb-2">Easy 2 Use</h3>
                                    <p className="text-muted mb-0">We are constantly working on SiriWhat as a platform to make it as user friendly as possible. All you gotta do is press a button, fill in some details and press send.</p>
                                </div>
                            </div>

                        </div>
                    </div>
                </section>

                <section className="page-section" id="contact">
                    <div className="container">
                        <div className="row justify-content-center">
                            <div className="col-lg-8 text-center">
                                <h2 className="mt-0">Contact Us?</h2>
                                <hr className="divider my-4" />
                            </div>
                        </div>

                        <div className="row justify-content-center">
                            {/*<div className="col-lg-4 ml-auto text-center">
                                <i className="fas fa-phone fa-3x mb-3 text-muted"></i>
                                <div>+1 (202) 555-0149</div>
                            </div>*/}
                            <div className=" text-center justify-content-center">
                                <i className="fas fa-envelope fa-3x mb-3 text-muted"></i>
                                <a className="d-block" href="mailto:contact@yourwebsite.com">contact@siriwhat.com</a>
                            </div>
                        </div>
                    </div>
                </section>

                <footer className="bg-light py-5">
                    <div className="container">
                        <div className="small text-center text-muted">Copyright &copy; 2020 - SiriWhat</div>
                    </div>
                </footer>
			</article>
		)
	}

    componentDidMount() {

        /*let token = store.get("token");
        let user = store.get("userdata");

        if(token) {
            HttpService.TokenServiceGet("bucketlists", token)
                .then((response) => {

                    this.setState({pageloading: false});

                    if(response.status === 401 || response.status === 403) {

                        this.handleSignOut();
                    }
                    else if(response.status === 500) {
                        Utilities.Notify("Sorry. Unable to reach server. Please try again later.", "info");
                    }
                    else if(response.status === 200) {
                        this.setState({
                            listofbuckets: response.data,
                            name: user.name
                        })

                        store.set("buckets", response.data);
                    }
                    else {
                        Utilities.Notify("Sorry. Unable to reach server. Please try again later.", "info");
                    }
                })
                .catch((error) => {
                    console.log("error: ", error);
                })
        }
        else {
            this.handleSignOut();
        }*/
    }
}

export {Home, Utilities};