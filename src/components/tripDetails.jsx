import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import apiClient from "../helper/apiclient";

const TripDetails = () => {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTripDetails = async () => {
      try {
        const response = await apiClient.get(`/trips/${id}`);
        setTrip(response.data);
      } catch (err) {
        setError("Failed to load trip details.");
      } finally {
        setLoading(false);
      }
    };

    fetchTripDetails();
  }, [id]);

  if (loading) return <div className="text-center py-16">Loading...</div>;
  if (error)
    return <div className="text-red-500 text-center py-16">{error}</div>;
  if (!trip) return <div className="text-center py-16">Trip not found.</div>;

  return (
    <div className="container mx-auto px-4 py-12 pt-28">
      <h1 className="text-3xl font-bold mb-4">{trip.slug}</h1>
      <p className="mb-8">{trip.description}</p>
      {/* Add more trip details as needed */}
    </div>
  );
};

export default TripDetails;
