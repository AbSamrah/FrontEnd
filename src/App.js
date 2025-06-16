//import logo from './logo.svg';
import "./App.css";
import NavBar from "./components/navbar";
import Users from "./components/users";
import { Route, Routes } from "react-router-dom";
import Login from "./components/login";
import Home from "./components/home";
import AddUser from "./components/adduser";
import SignUp from "./components/signup";
import Cars from "./components/cars";
import AddCar from "./components/addcar";
import UpdateCar from "./components/updatecar";
import { jwtDecode } from "jwt-decode";
import { Component } from "react";
import Logout from "./components/logout";
import RentCarFormWrapper from "./components/rentcarform";

class App extends Component {
  state = {};

  componentDidMount() {
    try {
      const jwt = localStorage.getItem("token");
      const user = jwtDecode(jwt);
      this.setState({ user });
    } catch (ex) {}
  }
  render() {
    return (
      <div className="App">
        <NavBar user={this.state.user} />
        <Routes className="content">
          <Route path="/users" Component={Users} />
          <Route path="/users/adduser" Component={AddUser} />
          <Route path="/" Component={Home} />
          <Route path="/login" Component={Login} />
          <Route path="/signup" Component={SignUp} />
          <Route path="/logout" Component={Logout} />
          <Route path="/cars" Component={Cars} />
          <Route path="/cars/add" Component={AddCar} />
          <Route path="/cars/update/:id" Component={UpdateCar} />
          <Route path="/cars/rent/:id" element={<RentCarFormWrapper />} />
        </Routes>
      </div>
    );
  }
}

export default App;
