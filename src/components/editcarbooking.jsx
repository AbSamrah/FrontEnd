import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "../helper/apiclient";

// Helper function to format date for input
const formatDateForInput = (isoDate) => {
  if (!isoDate) return "";
  const date = new Date(isoDate);
  const pad = (num) => num.toString().padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const EditCarBooking = () => {
  const { id } = useParams(); // This will be the BookingId
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [carBooking, setCarBooking] = useState(null);
  const [formData, setFormData] = useState({
    // Fields for Booking
    startDateTime: "",
    endDateTime: "",
    status: 0,
    numberOfPassengers: 1,
    // Fields for CarBooking
    pickupLocation: "",
    dropoffLocation: "",
    withDriver: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBookingData = async () => {
      try {
        // Fetch the core booking details
        const bookingResponse = await apiClient.get(`/bookings/${id}`);
        const coreBookingData = bookingResponse.data;

        // Fetch the car-specific details using the bookingId
        const carBookingResponse = await apiClient.get(`/carbookings/${id}`);
        const carBookingData = carBookingResponse.data;

        setBooking(coreBookingData);
        setCarBooking(carBookingData);

        // Populate the form with data from both sources
        setFormData({
          startDateTime: formatDateForInput(coreBookingData.startDateTime),
          endDateTime: formatDateForInput(coreBookingData.endDateTime),
          status: coreBookingData.status,
          numberOfPassengers: coreBookingData.numberOfPassengers,
          pickupLocation: carBookingData.pickupLocation,
          dropoffLocation: carBookingData.dropoffLocation,
          withDriver: carBookingData.withDriver,
        });
      } catch (err) {
        console.error("Failed to fetch booking data:", err);
        setError("Failed to load booking details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchBookingData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. Prepare and send the DTO for the core booking update
      const updateBookingDto = {
        id: parseInt(id, 10),
        startDateTime: new Date(formData.startDateTime).toISOString(),
        endDateTime: new Date(formData.endDateTime).toISOString(),
        numberOfPassengers: parseInt(formData.numberOfPassengers, 10),
        status: parseInt(formData.status, 10),
      };
      await apiClient.put(`/bookings/${id}`, updateBookingDto);

      // 2. Prepare and send the DTO for the car-specific booking update
      const updateCarBookingDto = {
        pickupLocation: formData.pickupLocation,
        dropoffLocation: formData.dropoffLocation,
        withDriver: formData.withDriver,
      };
      await apiClient.put(`/carbookings/${id}`, updateCarBookingDto);

      // 3. Navigate back on success
      navigate("/car-bookings");
    } catch (err) {
      console.error("Failed to update booking:", err);
      setError(
        "An error occurred while saving the booking. Please check the details and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="text-center py-40">
        <div className="spinner"></div>
      </div>
    );
  if (error)
    return (
      <div className="bg-red-100 text-red-700 p-4 rounded-md text-center">
        {error}
      </div>
    );

  return (
    <div className="bg-gray-50 min-h-screen py-12 pt-28">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg">
          <h1 className="text-3xl font-bold text-gray-800 text-center mb-8">
            Edit Car Booking #{id}
          </h1>
          <form onSubmit={handleSubmit} noValidate>
            <div className="space-y-6">
              {/* Booking Details */}
              <div>
                <label
                  htmlFor="startDateTime"
                  className="block text-sm font-medium text-gray-700">
                  Start Date & Time
                </label>
                <input
                  type="datetime-local"
                  name="startDateTime"
                  value={formData.startDateTime}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label
                  htmlFor="endDateTime"
                  className="block text-sm font-medium text-gray-700">
                  End Date & Time
                </label>
                <input
                  type="datetime-local"
                  name="endDateTime"
                  value={formData.endDateTime}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label
                  htmlFor="numberOfPassengers"
                  className="block text-sm font-medium text-gray-700">
                  Number of Passengers
                </label>
                <input
                  type="number"
                  name="numberOfPassengers"
                  value={formData.numberOfPassengers}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label
                  htmlFor="status"
                  className="block text-sm font-medium text-gray-700">
                  Booking Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md">
                  <option value="0">Pending</option>
                  <option value="1">Confirmed</option>
                  <option value="2">Cancelled</option>
                </select>
              </div>

              {/* CarBooking Details */}
              <hr />
              <div>
                <label
                  htmlFor="pickupLocation"
                  className="block text-sm font-medium text-gray-700">
                  Pickup Location
                </label>
                <input
                  type="text"
                  name="pickupLocation"
                  value={formData.pickupLocation}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label
                  htmlFor="dropoffLocation"
                  className="block text-sm font-medium text-gray-700">
                  Dropoff Location
                </label>
                <input
                  type="text"
                  name="dropoffLocation"
                  value={formData.dropoffLocation}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="flex items-center">
                <input
                  id="withDriver"
                  name="withDriver"
                  type="checkbox"
                  checked={formData.withDriver}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <label
                  htmlFor="withDriver"
                  className="ml-2 block text-sm text-gray-900">
                  With Driver
                </label>
              </div>
            </div>
            <div className="mt-8 pt-5 border-t border-gray-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate("/car-bookings")}
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300">
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditCarBooking;
