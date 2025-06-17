import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import apiClient from "../helper/apiclient";

const CarDetails = () => {
  const { id } = useParams();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCar = async () => {
      try {
        const response = await apiClient.get(`/cars/${id}`);
        setCar(response.data);
      } catch (err) {
        setError("Failed to load car details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchCar();
  }, [id]);

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="spinner"></div>
        <p className="mt-4 text-gray-600">Loading car details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md"
        role="alert"
      >
        <p>{error}</p>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="text-center py-16">
        <h3 className="text-xl font-semibold text-gray-800">Car not found.</h3>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <img
              src={
                `http://localhost:5117${car.image}` ||
                "https://placehold.co/600x400/e2e8f0/4a5568?text=No+Image"
              }
              alt={car.model}
              className="w-full h-auto object-cover rounded-lg shadow-lg"
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{car.model}</h1>
            <div className="mt-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Specifications
              </h2>
              <ul className="mt-2 text-gray-600 space-y-2">
                <li>
                  <i className="fas fa-palette mr-2"></i>Color: {car.color}
                </li>
                <li>
                  <i className="fas fa-user-friends mr-2"></i>Seats: {car.seats}
                </li>
                <li>
                  <i className="fas fa-briefcase mr-2"></i>Baggage Capacity:{" "}
                  {car.mbw} kg
                </li>
              </ul>
            </div>
            <div className="mt-6">
              <h2 className="text-xl font-semibold text-gray-800">Pricing</h2>
              <p className="text-2xl font-extrabold text-gray-900 mt-2">
                €{car.ppd.toFixed(2)}{" "}
                <span className="text-sm font-medium text-gray-500">/day</span>
              </p>
              <p className="text-lg font-bold text-gray-700">
                €{car.pph.toFixed(2)}{" "}
                <span className="text-sm font-medium text-gray-500">/hour</span>
              </p>
            </div>
            <div className="mt-6">
              <h2 className="text-xl font-semibold text-gray-800">Book Now</h2>
              <form className="mt-4 space-y-4">
                <div>
                  <label
                    htmlFor="start-date"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Start Date
                  </label>
                  <input
                    type="date"
                    id="start-date"
                    className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label
                    htmlFor="end-date"
                    className="block text-sm font-medium text-gray-700"
                  >
                    End Date
                  </label>
                  <input
                    type="date"
                    id="end-date"
                    className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    id="with-driver"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="with-driver"
                    className="ml-2 block text-sm text-gray-900"
                  >
                    Book with a driver
                  </label>
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
                >
                  Confirm Booking
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarDetails;
