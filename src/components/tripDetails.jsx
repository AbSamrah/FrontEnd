import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "../helper/apiclient";
import { jwtDecode } from "jwt-decode";

const TripDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [bookingType, setBookingType] = useState("public");
  const [seats, setSeats] = useState(1);
  const [carId, setCarId] = useState("");
  const [withDriver, setWithDriver] = useState(false);
  const [userRole, setUserRole] = useState(null);

  // New state for handling dates and available cars
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [availableCars, setAvailableCars] = useState([]);
  const [isFetchingCars, setIsFetchingCars] = useState(false);

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

  // Fetch available cars when dates change
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
          setAvailableCars(response.data.cars); // Assuming the backend returns paginated response
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

  const handleBooking = () => {
    if (bookingType === "private" && (!startDate || !endDate)) {
      alert("Please select a start and end date for your trip.");
      return;
    }

    const bookingDetails = {
      tripId: trip.id,
      bookingType,
      seats,
      carId,
      withDriver,
      startDate,
      endDate,
    };
    console.log("Booking Details:", bookingDetails);
    // Here you would navigate to a payment page or handle the booking logic
    setShowModal(false);
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
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700"
        >
          Book Now
        </button>
      )}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-xl w-1/2">
            <h2 className="text-2xl font-bold mb-4">Choose Booking Type</h2>
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
                <span className="ml-2">Public</span>
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
                <span className="ml-2">Private</span>
              </label>
            </div>

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
                  </div>
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="seats"
                    className="block text-gray-700 font-bold mb-2"
                  >
                    Number of Seats
                  </label>
                  <input
                    type="number"
                    id="seats"
                    value={seats}
                    onChange={(e) => setSeats(e.target.value)}
                    min="1"
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="car"
                    className="block text-gray-700 font-bold mb-2"
                  >
                    Add a Car (Optional)
                  </label>
                  <select
                    id="car"
                    value={carId}
                    onChange={(e) => setCarId(e.target.value)}
                    className="w-full p-2 border rounded"
                    disabled={isFetchingCars || !startDate || !endDate}
                  >
                    <option value="">
                      {isFetchingCars
                        ? "Loading available cars..."
                        : "Select a car"}
                    </option>
                    {availableCars.length > 0
                      ? availableCars.map((car) => (
                          <option key={car.id} value={car.id}>
                            {car.model} - €{car.ppd}/day
                          </option>
                        ))
                      : startDate &&
                        endDate &&
                        !isFetchingCars && (
                          <option value="" disabled>
                            No cars available for these dates
                          </option>
                        )}
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
                      <span className="ml-2">
                        With Driver (additional cost)
                      </span>
                    </label>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded mr-2"
              >
                Cancel
              </button>
              <button
                onClick={handleBooking}
                className="bg-blue-600 text-white font-bold py-2 px-4 rounded"
              >
                Proceed to Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripDetails;
