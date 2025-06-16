import React from "react";
import Form from "./form"; // This component now depends on your form.jsx
import Joi from "joi-browser";
import apiClient from "../helper/apiclient";
import { useNavigate } from "react-router-dom";
import "../style/carform.css"; // Your existing styles

class AddCarForm extends Form {
  state = {
    data: {
      model: "",
      seats: 0,
      color: "",
      image: "",
      mbw: 0,
      pph: 0,
      ppd: 0,
      categoryId: 0,
    },
    errors: {},
    categories: [],
    isLoading: false,
    isUploading: false,
    uploadError: null,
  };

  schema = {
    model: Joi.string().required().label("Model"),
    seats: Joi.number().integer().min(1).required().label("Seats"),
    color: Joi.string().required().label("Color"),
    image: Joi.string().uri({ allowRelative: true }).required().label("Image"),
    mbw: Joi.number().min(0).required().label("Max Baggage Weight"),
    pph: Joi.number().min(0).required().label("Price per Hour"),
    ppd: Joi.number().min(0).required().label("Price per Day"),
    categoryId: Joi.number().required().label("Category"),
  };

  async componentDidMount() {
    try {
      const { data: categories } = await apiClient.get("/categories");
      this.setState({ categories });
    } catch (error) {
      console.error("Failed to fetch categories", error);
    }
  }

  handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    this.setState({ isUploading: true, uploadError: null });

    try {
      const { data: response } = await apiClient.post(
        "/files/upload",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      const data = { ...this.state.data, image: response.url };
      const errors = { ...this.state.errors, image: null };
      this.setState({ data, errors, isUploading: false });
    } catch (error) {
      console.error("Image upload failed", error);
      this.setState({
        isUploading: false,
        uploadError: "Image upload failed.",
      });
    }
  };

  // --- THIS IS THE OVERRIDDEN AND CORRECTED FUNCTION ---
  // This function now correctly handles number conversion for this specific form
  handleChange = ({ currentTarget: input }) => {
    const errors = { ...this.state.errors };

    // Create a temporary object to validate against
    const dataToValidate = { [input.name]: input.value };
    if (input.type === "number" || input.name === "categoryId") {
      if (input.value !== "") {
        dataToValidate[input.name] = parseFloat(input.value);
      }
    }

    const errorMessage = this.validateProperty(dataToValidate);
    if (errorMessage) {
      errors[input.name] = errorMessage;
    } else {
      delete errors[input.name];
    }

    const data = { ...this.state.data };

    // Set the state with the correctly typed value
    data[input.name] = dataToValidate[input.name];

    this.setState({ data, errors });
  };

  doSubmit = async () => {
    this.setState({ isLoading: true });
    try {
      await apiClient.post("/cars", this.state.data);
      this.props.navigate("/cars");
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      this.setState({ isLoading: false });
    }
  };

  render() {
    return (
      <div className="bg-gray-50 pt-28 pb-12">
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg">
          <h1 className="text-3xl font-bold text-gray-800 text-center mb-8">
            Add New Car
          </h1>
          <form onSubmit={this.handleSubmit}>
            <div className="car-form-grid">
              <div className="form-column space-y-4">
                {this.renderInput("model", "Model", "text")}
                {this.renderInput("seats", "Seats", "number")}
                {this.renderInput("color", "Color", "text")}
                {this.renderSelect(
                  "categoryId",
                  "Category",
                  this.state.categories
                )}
              </div>
              <div className="form-column space-y-4">
                <div className="form-group">
                  <label
                    htmlFor="imageUpload"
                    className="block text-sm font-medium text-gray-700">
                    Car Image
                  </label>
                  <div className="mt-1 flex items-center">
                    {this.state.data.image && (
                      <img
                        src={`http://localhost:5117${this.state.data.image}`}
                        alt="Preview"
                        className="w-16 h-16 rounded-md object-cover mr-4"
                      />
                    )}
                    <label
                      htmlFor="image-upload"
                      className="relative cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50">
                      <span>
                        {this.state.isUploading ?
                          "Uploading..."
                        : "Upload a file"}
                      </span>
                      <input
                        id="image-upload"
                        name="image"
                        type="file"
                        className="sr-only"
                        onChange={this.handleImageUpload}
                        disabled={this.state.isUploading}
                      />
                    </label>
                  </div>
                  {this.state.errors.image && (
                    <p className="mt-2 text-sm text-red-600">
                      {this.state.errors.image}
                    </p>
                  )}
                  {this.state.uploadError && (
                    <p className="mt-2 text-sm text-red-600">
                      {this.state.uploadError}
                    </p>
                  )}
                </div>
                {this.renderInput("mbw", "Max Baggage (kg)", "number")}
                {this.renderInput("pph", "Price/Hour (€)", "number")}
                {this.renderInput("ppd", "Price/Day (€)", "number")}
              </div>
            </div>

            <div className="mt-8 pt-5 border-t border-gray-200 flex justify-end">
              <button
                type="button"
                onClick={() => this.props.navigate("/cars")}
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
                Cancel
              </button>
              {this.renderButton("Add Car")}
            </div>
          </form>
        </div>
      </div>
    );
  }
}

const AddCar = () => {
  const navigate = useNavigate();
  return <AddCarForm navigate={navigate} />;
};

export default AddCar;
