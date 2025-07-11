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
import CarBookings from "./components/carbooking";
import PaymentSuccess from "./components/PaymentSuccess";
import PaymentCancel from "./components/PaymentCancel";
import EditCarBooking from "./components/editcarbooking"; // 1. Import the new component
import AddTrip from "./components/addTrip";
import UpdateTrip from "./components/updateTrip";

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
          <Route path="/users" element={<Users />} />
          <Route path="/users/adduser" element={<AddUser />} />
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/cars" element={<Cars />} />
          <Route path="/cars/add" element={<AddCar />} />
          <Route path="/cars/update/:id" element={<UpdateCar />} />
          <Route path="/cars/rent/:id" element={<RentCarFormWrapper />} />

          <Route path="/car-bookings" element={<CarBookings />} />
          {/* 2. Add the new route for editing car bookings */}
          <Route path="/car-bookings/edit/:id" element={<EditCarBooking />} />

          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-cancel" element={<PaymentCancel />} />

          <Route path="/trips" element={<Trips />} />
          <Route path="/trips/add" element={<AddTrip />} />
          <Route path="/trips/update/:id" element={<UpdateTrip />} />
          <Route path="/trips/:id" element={<TripDetails />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:id" element={<BlogPost />} />
        </Routes>
      </div>
    );
  }
}

export default App;
