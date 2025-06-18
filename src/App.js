import "./App.css";
import NavBar from "./components/navbar";
import Users from "./components/users";
import { Route, Routes } from "react-router-dom";
import Login from "./components/login";
import Home from "./components/home";
import AddUser from "./components/adduser";
import SignUp from "./components/signup";
import Cars from "./components/cars";
import Trips from "./components/trips";
import TripDetails from "./components/tripDetails";
import Blog from "./components/blog";
import BlogPost from "./components/blogPost";
import AddCar from "./components/addcar";
import UpdateCar from "./components/updatecar";
import { jwtDecode } from "jwt-decode";
import { Component } from "react";
import Logout from "./components/logout";
import RentCarFormWrapper from "./components/rentcarform";
import PaymentPage from "./components/payment";
import PaymentSuccess from "./components/PaymentSuccess"; // Import new component
import PaymentCancel from "./components/PaymentCancel"; // Import new component
import PayPalTest from "./components/PayPalTest"; // 1. IMPORT THE NEW COMPONENT

class App extends Component {
  state = {};

  componentDidMount() {
    try {
      const jwt = localStorage.getItem("token");
      if (jwt) {
        const user = jwtDecode(jwt);
        this.setState({ user });
      }
    } catch (ex) {}
  }
  render() {
    return (
      <div className="App">
        <NavBar user={this.state.user} />
        <Routes className="content">
          {/* ... other routes ... */}
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:id" element={<BlogPost />} />
          
          {/* 2. ADD THE NEW TEST ROUTE HERE */}
          <Route path="/paypal-test" element={<PayPalTest />} />
        </Routes>
      </div>
    );
  }
}

export default App;