import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "../helper/apiclient";
import { jwtDecode } from "jwt-decode";
import Joi from "joi-browser";
import PaymentGateway from "./PaymentGateway"; // Import the PaymentGateway

const TripDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // --- EXISTING STATE ---
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [bookingType, setBookingType] = useState("public");
  const [seats, setSeats] = useState(1);
  const [carId, setCarId] = useState("");
  const [withDriver, setWithDriver] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [availableCars, setAvailableCars] = useState([]);
  const [isFetchingCars, setIsFetchingCars] = useState(false);

  // --- NEW STATE FOR PAYMENT FLOW ---
  const [totalPrice, setTotalPrice] = useState(0);
  const [showPayment, setShowPayment] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false); // <<< THIS LINE WAS ADDED

  // --- VALIDATION SCHEMA ---
  const schema = {
    seats: Joi.number()
      .min(1)
      .max(trip?.maxGuests || 10) // Assuming a 'maxGuests' prop
      .required()
      .label("Number of Seats"),
    startDate: Joi.string().when("bookingType", {
      is: "private",
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),
    endDate: Joi.string().when("bookingType", {
      is: "private",
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),
    carId: Joi.string().optional().allow(""),
    withDriver: Joi.boolean().optional(),
    bookingType: Joi.string().required(),
  };

  // --- FETCH USER AND TRIP DETAILS (UNCHANGED) ---
  useEffect(() => {
    try {
      const jwt = localStorage.getItem("token");
      if (jwt) {
        const user = jwtDecode(jwt);
        setUserRole(
          user["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]
        );
      }
    } catch (ex) {
      console.error("Failed to decode JWT", ex);
    }

    const fetchTripDetails = async () => {
      try {
        const tripResponse = await apiClient.get(`/trips/${id}`);
        setTrip(tripResponse.data);
      } catch (err) {
        setError("Failed to load trip details.");
      } finally {
        setLoading(false);
      }
    };

    fetchTripDetails();
  }, [id]);

  // --- FETCH AVAILABLE CARS (UNCHANGED) ---
  useEffect(() => {
    if (
      bookingType === "private" &&
      startDate &&
      endDate &&
      new Date(startDate) < new Date(endDate)
    ) {
      const fetchAvailableCars = async () => {
        setIsFetchingCars(true);
        try {
          const params = {
            startDateTime: new Date(startDate).toISOString(),
            endDateTime: new Date(endDate).toISOString(),
          };
          const response = await apiClient.get("/cars/available", { params });
          setAvailableCars(response.data.cars);
        } catch (err) {
          setError("Failed to load available cars. Please try again.");
          setAvailableCars([]);
        } finally {
          setIsFetchingCars(false);
        }
      };

      fetchAvailableCars();
    } else {
      setAvailableCars([]);
    }
  }, [startDate, endDate, bookingType]);

  // --- NEW: CALCULATE TOTAL PRICE ---
  useEffect(() => {
    if (!trip) return;

    let price = 0;
    if (bookingType === "public") {
      price = (trip.price || 50) * seats;
    } else if (bookingType === "private" && carId && startDate && endDate) {
      const selectedCar = availableCars.find((c) => c.id === parseInt(carId));
      if (selectedCar) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const timeDiff = end.getTime() - start.getTime();
        const days = Math.ceil(timeDiff / (1000 * 3600 * 24));
        price = days > 0 ? days * selectedCar.ppd : selectedCar.ppd;
        if (withDriver) {
          price += days * 50;
        }
      }
    }
    setTotalPrice(price);
  }, [
    bookingType,
    seats,
    carId,
    startDate,
    endDate,
    withDriver,
    trip,
    availableCars,
  ]);

  const validateForm = () => {
    const dataToValidate = {
      bookingType,
      seats,
      startDate,
      endDate,
      carId,
      withDriver,
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

  const handleProceedToPayment = () => {
    const validationErrors = validateForm();
    if (validationErrors) {
      setFormErrors(validationErrors);
      return;
    }
    setFormErrors({});
    setShowPayment(true);
  };

  const handlePaymentSuccess = async (paypalDetails) => {
    setIsSubmitting(true);

    const bookingData = {
      tripId: trip.id,
      bookingType,
      seats: parseInt(seats, 10),
      carId: carId ? parseInt(carId, 10) : null,
      withDriver,
      startDate:
        bookingType === "private" ? new Date(startDate).toISOString() : null,
      endDate:
        bookingType === "private" ? new Date(endDate).toISOString() : null,
      totalPrice,
      paymentId: paypalDetails.id,
      paymentStatus: paypalDetails.status,
    };

    try {
      const response = await apiClient.post("/tripbookings", bookingData);
      navigate("/payment-success", {
        state: { orderId: paypalDetails.id, bookingId: response.data.id },
      });
    } catch (err) {
      setFormErrors({
        form: "Your payment was successful, but the booking failed on our server. Please contact support.",
      });
      setShowPayment(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentError = () => {
    setFormErrors({ form: "An error occurred with PayPal. Please try again." });
    setShowPayment(false);
  };

  const handlePaymentCancel = () => {
    setShowModal(false);
    setShowPayment(false);
  };

  if (loading) return <div className="text-center py-16">Loading...</div>;
  if (error)
    return <div className="text-red-500 text-center py-16">{error}</div>;
  if (!trip) return <div className="text-center py-16">Trip not found.</div>;

  return (
    <div className="container mx-auto px-4 py-12 pt-28">
      <h1 className="text-3xl font-bold mb-4">{trip.slug}</h1>
      <p className="mb-8">{trip.description}</p>
      {userRole === "Customer" && (
        <button
          onClick={() => {
            setShowModal(true);
            setShowPayment(false);
            setFormErrors({});
          }}
          className="bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700"
        >
          Book Now
        </button>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg">
            {!showPayment ? (
              <>
                <h2 className="text-2xl font-bold mb-4">Choose Booking Type</h2>
                {formErrors.form && (
                  <div className="text-red-500 mb-4">{formErrors.form}</div>
                )}
                <div className="mb-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="bookingType"
                      value="public"
                      checked={bookingType === "public"}
                      onChange={() => setBookingType("public")}
                      className="form-radio"
                    />
                    <span className="ml-2">Public (per person)</span>
                  </label>
                  <label className="inline-flex items-center ml-6">
                    <input
                      type="radio"
                      name="bookingType"
                      value="private"
                      checked={bookingType === "private"}
                      onChange={() => setBookingType("private")}
                      className="form-radio"
                    />
                    <span className="ml-2">Private (with car)</span>
                  </label>
                </div>

                {bookingType === "public" && (
                  <div className="mb-4">
                    <label
                      htmlFor="seats"
                      className="block text-gray-700 font-bold mb-2"
                    >
                      Number of Travelers
                    </label>
                    <input
                      type="number"
                      id="seats"
                      value={seats}
                      onChange={(e) => setSeats(e.target.value)}
                      min="1"
                      className="w-full p-2 border rounded"
                    />
                    {formErrors.seats && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.seats}
                      </p>
                    )}
                  </div>
                )}

                {bookingType === "private" && (
                  <div>
                    <div className="flex gap-4 mb-4">
                      <div className="w-1/2">
                        <label
                          htmlFor="start-date"
                          className="block text-gray-700 font-bold mb-2"
                        >
                          Start Date
                        </label>
                        <input
                          type="datetime-local"
                          id="start-date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="w-full p-2 border rounded"
                        />
                        {formErrors.startDate && (
                          <p className="text-red-500 text-xs mt-1">
                            {formErrors.startDate}
                          </p>
                        )}
                      </div>
                      <div className="w-1/2">
                        <label
                          htmlFor="end-date"
                          className="block text-gray-700 font-bold mb-2"
                        >
                          End Date
                        </label>
                        <input
                          type="datetime-local"
                          id="end-date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="w-full p-2 border rounded"
                        />
                        {formErrors.endDate && (
                          <p className="text-red-500 text-xs mt-1">
                            {formErrors.endDate}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="mb-4">
                      <label
                        htmlFor="car"
                        className="block text-gray-700 font-bold mb-2"
                      >
                        Add a Car
                      </label>
                      <select
                        id="car"
                        value={carId}
                        onChange={(e) => setCarId(e.target.value)}
                        className="w-full p-2 border rounded"
                        disabled={isFetchingCars || !startDate || !endDate}
                      >
                        <option value="">
                          {isFetchingCars ? "Loading cars..." : "Select a car"}
                        </option>
                        {availableCars.map((car) => (
                          <option key={car.id} value={car.id}>
                            {car.model} - €{car.ppd}/day
                          </option>
                        ))}
                      </select>
                    </div>
                    {carId && (
                      <div className="mb-4">
                        <label className="inline-flex items-center">
                          <input
                            type="checkbox"
                            checked={withDriver}
                            onChange={(e) => setWithDriver(e.target.checked)}
                            className="form-checkbox"
                          />
                          <span className="ml-2">With Driver</span>
                        </label>
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-4 border-t pt-4">
                  <h3 className="text-xl font-bold">
                    Total: €{totalPrice.toFixed(2)}
                  </h3>
                </div>

                <div className="flex justify-end mt-6">
                  <button
                    onClick={() => setShowModal(false)}
                    className="bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded mr-2"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleProceedToPayment}
                    className="bg-blue-600 text-white font-bold py-2 px-4 rounded"
                    disabled={totalPrice <= 0}
                  >
                    Proceed to Payment
                  </button>
                </div>
              </>
            ) : (
              <>
                {isSubmitting ? (
                  <p>Processing your booking...</p>
                ) : (
                  <PaymentGateway
                    totalPrice={totalPrice}
                    description={`Booking for ${trip.slug}`}
                    onPaymentSuccess={handlePaymentSuccess}
                    onPaymentError={handlePaymentError}
                    onPaymentCancel={handlePaymentCancel}
                  />
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TripDetails;
