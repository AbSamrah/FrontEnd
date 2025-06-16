import Form from "./form";
import Joi from "joi-browser";
import apiClient from "../helper/apiclient";
import { Navigate } from "react-router-dom";

class AddUser extends Form {
  state = {
    data: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      role: "",
    },
    errors: {},
    roles: [],
    redirect: false,
  };

  schema = {
    email: Joi.string().email().required().label("Email"),
    password: Joi.string().min(8).required().label("Password"),
    firstName: Joi.string().required().label("First name"),
    lastName: Joi.string().required().label("Last name"),
    role: Joi.string().required().label("Role"),
  };
  async componentDidMount() {
    const { data: roles } = await apiClient.get("/Roles");
    this.setState({ roles });
  }
  doSubmit = async () => {
    try {
      const response = await apiClient.post("/Users", this.state.data);
      console.log("Added user successful:", response.data);
      this.setState({ redirect: true });
    } catch (error) {
      console.error("Added failed:", error);
      this.setState({
        errors: {
          ...this.state.errors,
          api: error.response?.data?.message || "Added failed",
        },
      });
    }
  };

  render() {
    const { data, errors, roles, redirect } = this.state;
    if (redirect) {
      return <Navigate to="/users" replace />;
    }
    return (
      <div className="container d-flex min-vh-100">
        <div className="row align-items-center justify-content-center w-100">
          <div className="col-md-8 col-lg-6 col-xl-5">
            <div className="card shadow-sm">
              <div className="card-body p-4 p-sm-5">
                <div className="text-center mb-4">
                  <h3 className="mb-2">Add user</h3>
                  <p className="text-muted">Adding new user</p>
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
                  {this.renderSelect("role", "Role", roles)}
                  {this.renderButton("Add user")}
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default AddUser;
