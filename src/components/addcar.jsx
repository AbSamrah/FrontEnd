import React from "react";
import Form from "./form";
import Joi from "joi-browser";
import apiClient from "../helper/apiclient";
import { useNavigate } from "react-router-dom";
import "../style/carform.css";

class AddCarForm extends Form {
  state = {
    data: {
      model: "",
      seats: 4,
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
  };

  schema = {
    model: Joi.string().required().label("Model"),
    seats: Joi.number().min(1).max(40).required().label("Seats"),
    color: Joi.string().required().label("Color"),
    image: Joi.string().required().label("Image URL"),
    mbw: Joi.number().min(0.01).max(1000).required().label("Mileage"),
    pph: Joi.number().required().label("Price per hour"),
    ppd: Joi.number().required().label("Price per day"),
    categoryId: Joi.number().allow(null).label("Category"),
  };

  doSubmit = async () => {
    this.setState({ isLoading: true });
    try {
      const { data } = await apiClient.post("/cars", this.state.data);
      this.props.navigate("/cars");
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
    return (
      <div className="car-form-container">
        <h1 className="car-form-header text-center">Add New Car</h1>
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

          <div className="d-grid mt-4">
            <button
              disabled={this.validate() || this.state.isLoading}
              className="car-form-btn btn btn-primary">
              {this.state.isLoading ?
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"></span>
                  Adding Car...
                </>
              : "Add Car"}
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

const AddCar = () => {
  const navigate = useNavigate();
  return <AddCarForm navigate={navigate} />;
};

export default AddCar;
