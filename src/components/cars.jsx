import React, { useState, useEffect, useCallback } from "react";
import apiClient from "../helper/apiclient";
import { Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "../style/cars.css";

const Cars = () => {
  const [allCars, setAllCars] = useState([]);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [filters, setFilters] = useState({
    model: "",
    color: "",
    seats: "",
    categoryId: "",
    minPricePerDay: "",
    maxPricePerDay: "",
    sortBy: "ppd",
    sortOrder: "asc",
  });

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    hasPrevious: false,
    hasNext: false,
  });

  const fetchCars = useCallback(
    async (page = 1) => {
      setLoading(true);
      setError(null);

      const params = {
        pageNumber: page,
        pageSize: 9,
        ...filters,
      };

      Object.keys(params).forEach((key) => {
        if (params[key] === "" || params[key] === null) {
          delete params[key];
        }
      });

      if (startDate && endDate) {
        params.startDateTime = new Date(startDate).toISOString();
        params.endDateTime = new Date(endDate).toISOString();
      }

      try {
        const endpoint = startDate && endDate ? "/cars/available" : "/cars";
        const response = await apiClient.get(endpoint, { params });

        setAllCars(response.data.cars);
        setPagination({
          currentPage: response.data.currentPage,
          totalPages: response.data.totalPages,
          hasPrevious: response.data.hasPrevious,
          hasNext: response.data.hasNext,
        });
      } catch (error) {
        console.error("Failed to fetch cars:", error);
        setError("Could not retrieve cars. Please try again.");
        setAllCars([]);
      } finally {
        setLoading(false);
      }
    },
    [startDate, endDate, filters]
  );

  useEffect(() => {
    fetchCars(1);

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

    const fetchCategories = async () => {
      try {
        const categoriesResponse = await apiClient.get("/categories");
        setCategories(categoriesResponse.data);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };
    fetchCategories();
  }, [fetchCars]);

  const handleApplyFilters = (e) => {
    e.preventDefault();
    if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
      setError("End date must be after the start date.");
      return;
    }
    fetchCars(1);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.title : "N/A";
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await apiClient.delete(`/cars/${id}`);
      fetchCars(pagination.currentPage);
    } catch (error) {
      setError("Failed to delete car.");
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
              state={{ startDate, endDate }}
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

        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <form onSubmit={handleApplyFilters}>
            {userRole !== "Admin" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
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
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md"
                  />
                </div>
                <div>
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
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label
                  htmlFor="model"
                  className="block text-sm font-medium text-gray-700">
                  Model
                </label>
                <input
                  type="text"
                  name="model"
                  value={filters.model}
                  onChange={handleFilterChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="e.g., Camry"
                />
              </div>
              <div>
                <label
                  htmlFor="color"
                  className="block text-sm font-medium text-gray-700">
                  Color
                </label>
                <input
                  type="text"
                  name="color"
                  value={filters.color}
                  onChange={handleFilterChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="e.g., Silver"
                />
              </div>
              <div>
                <label
                  htmlFor="seats"
                  className="block text-sm font-medium text-gray-700">
                  Min. Seats
                </label>
                <input
                  type="number"
                  name="seats"
                  value={filters.seats}
                  onChange={handleFilterChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="e.g., 4"
                />
              </div>
              <div>
                <label
                  htmlFor="categoryId"
                  className="block text-sm font-medium text-gray-700">
                  Category
                </label>
                <select
                  name="categoryId"
                  value={filters.categoryId}
                  onChange={handleFilterChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md">
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label
                  htmlFor="minPricePerDay"
                  className="block text-sm font-medium text-gray-700">
                  Min Price/Day
                </label>
                <input
                  type="number"
                  name="minPricePerDay"
                  value={filters.minPricePerDay}
                  onChange={handleFilterChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="e.g., 50"
                />
              </div>
              <div>
                <label
                  htmlFor="maxPricePerDay"
                  className="block text-sm font-medium text-gray-700">
                  Max Price/Day
                </label>
                <input
                  type="number"
                  name="maxPricePerDay"
                  value={filters.maxPricePerDay}
                  onChange={handleFilterChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="e.g., 200"
                />
              </div>
              <div>
                <label
                  htmlFor="sortBy"
                  className="block text-sm font-medium text-gray-700">
                  Sort By
                </label>
                <select
                  name="sortBy"
                  value={filters.sortBy}
                  onChange={handleFilterChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md">
                  <option value="ppd">Price</option>
                  <option value="model">Model</option>
                  <option value="seats">Seats</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="sortOrder"
                  className="block text-sm font-medium text-gray-700">
                  Order
                </label>
                <select
                  name="sortOrder"
                  value={filters.sortOrder}
                  onChange={handleFilterChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md">
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              </div>
            </div>
            <div className="mt-4 text-right">
              <button
                type="submit"
                disabled={loading}
                className="justify-center flex items-center px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300">
                {loading ? "Searching..." : "Apply Filters"}
              </button>
            </div>
          </form>
        </div>

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

        {!loading && !error && (
          <div>
            {allCars.length > 0 ?
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {allCars.map(renderCarCard)}
              </div>
            : <div className="text-center py-16">
                <i className="fas fa-car-side text-6xl text-gray-300"></i>
                <h3 className="mt-4 text-xl font-semibold text-gray-800">
                  No Cars Found
                </h3>
                <p className="mt-2 text-gray-500">
                  Try adjusting your search or filter criteria.
                </p>
              </div>
            }

            <div className="mt-12 flex justify-center items-center">
              <button
                onClick={() => fetchCars(pagination.currentPage - 1)}
                disabled={!pagination.hasPrevious || loading}
                className="px-4 py-2 mx-1 bg-white border rounded-md disabled:opacity-50">
                Previous
              </button>
              <span className="px-4 py-2 mx-1">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <button
                onClick={() => fetchCars(pagination.currentPage + 1)}
                disabled={!pagination.hasNext || loading}
                className="px-4 py-2 mx-1 bg-white border rounded-md disabled:opacity-50">
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cars;
