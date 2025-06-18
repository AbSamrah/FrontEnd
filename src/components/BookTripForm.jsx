import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../helper/apiclient";
import Joi from "joi-browser";
import PaymentGateway from "./PaymentGateway";

const BookTripForm = ({ trip }) => {
  const navigate = useNavigate();

  const [bookingDetails, setBookingDetails] = useState({
    numberOfTravelers: 1,
    bookingDate: new Date().toISOString().split("T")[0], // Default to today
  });
  const [totalPrice, setTotalPrice] = useState(0);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  // Define a validation schema for the form
  const schema = {
    numberOfTravelers: Joi.number()
      .min(1)
      .max(trip.maxGuests || 10) // Assuming a 'maxGuests' prop on the trip object
      .required()
      .label("Number of Travelers"),
    bookingDate: Joi.date().required().label("Booking Date"),
  };

  // Calculate total price whenever travelers or trip changes
  useEffect(() => {
    if (trip && trip.price) {
      setTotalPrice(trip.price * bookingDetails.numberOfTravelers);
    }
  }, [trip, bookingDetails.numberOfTravelers]);

  const validate = () => {
    const options = { abortEarly: false };
    const { error } = Joi.validate(bookingDetails, schema, options);
    if (!error) return null;

    const validationErrors = {};
    for (let item of error.details) {
      validationErrors[item.path[0]] = item.message;
    }
    return validationErrors;
  };

  const handleChange = ({ currentTarget: input }) => {
    const newDetails = { ...bookingDetails };
    newDetails[input.name] = input.value;
    setBookingDetails(newDetails);
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

  // This function is called after a successful PayPal transaction
  const handlePaymentSuccess = async (paypalDetails) => {
    setIsSubmitting(true);

    const finalBookingData = {
      tripId: trip.id,
      ...bookingDetails,
      totalPrice: totalPrice,
      paymentId: paypalDetails.id, // From PayPal
      paymentStatus: paypalDetails.status, // From PayPal
    };

    try {
      // We assume the endpoint is /tripbookings, similar to /carbookings
      const bookingResponse = await apiClient.post(
        "/tripbookings",
        finalBookingData
      );
      navigate("/payment-success", {
        state: {
          orderId: paypalDetails.id,
          bookingId: bookingResponse.data.id,
        },
      });
    } catch (err) {
      setErrors({
        form:
          err.response?.data?.message ||
          "Payment was successful, but booking failed. Please contact support.",
      });
      setShowPayment(false); // Go back to the form
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentError = (err) => {
    setErrors({
      form: "A PayPal error occurred. Please try again.",
    });
    setShowPayment(false);
  };

  const handlePaymentCancel = () => {
    navigate("/payment-cancel");
  };

  if (!trip) return null;

  return (
    <div className="mt-8 p-6 border border-gray-200 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Book This Trip</h2>

      {errors.form && (
        <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">
          {errors.form}
        </div>
      )}

      {!showPayment ? (
        <form onSubmit={handleProceedToPayment} className="space-y-4">
          <div>
            <label
              htmlFor="bookingDate"
              className="block text-sm font-medium text-gray-700"
            >
              Select Date
            </label>
            <input
              type="date"
              id="bookingDate"
              name="bookingDate"
              value={bookingDetails.bookingDate}
              onChange={handleChange}
              className={`mt-1 block w-full p-2 border ${
                errors.bookingDate ? "border-red-500" : "border-gray-300"
              } rounded-md`}
            />
            {errors.bookingDate && (
              <p className="text-red-500 text-xs mt-1">{errors.bookingDate}</p>
            )}
          </div>
          <div>
            <label
              htmlFor="numberOfTravelers"
              className="block text-sm font-medium text-gray-700"
            >
              Number of Travelers
            </label>
            <input
              type="number"
              id="numberOfTravelers"
              name="numberOfTravelers"
              value={bookingDetails.numberOfTravelers}
              onChange={handleChange}
              min="1"
              max={trip.maxGuests || 10}
              className={`mt-1 block w-full p-2 border ${
                errors.numberOfTravelers ? "border-red-500" : "border-gray-300"
              } rounded-md`}
            />
            {errors.numberOfTravelers && (
              <p className="text-red-500 text-xs mt-1">
                {errors.numberOfTravelers}
              </p>
            )}
          </div>
          <div className="pt-4">
            <p className="text-xl font-semibold">
              Total Price: €{totalPrice.toFixed(2)}
            </p>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg"
          >
            Proceed to Payment
          </button>
        </form>
      ) : (
        <div>
          {isSubmitting ? (
            <div className="text-center">
              <p>Finalizing booking...</p>
            </div>
          ) : (
            <PaymentGateway
              totalPrice={totalPrice}
              description={`Booking for ${trip.slug}`}
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentError={handlePaymentError}
              onPaymentCancel={handlePaymentCancel}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default BookTripForm;
