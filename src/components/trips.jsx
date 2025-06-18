import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import apiClient from "../helper/apiclient";
import { jwtDecode } from "jwt-decode";

const Trips = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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

    const fetchTrips = async () => {
      try {
        const response = await apiClient.get("/trips");
        setTrips(response.data);
      } catch (err) {
        setError("Failed to load trips. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this trip?")) {
      return;
    }
    try {
      await apiClient.delete(`/trips/${id}`);
      setTrips(trips.filter((trip) => trip.id !== id));
    } catch (err) {
      setError("Failed to delete trip.");
    }
  };

  if (loading) return <div className="text-center py-16">Loading...</div>;
  if (error)
    return <div className="text-red-500 text-center py-16">{error}</div>;

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-28">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Our Trips</h1>
          {(userRole === "Admin" || userRole === "Employee") && (
            <Link
              to="/trips/add"
              className="bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700"
            >
              Add New Trip
            </Link>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {trips.map((trip) => (
            <div
              key={trip.id}
              className="bg-white rounded-lg shadow-lg overflow-hidden"
            >
              <img
                src="https://placehold.co/600x400/e2e8f0/4a5568?text=Trip+Image"
                alt={trip.slug}
                className="w-full h-56 object-cover"
              />
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-2">{trip.slug}</h2>
                <p className="text-gray-600 mb-4">{trip.description}</p>
                {userRole === "Admin" || userRole === "Employee" ? (
                  <div className="flex justify-between">
                    <Link
                      to={`/trips/update/${trip.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(trip.id)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                ) : (
                  <Link
                    to={`/trips/${trip.id}`}
                    className="text-blue-600 font-semibold hover:underline"
                  >
                    View Details
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Trips;
