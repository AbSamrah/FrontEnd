import React, { Component } from "react";

class Logout extends Component {
  state = {};
  componentDidMount() {
    localStorage.removeItem("token");

    window.location = "/";
    
  }
  render() {
    return null;
  }
}

export default Logout;
