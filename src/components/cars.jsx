import React, { useState, useEffect } from "react";
import apiClient from "../helper/apiclient";
import { Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "../style/cars.css";

const Cars = () => {
  const [allCars, setAllCars] = useState([]);
  const [availableCars, setAvailableCars] = useState([]);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState(null);

  // New state for date inputs and search status
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    // Decode JWT to get user role
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

    // Fetch initial data (all cars for admin, categories)
    const fetchData = async () => {
      setLoading(true);
      try {
        const [carsResponse, categoriesResponse] = await Promise.all([
          apiClient.get("/cars"), // Still fetch all for admin view initially
          apiClient.get("/categories"),
        ]);
        setAllCars(carsResponse.data);
        setCategories(categoriesResponse.data);
      } catch (error) {
        console.error("Failed to fetch initial data:", error);
        setError("Failed to load page data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle search for available cars
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      setError("Please select both a start and end date.");
      return;
    }
    if (new Date(startDate) >= new Date(endDate)) {
      setError("End date must be after the start date.");
      return;
    }

    setIsSearching(true);
    setError(null);
    setSearchPerformed(true);

    try {
      const params = {
        startDateTime: new Date(startDate).toISOString(),
        endDateTime: new Date(endDate).toISOString(),
      };
      const response = await apiClient.get("/cars/available", { params });
      setAvailableCars(response.data);
    } catch (error) {
      console.error("Failed to fetch available cars:", error);
      setError("Could not retrieve available cars. Please try again.");
      setAvailableCars([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Helper function to get category name
  const getCategoryName = (categoryId) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.title : "N/A";
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm("Are you sure you want to permanently delete this car?")
    ) {
      return;
    }
    // Logic to delete from both allCars and availableCars for UI consistency
    setAllCars(allCars.filter((c) => c.id !== id));
    setAvailableCars(availableCars.filter((c) => c.id !== id));

    try {
      await apiClient.delete(`/cars/${id}`);
    } catch (error) {
      setError("Failed to delete car. Reverting changes.");
      // Revert UI changes on error
      const [carsResponse] = await Promise.all([apiClient.get("/cars")]);
      setAllCars(carsResponse.data);
    }
  };

  const renderCarCard = (car) => (
    <div
      key={car.id}
      className="car-card bg-white rounded-xl shadow-lg overflow-hidden flex flex-col">
      <div className="relative">
        <img
          src={
            `http://localhost:5117${car.image}` ||
            "https://placehold.co/600x400/e2e8f0/4a5568?text=No+Image"
          }
          className="w-full h-56 object-cover"
          alt={car.model}
        />
      </div>
      <div className="p-6 flex-grow flex flex-col">
        <h2 className="text-xl font-bold text-gray-900">{car.model}</h2>
        <div className="flex-grow flex items-center text-sm text-gray-500 mt-2 space-x-4">
          <span>
            <i className="fas fa-user-friends mr-1"></i> {car.seats} Seats
          </span>
          <span>
            <i className="fas fa-palette mr-1"></i> {car.color}
          </span>
          <span>
            <i className="fas fa-briefcase mr-1"></i> {car.mbw} kg
          </span>
          <span>
            <i className="fas fa-tag mr-1"></i>{" "}
            {getCategoryName(car.categoryId)}
          </span>
        </div>
        <div className="mt-6 flex justify-between items-center">
          <p className="text-2xl font-extrabold text-gray-900">
            €{car.ppd.toFixed(2)}
            <span className="text-sm font-medium text-gray-500">/day</span>
          </p>
          {userRole === "Admin" ?
            <div className="flex space-x-2">
              <Link
                to={`/cars/update/${car.id}`}
                className="text-blue-600 hover:text-blue-800 p-2 rounded-full transition-colors">
                <i className="fas fa-pencil-alt"></i>
              </Link>
              <button
                onClick={() => handleDelete(car.id)}
                className="text-red-600 hover:text-red-800 p-2 rounded-full transition-colors">
                <i className="fas fa-trash-alt"></i>
              </button>
            </div>
          : <Link
              to={`/cars/rent/${car.id}`}
              state={{ startDate, endDate }} // Pass dates in navigation state
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
              Rent Now
            </Link>
          }
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-28">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Our Vehicle Fleet
            </h1>
            <p className="mt-1 text-md text-gray-500">
              Find the perfect car for your trip.
            </p>
          </div>
          {userRole === "Admin" && (
            <Link
              to="/cars/add"
              className="mt-4 sm:mt-0 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
              <i className="fas fa-plus mr-2"></i>
              Add New Car
            </Link>
          )}
        </div>

        {/* Date Selection Form for Customers */}
        {userRole !== "Admin" && (
          <form
            onSubmit={handleSearch}
            className="bg-white p-6 rounded-lg shadow-md mb-8 flex flex-col sm:flex-row gap-4 items-center">
            <div className="w-full">
              <label
                htmlFor="startDate"
                className="block text-sm font-medium text-gray-700">
                Start Date & Time
              </label>
              <input
                type="datetime-local"
                id="startDate"
                name="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div className="w-full">
              <label
                htmlFor="endDate"
                className="block text-sm font-medium text-gray-700">
                End Date & Time
              </label>
              <input
                type="datetime-local"
                id="endDate"
                name="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="w-full sm:w-auto mt-4 sm:mt-0 justify-center flex items-center px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300">
              {isSearching ?
                <div className="spinner-sm"></div>
              : <>
                  <i className="fas fa-search mr-2"></i>Search
                </>
              }
            </button>
          </form>
        )}

        {/* Loading and Error States */}
        {loading && (
          <div className="text-center py-16">
            <div className="spinner"></div>
            <p className="mt-4 text-gray-600">Loading fleet...</p>
          </div>
        )}
        {error && (
          <div
            className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md"
            role="alert">
            <p>{error}</p>
          </div>
        )}

        {/* Car Grid Display Logic */}
        {!loading && !error && (
          <div>
            {
              userRole === "Admin" ?
                // ADMIN VIEW: Show all cars
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {allCars.map(renderCarCard)}
                </div>
                // CUSTOMER VIEW: Show available cars after search
              : searchPerformed ?
                availableCars.length > 0 ?
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {availableCars.map(renderCarCard)}
                  </div>
                : <div className="text-center py-16">
                    <i className="fas fa-car-side text-6xl text-gray-300"></i>
                    <h3 className="mt-4 text-xl font-semibold text-gray-800">
                      No Cars Available
                    </h3>
                    <p className="mt-2 text-gray-500">
                      Please try different dates or check back later.
                    </p>
                  </div>

              : <div className="text-center py-16">
                  <i className="fas fa-calendar-alt text-6xl text-gray-300"></i>
                  <h3 className="mt-4 text-xl font-semibold text-gray-800">
                    Check Availability
                  </h3>
                  <p className="mt-2 text-gray-500">
                    Please select your desired dates to see available cars.
                  </p>
                </div>

            }
          </div>
        )}
      </div>
    </div>
  );
};

export default Cars;
