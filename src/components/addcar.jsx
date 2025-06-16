import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../helper/apiclient";
import Input from "./input"; // Using the redesigned Input
import Select from "./select"; // Using the redesigned Select
import Joi from "joi-browser";

const AddCar = () => {
  const [data, setData] = useState({
    model: "",
    seats: "",
    color: "",
    image: "",
    mbw: "",
    pph: "",
    ppd: "",
    categoryId: "1",
  });

  const [errors, setErrors] = useState({});
  const [categories, setCategories] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const schema = {
    model: Joi.string().required().label("Model"),
    seats: Joi.number().min(1).required().label("Seats"),
    color: Joi.string().required().label("Color"),
    image: Joi.string().required().label("Image"),
    mbw: Joi.number().min(0).required().label("Max Baggage Weight"),
    pph: Joi.number().min(0).required().label("Price per Hour"),
    ppd: Joi.number().min(0).required().label("Price per Day"),
    categoryId: Joi.number().required().label("Category"),
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data: categoriesData } = await apiClient.get("/categories");
        setCategories(categoriesData);
      } catch (error) {
        console.error("Failed to fetch categories", error);
        setErrors((prev) => ({
          ...prev,
          categoryId: "Could not load categories.",
        }));
      }
    };
    fetchCategories();
  }, []);

  const validate = () => {
    const options = { abortEarly: false };
    const { error } = Joi.validate(data, schema, options);
    if (!error) return null;

    const validationErrors = {};
    for (let item of error.details) {
      validationErrors[item.path[0]] = item.message;
    }
    return validationErrors;
  };

  const validateProperty = ({ name, value }) => {
    const obj = { [name]: value };
    const subSchema = { [name]: schema[name] };
    const { error } = Joi.validate(obj, subSchema);
    return error ? error.details[0].message : null;
  };

  const handleChange = ({ currentTarget: input }) => {
    const newErrors = { ...errors };
    const errorMessage = validateProperty(input);
    if (errorMessage) {
      newErrors[input.name] = errorMessage;
    } else {
      delete newErrors[input.name];
    }

    const newData = { ...data };
    newData[input.name] = input.value;

    setData(newData);
    setErrors(newErrors);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    setIsUploading(true);
    setErrors((prev) => ({ ...prev, image: null }));

    try {
      const { data: response } = await apiClient.post(
        "/files/upload",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setData({ ...data, image: response.url });
    } catch (error) {
      setErrors((prev) => ({ ...prev, image: "Image upload failed." }));
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors || {});
    if (validationErrors) return;

    setIsSubmitting(true);
    try {
      await apiClient.post("/cars", data);
      navigate("/cars");
    } catch (error) {
      console.error("Failed to submit form", error);
      setErrors({ form: "An unexpected error occurred." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 pt-28 pb-12">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Add New Car</h1>
          <p className="text-gray-500 mt-2">
            Fill in the details below to add a new vehicle to the fleet.
          </p>
        </div>
        <form onSubmit={handleSubmit} noValidate>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {/* Left Column */}
            <div className="space-y-6">
              <Input
                name="model"
                label="Model"
                value={data.model}
                onChange={handleChange}
                error={errors.model}
                placeholder="e.g., Toyota Camry"
              />
              <Input
                name="seats"
                label="Seats"
                type="number"
                value={data.seats}
                onChange={handleChange}
                error={errors.seats}
              />
              <Input
                name="color"
                label="Color"
                value={data.color}
                onChange={handleChange}
                error={errors.color}
                placeholder="e.g., Silver"
              />
              <Select
                name="categoryId"
                label="Category"
                value={data.categoryId}
                onChange={handleChange}
                options={categories}
                error={errors.categoryId}
              />
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Car Image
                </label>
                <div className="mt-1 flex items-center">
                  {data.image && (
                    <img
                      src={`http://localhost:5117${data.image}`}
                      alt="Preview"
                      className="w-16 h-16 rounded-md object-cover mr-4"
                    />
                  )}
                  <label
                    htmlFor="image-upload"
                    className="relative cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50">
                    <span>
                      {isUploading ? "Uploading..." : "Upload a file"}
                    </span>
                    <input
                      id="image-upload"
                      name="image"
                      type="file"
                      className="sr-only"
                      onChange={handleImageUpload}
                      disabled={isUploading}
                    />
                  </label>
                </div>
                {errors.image && (
                  <p className="mt-2 text-sm text-red-600">{errors.image}</p>
                )}
              </div>
              <Input
                name="mbw"
                label="Max Baggage (kg)"
                type="number"
                value={data.mbw}
                onChange={handleChange}
                error={errors.mbw}
              />
              <Input
                name="pph"
                label="Price/Hour (€)"
                type="number"
                value={data.pph}
                onChange={handleChange}
                error={errors.pph}
              />
              <Input
                name="ppd"
                label="Price/Day (€)"
                type="number"
                value={data.ppd}
                onChange={handleChange}
                error={errors.ppd}
              />
            </div>
          </div>
          <div className="mt-8 pt-5 border-t border-gray-200">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => navigate("/cars")}
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isUploading || validate()}
                className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300">
                {isSubmitting ? "Adding..." : "Add Car"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCar;
