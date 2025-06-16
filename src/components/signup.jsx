import React, { Component } from "react";
import Form from "./form";
import Joi from "joi-browser";
import apiClient from "../helper/apiclient";
import { Link, Navigate, redirect } from "react-router-dom";

class SignUp extends Form {
  state = {
    data: { firstName: "", lastName: "", email: "", password: "" },
    errors: {},
  };

  // email = React.createRef();
  doSubmit = async () => {
    try {
      const response = await apiClient.post(
        "/authentication/register",
        this.state.data
      );
      console.log("Signup successful:", response.data);
      this.setState({ redirect: true });
    } catch (error) {
      console.error("Signup failed:", error);
      this.setState({
        errors: {
          ...this.state.errors,
          api: error.response?.data?.message || "Signup failed",
        },
      });
    }
  };

  schema = {
    email: Joi.string().required().label("Email"),
    password: Joi.string().min(8).required().label("Password"),
    firstName: Joi.string().required().label("First name"),
    lastName: Joi.string().required().label("Last name"),
  };

  render() {
    const { data, errors, redirect } = this.state;
    if (redirect) {
      return <Navigate to="/" replace />;
    }
    return (
      <div className="container d-flex min-vh-100">
        <div className="row align-items-center justify-content-center w-100">
          <div className="col-md-8 col-lg-6 col-xl-5">
            <div className="card shadow-sm">
              <div className="card-body p-4 p-sm-5">
                <div className="text-center mb-4">
                  <h3 className="mb-2">Sign up</h3>
                  <p className="text-muted">Create new account</p>
                </div>

                <form onSubmit={this.handleSubmit}>
                  <div className="row">
                    <div className="col-md-6">
                      {this.renderInput("firstName", "First name", "text")}
                    </div>
                    <div className="col-md-6">
                      {this.renderInput("lastName", "Last name", "text")}
                    </div>
                  </div>
                  {this.renderInput("email", "Email", "email")}

                  {this.renderInput("password", "Password", "password")}

                  {this.renderButton("Sign up")}
                </form>

                <div className="text-center mt-4">
                  <p className="text-muted mb-0">
                    Do you have an account?{" "}
                    <Link to="/login" className="text-decoration-none">
                      Login
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default SignUp;
