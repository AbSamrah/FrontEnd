import React from "react";
import Form from "./form";
import Joi from "joi-browser";
import apiClient from "../helper/apiclient";
import { useNavigate, useParams } from "react-router-dom";
import "../style/carform.css";

class UpdateCarForm extends Form {
  state = {
    data: {
      model: "",
      seats: 0,
      color: "",
      image: "",
      mbw: 0,
      pph: 0,
      ppd: 0,
      categoryId: null,
    },
    errors: {},
    categories: [
      { id: 1, title: "Economy" },
      { id: 2, title: "Standard" },
      { id: 3, title: "Luxury" },
      { id: 4, title: "SUV" },
    ],
    isLoading: false,
    isFetching: true,
  };

  schema = {
    model: Joi.string().label("Model"),
    seats: Joi.number().min(1).max(40).label("Seats"),
    color: Joi.string().label("Color"),
    image: Joi.string().label("Image URL"),
    mbw: Joi.number().min(0.01).max(1000).label("Mileage"),
    pph: Joi.number().label("Price per hour"),
    ppd: Joi.number().label("Price per day"),
    categoryId: Joi.number().allow(null).label("Category"),
    id: Joi.allow(""),
  };

  async componentDidMount() {
    const { id } = this.props.params;
    try {
      const { data } = await apiClient.get(`/cars/${id}`);
      this.setState({ data, isFetching: false });
    } catch (error) {
      if (error.response && error.response.status === 404) {
        this.props.navigate("/not-found");
      }
      this.setState({ isFetching: false });
    }
  }

  doSubmit = async () => {
    this.setState({ isLoading: true });
    try {
      const { id } = this.props.params;
      const response = await apiClient.put(`/Cars/${id}`, this.state.data);
      console.log(response);
      // Navigate back to cars page after successful update
      this.props.navigate("/cars", { replace: true }); // Changed this line
    } catch (error) {
      if (error.response && error.response.status === 400) {
        const errors = { ...this.state.errors };
        errors.form = error.response.data;
        this.setState({ errors });
      }
    } finally {
      this.setState({ isLoading: false });
    }
  };

  render() {
    if (this.state.isFetching) {
      return (
        <div className="car-form-container text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      );
    }

    return (
      <div className="car-form-container">
        <h1 className="car-form-header text-center">Update Car</h1>
        <form onSubmit={this.handleSubmit}>
          <div className="car-form-grid">
            <div>
              {this.renderInput("model", "Model", "text", "Enter car model")}
              {this.renderInput(
                "seats",
                "Number of Seats",
                "number",
                "Enter number of seats"
              )}
              {this.renderInput("color", "Color", "text", "Enter car color")}
              {this.renderSelect(
                "categoryId",
                "Category",
                this.state.categories,
                "Select a category"
              )}
            </div>
            <div>
              {this.renderInput(
                "image",
                "Image URL",
                "text",
                "Enter image URL"
              )}
              {this.renderInput(
                "mbw",
                "Mileage by Week (km)",
                "number",
                "Enter mileage"
              )}
              {this.renderInput(
                "pph",
                "Price per Hour (€)",
                "number",
                "Enter hourly price"
              )}
              {this.renderInput(
                "ppd",
                "Price per Day (€)",
                "number",
                "Enter daily price"
              )}
            </div>
          </div>

          <div className="d-grid gap-2 d-md-flex justify-content-md-end mt-4">
            <button
              type="button"
              className="btn btn-outline-secondary me-md-2"
              onClick={() => this.props.navigate("/cars")}>
              Cancel
            </button>
            <button disabled={this.state.isLoading} className="btn btn-primary">
              {this.state.isLoading ?
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"></span>
                  Updating...
                </>
              : "Update Car"}
            </button>
          </div>
        </form>
      </div>
    );
  }

  renderInput(name, label, type = "text", placeholder = "") {
    return (
      <div className="form-group">
        <label htmlFor={name} className="form-label">
          {label}
        </label>
        <input
          name={name}
          value={this.state.data[name] || ""}
          onChange={this.handleChange}
          type={type}
          className="form-control"
          id={name}
          placeholder={placeholder}
        />
        {this.state.errors[name] && (
          <div className="alert alert-danger">{this.state.errors[name]}</div>
        )}
      </div>
    );
  }

  renderSelect(name, label, options, placeholder = "") {
    return (
      <div className="form-group">
        <label htmlFor={name} className="form-label">
          {label}
        </label>
        <select
          name={name}
          id={name}
          value={this.state.data[name] || ""}
          onChange={this.handleChange}
          className="form-control">
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.title}
            </option>
          ))}
        </select>
        {this.state.errors[name] && (
          <div className="alert alert-danger">{this.state.errors[name]}</div>
        )}
      </div>
    );
  }
}

const UpdateCar = () => {
  const navigate = useNavigate();
  const params = useParams();
  return <UpdateCarForm navigate={navigate} params={params} />;
};

export default UpdateCar;
