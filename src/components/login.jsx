import Form from "./form";
import Joi from "joi-browser";
import apiClient from "../helper/apiclient";
import { Link, Navigate } from "react-router-dom";

class Login extends Form {
  // email = React.createRef();
  state = {
    data: { email: "", password: "" },
    errors: {},
    redirect: false,
  };

  doSubmit = async () => {
    try {
      const response = await apiClient.post(
        "/Authentication/login",
        this.state.data
      );
      localStorage.setItem("token", response.data);
      window.location = "/";
      console.log("Login successful:", response.data);
    } catch (error) {
      console.error("Login failed:", error);
      this.setState({
        errors: {
          ...this.state.errors,
          api: error.response?.data?.message || "Login failed",
        },
      });
    }
  };

  schema = {
    email: Joi.string().required().label("Email"),
    password: Joi.string().min(8).required().label("Password"),
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
                  <h3 className="mb-2">Welcome Back</h3>
                  <p className="text-muted">Please login to continue</p>
                </div>

                <form onSubmit={this.handleSubmit}>
                  {this.renderInput("email", "Email", "email")}

                  {this.renderInput("password", "Password", "password")}

                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="remember"
                      />
                      <label className="form-check-label" htmlFor="remember">
                        Remember me
                      </label>
                    </div>
                    <a href="#!" className="text-decoration-none">
                      Forgot password?
                    </a>
                  </div>

                  {this.renderButton("Login")}
                </form>

                <div className="text-center mt-4">
                  <p className="text-muted mb-0">
                    Don't have an account?{" "}
                    <Link to="/signup" clLinkssName="text-decoration-none">
                      Sign up
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

export default Login;
