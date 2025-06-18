import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "../helper/apiclient";

const UpdateTrip = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState({
    slug: "",
    description: "",
    isAvailable: true,
    isPrivate: false,
    isFeatured: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const response = await apiClient.get(`/trips/${id}`);
        setTrip(response.data);
      } catch (err) {
        setError("Failed to fetch trip data.");
      } finally {
        setLoading(false);
      }
    };
    fetchTrip();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setTrip({
      ...trip,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiClient.put(`/trips/${id}`, trip);
      navigate("/trips");
    } catch (err) {
      setError("Failed to update trip.");
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-12 pt-28">
      <h1 className="text-3xl font-bold mb-8">Edit Trip</h1>
      <form onSubmit={handleSubmit} className="max-w-lg mx-auto">
        <div className="mb-4">
          <label htmlFor="slug" className="block text-gray-700 font-bold mb-2">
            Trip Name (Slug)
          </label>
          <input
            type="text"
            id="slug"
            name="slug"
            value={trip.slug}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="description"
            className="block text-gray-700 font-bold mb-2"
          >
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={trip.description}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            rows="4"
            required
          ></textarea>
        </div>
        <div className="mb-4">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              name="isAvailable"
              checked={trip.isAvailable}
              onChange={handleChange}
              className="form-checkbox"
            />
            <span className="ml-2">Available</span>
          </label>
        </div>
        <div className="mb-4">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              name="isFeatured"
              checked={trip.isFeatured}
              onChange={handleChange}
              className="form-checkbox"
            />
            <span className="ml-2">Featured on Home Page</span>
          </label>
        </div>
        {error && <p className="text-red-500">{error}</p>}
        <button
          type="submit"
          className="bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700"
        >
          Update Trip
        </button>
      </form>
    </div>
  );
};

export default UpdateTrip;
