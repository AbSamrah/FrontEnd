import React, { useState, useEffect } from "react";
import apiClient from "../helper/apiclient";
import { Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "../style/cars.css";

const Cars = () => {
  const [cars, setCars] = useState([]);
  const [categories, setCategories] = useState([]); // State for categories
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);

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

    // Fetch both cars and categories
    const fetchData = async () => {
      try {
        const [carsResponse, categoriesResponse] = await Promise.all([
          apiClient.get("/cars"),
          apiClient.get("/categories"),
        ]);
        setCars(carsResponse.data);
        setCategories(categoriesResponse.data);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setError("Failed to load data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

    const originalCars = [...cars];
    setCars(cars.filter((c) => c.id !== id));

    try {
      await apiClient.delete(`/cars/${id}`);
    } catch (error) {
      console.error("Delete error:", error);
      setError("Failed to delete car. Please refresh and try again.");
      setCars(originalCars);
    }
  };

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
              Choose from our wide selection of premium vehicles.
            </p>
          </div>
          {userRole === "Admin" && (
            <Link
              to="/cars/add"
              className="mt-4 sm:mt-0 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              <i className="fas fa-plus mr-2"></i>
              Add New Car
            </Link>
          )}
        </div>

        {/* Loading and Error States */}
        {loading && (
          <div className="text-center py-16">
            <div className="spinner"></div>
            <p className="mt-4 text-gray-600">Loading our fleet...</p>
          </div>
        )}
        {error && (
          <div
            className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md"
            role="alert"
          >
            <p>{error}</p>
          </div>
        )}

        {/* Car Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {cars.map((car) => (
              <div
                key={car.id}
                className="car-card bg-white rounded-xl shadow-lg overflow-hidden flex flex-col"
              >
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
                  <h2 className="text-xl font-bold text-gray-900">
                    {car.model}
                  </h2>
                  <div className="flex-grow flex items-center text-sm text-gray-500 mt-2 space-x-4">
                    <span>
                      <i className="fas fa-user-friends mr-1"></i> {car.seats}{" "}
                      Seats
                    </span>
                    <span>
                      <i className="fas fa-palette mr-1"></i> {car.color}
                    </span>
                    <span>
                      <i className="fas fa-briefcase mr-1"></i> {car.mbw} kg
                    </span>
                    {/* Added Category Display */}
                    <span>
                      <i className="fas fa-tag mr-1"></i>{" "}
                      {getCategoryName(car.categoryId)}
                    </span>
                  </div>
                  <div className="mt-6 flex justify-between items-center">
                    <p className="text-2xl font-extrabold text-gray-900">
                      €{car.ppd.toFixed(2)}
                      <span className="text-sm font-medium text-gray-500">
                        /day
                      </span>
                    </p>
                    {userRole === "Admin" ? (
                      <div className="flex space-x-2">
                        <Link
                          to={`/cars/update/${car.id}`}
                          className="text-blue-600 hover:text-blue-800 p-2 rounded-full transition-colors"
                        >
                          <i className="fas fa-pencil-alt"></i>
                        </Link>
                        <button
                          onClick={() => handleDelete(car.id)}
                          className="text-red-600 hover:text-red-800 p-2 rounded-full transition-colors"
                        >
                          <i className="fas fa-trash-alt"></i>
                        </button>
                      </div>
                    ) : (
                      <Link
                        // to={`/cars/rent/${car.id}`}
                        to={`/cars/${car.id}`}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                      >
                        Rent Now
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && cars.length === 0 && (
          <div className="text-center py-16">
            <i className="fas fa-car-side text-6xl text-gray-300"></i>
            <h3 className="mt-4 text-xl font-semibold text-gray-800">
              No Cars Found
            </h3>
            <p className="mt-2 text-gray-500">
              There are currently no vehicles available in our fleet.
            </p>
            {userRole === "Admin" && (
              <Link
                to="/cars/add"
                className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                Add a Car
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Cars;
