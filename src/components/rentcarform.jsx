import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import apiClient from "../helper/apiclient";
import Joi from "joi-browser";
import PaymentGateway from "./PaymentGateway"; // Import the new component

const RentCarForm = () => {
  const { id: carId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const { startDate, endDate } = location.state || {};

  const [car, setCar] = useState(null);
  const [totalPrice, setTotalPrice] = useState(0);
  const [numberOfPassengers, setNumberOfPassengers] = useState(1);
  const [withDriver, setWithDriver] = useState(false);
  const [pickupLocation, setPickupLocation] = useState("");
  const [dropoffLocation, setDropoffLocation] = useState("");

  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  const schema = {
    numberOfPassengers: Joi.number()
      .min(1)
      .max(car ? car.seats : 1)
      .required()
      .label("Number of Passengers"),
    pickupLocation: Joi.string()
      .min(3)
      .max(100)
      .required()
      .label("Pickup Location"),
    dropoffLocation: Joi.string()
      .min(3)
      .max(100)
      .required()
      .label("Dropoff Location"),
  };

  useEffect(() => {
    if (!startDate || !endDate) {
      navigate("/cars");
      return;
    }

    const fetchCarData = async () => {
      try {
        const carResponse = await apiClient.get(`/cars/${carId}`);
        const carData = carResponse.data;
        setCar(carData);
        setPickupLocation(carData.location || "");
        setDropoffLocation(carData.location || "");

        const start = new Date(startDate);
        const end = new Date(endDate);
        const timeDiff = end.getTime() - start.getTime();
        const days = Math.ceil(timeDiff / (1000 * 3600 * 24));
        setTotalPrice(days > 0 ? days * carData.ppd : carData.ppd);
      } catch (err) {
        setErrors({ form: "Failed to load car details. Please try again." });
      } finally {
        setLoading(false);
      }
    };

    fetchCarData();
  }, [carId, startDate, endDate, navigate]);

  const validate = () => {
    const dataToValidate = {
      numberOfPassengers,
      pickupLocation,
      dropoffLocation,
    };
    const options = { abortEarly: false };
    const { error } = Joi.validate(dataToValidate, schema, options);
    if (!error) return null;
    const validationErrors = {};
    for (let item of error.details) {
      validationErrors[item.path[0]] = item.message;
    }
    return validationErrors;
  };

  const handleProceedToPayment = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (validationErrors) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setShowPayment(true);
  };

  // This function is now the callback for a successful payment.
  const handlePaymentSuccess = async (paypalDetails) => {
    setIsSubmitting(true);
    const bookingData = {
      carId: parseInt(carId, 10),
      pickupLocation,
      dropoffLocation,
      withDriver,
      numberOfPassengers: parseInt(numberOfPassengers, 10),
      startDateTime: new Date(startDate).toISOString(),
      endDateTime: new Date(endDate).toISOString(),
      paymentId: paypalDetails.id,
      paymentStatus: paypalDetails.status,
      totalPrice: totalPrice,
    };

    try {
      const bookingResponse = await apiClient.post("/carbookings", bookingData);
      navigate("/payment-success", {
        state: {
          orderId: paypalDetails.id,
          bookingId: bookingResponse.data.id,
        },
      });
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        "Your payment was successful, but we failed to create the booking. Please contact support.";
      setErrors({ form: errorMessage });
      setShowPayment(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Callback for payment errors.
  const handlePaymentError = (err) => {
    setErrors({
      form: "An error occurred with the PayPal transaction. Please try again.",
    });
    setShowPayment(false);
  };

  // Callback for payment cancellation.
  const handlePaymentCancel = () => {
    navigate("/payment-cancel");
  };

  if (loading)
    return (
      <div className="text-center py-40">
        <div className="spinner"></div>
      </div>
    );

  return (
    <div className="bg-gray-50 min-h-screen py-12 pt-28">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Rent: {car?.model}
            </h1>
            <p className="text-gray-500 mb-6">
              {showPayment ?
                "Final Step: Complete your payment"
              : "Confirm your details to proceed."}
            </p>

            {errors.form && (
              <div className="bg-red-100 text-red-700 p-4 rounded-md mb-6">
                {errors.form}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <img
                  src={`http://localhost:5117${car?.image}`}
                  alt={car?.model}
                  className="rounded-lg mb-4 w-full h-56 object-cover"
                />
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  Booking Summary
                </h3>
                <div className="space-y-2 text-gray-600">
                  <div className="flex justify-between">
                    <span>From:</span>{" "}
                    <span className="font-medium">
                      {new Date(startDate).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>To:</span>{" "}
                    <span className="font-medium">
                      {new Date(endDate).toLocaleString()}
                    </span>
                  </div>
                  <hr className="my-2" />
                  <div className="flex justify-between text-2xl font-bold text-gray-900">
                    <span>Total Price:</span>
                    <span>€{totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {!showPayment ?
                  <form onSubmit={handleProceedToPayment}>
                    <div>
                      <label
                        htmlFor="pickupLocation"
                        className="block text-sm font-medium text-gray-700">
                        Pickup Location
                      </label>
                      <input
                        type="text"
                        id="pickupLocation"
                        value={pickupLocation}
                        onChange={(e) => setPickupLocation(e.target.value)}
                        className={`mt-1 block w-full px-3 py-2 bg-white border ${errors.pickupLocation ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm`}
                      />
                      {errors.pickupLocation && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.pickupLocation}
                        </p>
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor="dropoffLocation"
                        className="block text-sm font-medium text-gray-700">
                        Dropoff Location
                      </label>
                      <input
                        type="text"
                        id="dropoffLocation"
                        value={dropoffLocation}
                        onChange={(e) => setDropoffLocation(e.target.value)}
                        className={`mt-1 block w-full px-3 py-2 bg-white border ${errors.dropoffLocation ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm`}
                      />
                      {errors.dropoffLocation && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.dropoffLocation}
                        </p>
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor="numberOfPassengers"
                        className="block text-sm font-medium text-gray-700">
                        Number of Passengers (Max: {car?.seats})
                      </label>
                      <input
                        type="number"
                        id="numberOfPassengers"
                        value={numberOfPassengers}
                        onChange={(e) => setNumberOfPassengers(e.target.value)}
                        min="1"
                        max={car?.seats}
                        className={`mt-1 block w-full px-3 py-2 bg-white border ${errors.numberOfPassengers ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm`}
                      />
                      {errors.numberOfPassengers && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.numberOfPassengers}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center">
                      <input
                        id="withDriver"
                        type="checkbox"
                        checked={withDriver}
                        onChange={(e) => setWithDriver(e.target.checked)}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                      <label
                        htmlFor="withDriver"
                        className="ml-2 block text-sm text-gray-900">
                        Include Driver
                      </label>
                    </div>
                    <div className="mt-8 pt-5 border-t border-gray-200 flex justify-end">
                      <button
                        type="button"
                        onClick={() => navigate("/cars")}
                        className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="ml-3 inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                        Proceed to Payment
                      </button>
                    </div>
                  </form>
                : <div>
                    {isSubmitting ?
                      <div className="text-center">
                        <p>Finalizing your booking...</p>
                        <div className="spinner"></div>
                      </div>
                    : <PaymentGateway
                        totalPrice={totalPrice}
                        description={`Rental of ${car.model}`}
                        onPaymentSuccess={handlePaymentSuccess}
                        onPaymentError={handlePaymentError}
                        onPaymentCancel={handlePaymentCancel}
                      />
                    }
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const RentCarFormWrapper = () => <RentCarForm />;

export default RentCarFormWrapper;
