import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import apiClient from "../helper/apiclient";

const Trips = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
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

  if (loading) return <div className="text-center py-16">Loading...</div>;
  if (error)
    return <div className="text-red-500 text-center py-16">{error}</div>;

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-28">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Our Trips</h1>
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
                <Link
                  to={`/trips/${trip.id}`}
                  className="text-blue-600 font-semibold hover:underline"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Trips;
