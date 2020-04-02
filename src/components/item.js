import React from 'react';
import {Link} from "react-router-dom";
import HttpService from '../httpservice';
import store from "store";
import {Utilities} from './home';

class Item extends React.Component {
	constructor() {
        super();

        this.state = {
            ajaxcalled: false,
            ajaxcalled2: false,
            pageloading: true,
            name: "",
            activeitem: {},

            edititemname: "", 
            editdone: "",

            itemname: "",
            done: false,
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
                        store.remove("item");
                        store.remove("buckets");

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

    handleCheck = (e) => {

        this.setState({
            [e.target.name]: e.target.checked
        });
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

        HttpService.TokenServicePost(data, "bucketlists/" + this.state.activeitem.bucket_id + "/items/" + this.state.activeitem.id, token, "PUT")
            .then((response) => {
                this.setState({ajaxcalled: false});

                if(response.status === 200) {
                    Utilities.Notify("Operations was successful.", "success");
                    store.set("item", response.data[0]);


                    this.setState({activeitem: response.data[0]});
                }
            })
            .catch((error) => {
                console.log("error: ", error);

                Utilities.Notify("Could not complete your request. Please try again later.", "info");
                this.setState({ajaxcalled: false})
            })
    }

    handleDeleteItem = (e) => {
        e.preventDefault();

        this.setState({ajaxcalled2: true});

        let data = {}

        let token = store.get("token");

        if(!token) {
            this.handleSignOut();
        }

        HttpService.TokenServicePost(data, "bucketlists/" + this.state.activeitem.bucket_id + "/items/" + this.state.activeitem.id, token, "DELETE")
            .then((response) => {
                this.setState({ajaxcalled2: false});

                if(response.status === 200) {
                    Utilities.Notify("Operations was successful.", "success");
                    this.props.history.push("/bucketlist");
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

    signOut = () => {
        return (<a className="navbar-brand cp" onClick={this.handleSignOut}>Sign Out</a>)
    }

	render() {
		return (
			<article>
                
                <Utilities.NavBar name={this.state.name} signOut={this.signOut()} />

                <div className="mx-auto py-3 container-fluid">
                    <div className="row d-flex intro mb-3 p-2 mx-0 bg-light">
                        <div className="text-left cp p-0" onClick={()=> {this.props.history.push("/bucketlist")}}>
                            <button type="button" className={"btn btn-outline-primary tradebg rounded border-0"}>
                                Back
                            </button>
                        </div>
                    </div>


                    <div className="row d-flex intro mb-3 p-2 mx-0 bg-light">
                        <div className="col text-left" style={{lineHeight: "2.5"}}>Item Details</div>
                    </div>

                    <div className="row">
                        <div className="col-3 text-muted small">Name:</div>
                        <div className="col text-muted ft14">{this.state.activeitem.name}</div>
                    </div>

                    <div className="row">
                        <div className="col-3 text-muted small">Date Created:</div>
                        <div className="col text-muted ft14">{new Date(this.state.activeitem.date_created).toLocaleString()}</div>
                    </div>

                    <div className="row">
                        <div className="col-3 text-muted small">Date Modified:</div>
                        <div className="col text-muted ft14">{new Date(this.state.activeitem.date_modified).toLocaleString()}</div>
                    </div>

                    <div className="row">
                        <div className="col-3 text-muted small">ID:</div>
                        <div className="col text-muted ft14">{this.state.activeitem.id}</div>
                    </div>

                    <div className="row">
                        <div className="col-3 text-muted small">Bucket ID</div>
                        <div className="col text-muted ft14">{this.state.activeitem.bucket_id}</div>
                    </div>

                    <div className="row">
                        <div className="col-3 text-muted small">Done?</div>
                        <div className="col text-muted ft14">{this.state.activeitem.done ? "Yes" : "No"}</div>
                    </div>

                    <div className="row my-3">
                        <div className="col-6 text-left">
                            <div className="">
                                <button type="button" className={"btn btn-primary tradebg rounded"} data-toggle="modal" data-target="#edititemmodal">
                                    Edit Item
                                </button>
                            </div>
                        </div>

                        <div className="col-6 text-right">
                            <div className="">
                                <button type="button" className={"btn btn-primary bg-danger text-white rounded border-0"} onClick={this.handleDeleteItem}>
                                    Delete Item
                                    {this.state.ajaxcalled2 ? Utilities.Indicator() : <div></div>}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="modal fade" id="edititemmodal">
                    <div className="modal-dialog mw-100 modal-dialog-centered">
                        <div className="modal-content">

                            <div className="modal-header border-0 text-center">

                                <div className="modal-title font-weight-bold">Edit Item</div>
                                <button type="button" className="close cl-times" data-dismiss="modal">&times;</button>
                            </div>

                            <div className="modal-body py-0 w-100 mx-auto">
                                <div className="form-group">
                                    <label htmlFor="itemname" className="small">Name</label>
                                    <input onChange={this.handleInput} value={this.state.edititemname} name="edititemname" type="text" className="form-control" id="symbol" placeholder="Item Name" />
                                </div>

                                <div className="custom-control custom-switch">
                                    <input type="checkbox" className="custom-control-input" id="editdone" 
                                        value={this.state.editdone} onChange={this.handleCheck} 
                                        name="done" />
                                    <label className="custom-control-label" htmlFor="editdone">Done?</label>
                                </div>
                            </div>

                            <div className="modal-footer mx-auto border-top-0 pb-4">
                                <button type="button" className="btn btn-primary px-5" onClick={this.handleEditItem}>
                                    Edit Item
                                    {this.state.ajaxcalled ? Utilities.Indicator() : <div></div>}
                                </button>
                            </div>

                        </div>
                    </div>
                </div>
			</article>
		)
	}

    componentDidMount() {

        let token = store.get("token");
        let user = store.get("userdata");
        let activeitem = store.get("item");

        if(token && activeitem) {
            this.setState({activeitem: activeitem, name: user.name});
        }
        else {
            this.handleSignOut();
        }
    }
}

export default Item;