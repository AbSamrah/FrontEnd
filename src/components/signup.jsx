import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Joi from "joi-browser";
import apiClient from "../helper/apiclient";
import "../style/auth-forms.css"; // Shared styles for auth pages

const SignUp = () => {
  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    address: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const schema = {
    firstName: Joi.string().required().label("First Name"),
    lastName: Joi.string().required().label("Last Name"),
    address: Joi.string().required().label("Address"),
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .required()
      .label("Email"),
    password: Joi.string().min(6).required().label("Password"),
  };

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

  const handleChange = ({ currentTarget: input }) => {
    const newData = { ...data };
    newData[input.name] = input.value;
    setData(newData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors || {});
    if (validationErrors) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      const response = await apiClient.post("/authentication/register", data);
      localStorage.setItem("token", response.data);
      window.location = "/"; // Redirect and reload
    } catch (ex) {
      if (ex.response && ex.response.status === 400) {
        setErrors({ form: "A user with this email already exists." });
      } else {
        setErrors({ form: "An unexpected error occurred." });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800">
            Create Your Account
          </h2>
          <p className="text-gray-500 mt-2">
            Join us and start your next adventure!
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-gray-700">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  id="firstName"
                  value={data.firstName}
                  onChange={handleChange}
                  className="auth-input"
                  placeholder="John"
                />
                {errors.firstName && (
                  <p className="auth-error">{errors.firstName}</p>
                )}
              </div>
              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-gray-700">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  id="lastName"
                  value={data.lastName}
                  onChange={handleChange}
                  className="auth-input"
                  placeholder="Doe"
                />
                {errors.lastName && (
                  <p className="auth-error">{errors.lastName}</p>
                )}
              </div>
            </div>
            <div>
              <label
                htmlFor="address"
                className="block text-sm font-medium text-gray-700">
                Address
              </label>
              <input
                type="text"
                name="address"
                id="address"
                value={data.address}
                onChange={handleChange}
                className="auth-input"
                placeholder="123 Main St, Anytown"
              />
              {errors.address && <p className="auth-error">{errors.address}</p>}
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                id="email"
                value={data.email}
                onChange={handleChange}
                className="auth-input"
                placeholder="you@example.com"
              />
              {errors.email && <p className="auth-error">{errors.email}</p>}
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                name="password"
                id="password"
                value={data.password}
                onChange={handleChange}
                className="auth-input"
                placeholder="Min. 6 characters"
              />
              {errors.password && (
                <p className="auth-error">{errors.password}</p>
              )}
            </div>
          </div>

          {errors.form && (
            <div className="p-3 bg-red-100 text-red-700 rounded-md text-center my-4">
              {errors.form}
            </div>
          )}

          <div className="mt-8">
            <button
              type="submit"
              disabled={isSubmitting}
              className="auth-button">
              {isSubmitting ? "Creating Account..." : "Create Account"}
            </button>
          </div>

          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium text-blue-600 hover:text-blue-500">
                Sign In
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
