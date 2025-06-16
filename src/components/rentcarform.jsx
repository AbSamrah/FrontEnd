import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "../helper/apiclient";
import { jwtDecode } from "jwt-decode";
import Form from "./form";
import Joi from "joi-browser";

class RentCarForm extends Form {
  state = {
    data: {
      CarId: 0,
      PickupLocation: "",
      DropoffLocation: "",
      WithDriver: false,
      StartDateTime: "",
      EndDateTime: "",
      PaymentMethod: "Credit Card",
      NumberOfPassengers: 1,
    },
    errors: {},
    car: null,
    loading: true,
    error: null,
  };

  schema = {
    CarId: Joi.number().required().label("Car ID"),
    PickupLocation: Joi.string()
      .required()
      .min(3)
      .max(100)
      .label("Pickup Location"),
    DropoffLocation: Joi.string()
      .required()
      .min(3)
      .max(100)
      .label("Dropoff Location"),
    WithDriver: Joi.boolean(),
    StartDateTime: Joi.date().required().min("now").label("Start Date"),
    EndDateTime: Joi.date()
      .required()
      .min(Joi.ref("StartDateTime"))
      .label("End Date"),
    PaymentMethod: Joi.string()
      .required()
      .valid("Credit Card", "Debit Card", "PayPal", "Bank Transfer")
      .label("Payment Method"),
    NumberOfPassengers: Joi.number()
      .required()
      .min(1)
      .label("Number of Passengers"),
  };

  async componentDidMount() {
    const { id: carId } = this.props.params;

    try {
      // Fetch car details
      const { data: car } = await apiClient.get(`/cars/${carId}`);

      // Set initial form data
      this.setState({
        car,
        loading: false,
        data: {
          ...this.state.data,
          CarId: car.id,
          PickupLocation: car.location || "",
          DropoffLocation: car.location || "",
          NumberOfPassengers: Math.min(
            this.state.data.NumberOfPassengers,
            car.seats
          ),
        },
      });

      // Update schema for passenger limit
      this.schema.NumberOfPassengers = this.schema.NumberOfPassengers.max(
        car.seats
      );
    } catch (err) {
      this.setState({
        error: "Failed to load car details",
        loading: false,
      });
      console.error("Error fetching car:", err);
    }
  }

  doSubmit = async () => {
    try {
      // First create the base booking
      const bookingResponse = await apiClient.post("/bookings", {
        StartDateTime: this.state.data.StartDateTime,
        EndDateTime: this.state.data.EndDateTime,
        NumberOfPassengers: this.state.data.NumberOfPassengers,
      });

      // Then create the car booking with the returned booking ID
      const carBookingData = {
        ...this.state.data,
        BookingId: bookingResponse.data.id,
      };

      await apiClient.post("/carbookings", carBookingData);

      // Redirect to success page or bookings list
      this.props.navigate("/bookings");
    } catch (err) {
      console.error("Booking error:", err);
      this.setState({
        error:
          err.response?.data?.message ||
          "Failed to create booking. Please try again.",
      });
    }
  };

  renderCarDetail(label, value) {
    return (
      <div className="mb-3">
        <label className="form-label">{label}</label>
        <input
          type="text"
          className="form-control bg-light"
          value={value}
          readOnly
          style={{ cursor: "default" }}
        />
      </div>
    );
  }

  render() {
    const { car, loading, error } = this.state;

    if (loading) {
      return (
        <div className="text-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading car details...</p>
        </div>
      );
    }

    if (!car) {
      return (
        <div className="alert alert-danger">{error || "Car not found"}</div>
      );
    }

    const paymentOptions = [
      { id: "Credit Card", title: "Credit Card" },
      { id: "Debit Card", title: "Debit Card" },
      { id: "PayPal", title: "PayPal" },
      { id: "Bank Transfer", title: "Bank Transfer" },
    ];

    return (
      <div className="container py-4">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card shadow-sm">
              <div className="card-header bg-primary text-white">
                <h2 className="mb-0">Rent {car.model}</h2>
              </div>
              <div className="card-body">
                {error && (
                  <div className="alert alert-danger alert-dismissible fade show mb-4">
                    {error}
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => this.setState({ error: null })}></button>
                  </div>
                )}

                <form onSubmit={this.handleSubmit}>
                  <div className="row mb-4">
                    <div className="col-md-6">
                      <h4>Car Details</h4>
                      {this.renderCarDetail("Model", car.model)}
                      {this.renderCarDetail("Seats", car.seats)}
                      {this.renderCarDetail(
                        "Price per Day",
                        `€${car.ppd.toFixed(2)}`
                      )}
                      {this.renderCarDetail("Color", car.color)}
                      {this.renderCarDetail("Mileage", `${car.mbw} km`)}
                    </div>
                    <div className="col-md-6">
                      <h4>Booking Details</h4>

                      {this.renderInput("PickupLocation", "Pickup Location")}
                      {this.renderInput("DropoffLocation", "Drop-off Location")}
                      {this.renderInput(
                        "StartDateTime",
                        "Start Date & Time",
                        "datetime-local"
                      )}
                      {this.renderInput(
                        "EndDateTime",
                        "End Date & Time",
                        "datetime-local"
                      )}
                      {this.renderInput(
                        "NumberOfPassengers",
                        `Number of Passengers (max ${car.seats})`,
                        "number",
                        { min: 1, max: car.seats }
                      )}

                      <div className="mb-3 form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          name="WithDriver"
                          checked={this.state.data.WithDriver}
                          onChange={this.handleChange}
                          id="withDriver"
                        />
                        <label
                          className="form-check-label"
                          htmlFor="withDriver">
                          Rent with driver
                        </label>
                      </div>

                      {this.renderSelect(
                        "PaymentMethod",
                        "Payment Method",
                        paymentOptions,
                        this.state.errors.PaymentMethod
                      )}
                    </div>
                  </div>

                  <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                    <button
                      type="button"
                      className="btn btn-outline-secondary me-md-2"
                      onClick={() => this.props.navigate(-1)}>
                      Cancel
                    </button>
                    {this.renderButton("Confirm Booking")}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

// Wrap the class component to use hooks
export default function RentCarFormWrapper(props) {
  const params = useParams();
  const navigate = useNavigate();
  return <RentCarForm {...props} params={params} navigate={navigate} />;
}
