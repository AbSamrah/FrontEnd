import React from "react";
import Form from "./form";
import Joi from "joi-browser";
import apiClient from "../helper/apiclient";
import { useNavigate, useParams } from "react-router-dom";
// No longer need to import carform.css
// import "../style/carform.css";

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
      categoryId: "",
    },
    errors: {},
    categories: [],
    isLoading: false,
    isFetching: true,
    isUploading: false,
  };

  schema = {
    id: Joi.number(),
    model: Joi.string().required().label("Model"),
    seats: Joi.number().min(1).max(40).required().label("Seats"),
    color: Joi.string().required().label("Color"),
    image: Joi.string().required().label("Image"),
    mbw: Joi.number().min(0).required().label("Mileage"),
    pph: Joi.number().min(0).required().label("Price per hour"),
    ppd: Joi.number().min(0).required().label("Price per day"),
    categoryId: Joi.number().required().label("Category"),
  };

  async componentDidMount() {
    const { id } = this.props.params;
    try {
      const { data: carData } = await apiClient.get(`/cars/${id}`);
      const { data: categories } = await apiClient.get("/categories");
      this.setState({ data: carData, categories, isFetching: false });
    } catch (error) {
      if (error.response && error.response.status === 404) {
        this.props.navigate("/not-found");
      }
      this.setState({ isFetching: false });
    }
  }

  handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    this.setState({ isUploading: true });

    try {
      const { data: response } = await apiClient.post(
        "/files/upload",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      const data = { ...this.state.data, image: response.url };
      const errors = { ...this.state.errors };
      delete errors.image;

      this.setState({ data, errors });
    } catch (error) {
      const errors = { ...this.state.errors };
      errors.image = "Image upload failed. Please try again.";
      this.setState({ errors });
    } finally {
      this.setState({ isUploading: false });
    }
  };

  doSubmit = async () => {
    this.setState({ isLoading: true });
    try {
      const { id } = this.props.params;
      await apiClient.put(`/cars/${id}`, this.state.data);
      this.props.navigate("/cars", { replace: true });
    } catch (error) {
      if (error.response && error.response.status === 400) {
        const errors = { ...this.state.errors };
        errors.form = "There was an error updating the form.";
        this.setState({ errors });
      }
    } finally {
      this.setState({ isLoading: false });
    }
  };

  renderImageUpload() {
    const { data, errors, isUploading } = this.state;

    return (
      <div className="mb-3">
        <label className="form-label">Car Image</label>
        <div className="d-flex align-items-center">
          {data.image && (
            <img
              src={`http://localhost:5117${data.image}`}
              alt="Preview"
              className="img-thumbnail me-3"
              style={{ width: "100px", height: "100px" }}
            />
          )}
          <div>
            <input
              type="file"
              className="form-control"
              onChange={this.handleImageUpload}
              disabled={isUploading}
              accept="image/*"
            />
            {errors.image && (
              <div className="alert alert-danger mt-2">{errors.image}</div>
            )}
            {isUploading && (
              <div className="mt-2 text-primary">Uploading image...</div>
            )}
          </div>
        </div>
      </div>
    );
  }

  render() {
    if (this.state.isFetching) {
      return (
        <div className="bg-gray-50 pt-28 pb-12 text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-gray-50 pt-28 pb-12">
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg">
          <h1 className="text-3xl font-bold text-gray-800 text-center mb-8">
            Update Car
          </h1>
          <form onSubmit={this.handleSubmit} noValidate>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              {/* Left Column */}
              <div className="space-y-6">
                {this.renderInput("model", "Model", "text")}
                {this.renderInput("seats", "Number of Seats", "number")}
                {this.renderInput("color", "Color", "text")}
                {this.renderSelect(
                  "categoryId",
                  "Category",
                  this.state.categories
                )}
              </div>
              {/* Right Column */}
              <div className="space-y-6">
                {this.renderImageUpload()}

                {this.renderInput("mbw", "Max Baggage Weight (kg)", "number")}
                {this.renderInput("pph", "Price per Hour (€)", "number")}
                {this.renderInput("ppd", "Price per Day (€)", "number")}
              </div>
            </div>

            <div className="d-grid gap-2 d-md-flex justify-content-md-end mt-4">
              <button
                type="button"
                className="btn btn-outline-danger me-md-2"
                onClick={() => this.props.navigate("/cars")}
              >
                Cancel
              </button>
              <button
                disabled={
                  this.validate() ||
                  this.state.isLoading ||
                  this.state.isUploading
                }
                className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 "
              >
                {this.state.isLoading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Updating...
                  </>
                ) : (
                  "Update Car"
                )}
              </button>
            </div>
          </form>
        </div>
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
