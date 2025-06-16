import React, { Component } from "react";
import { Link, NavLink } from "react-router-dom";

const NavBar = ({ user }) => {
  return (
    <header className="p-3 text-bg-primary">
      <div className="container">
        <div className="d-flex flex-wrap align-items-center justify-content-center justify-content-lg-start">
          <Link
            to="/"
            className="d-flex align-items-center mb-2 mb-lg-0 text-white text-decoration-none h3 p-3">
            TourAgency
          </Link>

          <ul className="nav col-12 col-lg-auto me-lg-auto mb-2 justify-content-center mb-md-0">
            {/* <li>
                <Link to="/users" className="nav-link px-2 text-white">
                  Users
                </Link>
              </li> */}
            <li>
              <Link to="/cars" className="nav-link px-2 text-white">
                Cars
              </Link>
            </li>
            <li>
              <Link to="#" className="nav-link px-2 text-white">
                Trips
              </Link>
            </li>
          </ul>

          {!user && (
            <div className="text-end">
              <NavLink to="/login" className="btn btn-outline-light me-2">
                Login
              </NavLink>
              <NavLink to="/signup" className="btn btn-primary">
                Sign-up
              </NavLink>
            </div>
          )}
          {user && (
            <div className="text-end">
              <NavLink to="/profile" className="nav-link nav-item">
                {
                  user[
                    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"
                  ]
                }
              </NavLink>
              <NavLink to="/logout" className="nav-link nav-item">
                Logout
              </NavLink>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default NavBar;
