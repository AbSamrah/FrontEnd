import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import "../style/navbar.css";

const NavBar = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);

  // This function closes the mobile menu when a link is clicked
  const closeMenu = () => setIsOpen(false);

  // Get the user's role from the decoded JWT token
  const role =
    user ?
      user["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]
    : null;

  return (
    <nav className="bg-white shadow-md fixed w-full z-20 top-0 start-0">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        {/* Brand Logo */}
        <NavLink
          to="/"
          className="flex items-center space-x-3 rtl:space-x-reverse">
          <i className="fas fa-plane-departure text-blue-600 text-2xl"></i>
          <span className="self-center text-2xl font-semibold whitespace-nowrap text-blue-600">
            Tourista
          </span>
        </NavLink>

        {/* Login/Signup/Logout & Mobile Toggle */}
        <div className="flex items-center md:order-2 space-x-2 rtl:space-x-reverse">
          {!user ?
            <>
              <NavLink
                to="/login"
                className="text-gray-800 bg-gray-100 hover:bg-gray-200 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-4 py-2 text-center hidden sm:block">
                Login
              </NavLink>
              <NavLink
                to="/signup"
                className="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 text-center">
                Sign Up
              </NavLink>
            </>
          : <div className="flex items-center space-x-3">
              <span className="text-gray-700 font-medium self-center hidden sm:inline">
                Welcome,{" "}
                {
                  user[
                    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"
                  ]
                }
              </span>
              <NavLink
                to="/logout"
                className="text-white bg-red-500 hover:bg-red-600 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-4 py-2 text-center">
                Logout
              </NavLink>
            </div>
          }
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            type="button"
            className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
            aria-controls="navbar-menu"
            aria-expanded={isOpen}>
            <span className="sr-only">Open main menu</span>
            <i className={`fas ${isOpen ? "fa-times" : "fa-bars"} text-xl`}></i>
          </button>
        </div>

        {/* Main Navigation Links */}
        <div
          className={`items-center justify-between w-full md:flex md:w-auto md:order-1 ${isOpen ? "block" : "hidden"}`}
          id="navbar-menu">
          <ul className="flex flex-col p-4 md:p-0 mt-4 font-medium border border-gray-100 rounded-lg bg-gray-50 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-white">
            <li>
              <NavLink
                to="/"
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
                onClick={closeMenu}>
                Home
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/cars"
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
                onClick={closeMenu}>
                Cars
              </NavLink>
            </li>

            {/* Conditionally render the link based on the user's role */}
            {(role === "Admin" || role === "Employee") && (
              <li>
                <NavLink
                  to="/car-bookings"
                  className={({ isActive }) =>
                    isActive ? "nav-link active" : "nav-link"
                  }
                  onClick={closeMenu}>
                  Car Bookings
                </NavLink>
              </li>
            )}

            <li>
              <NavLink
                to="/trips"
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
                onClick={closeMenu}>
                Trips
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/blog"
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
                onClick={closeMenu}>
                Posts
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/about"
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
                onClick={closeMenu}>
                About
              </NavLink>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
