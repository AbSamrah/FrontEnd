import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Joi from "joi-browser";
import apiClient from "../helper/apiclient";
import "../style/auth-forms.css"; // Shared styles for auth pages

const Login = () => {
  const [data, setData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const schema = {
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .required()
      .label("Email"),
    password: Joi.string().required().label("Password"),
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
    setErrors({}); // Clear previous errors

    try {
      const response = await apiClient.post("/authentication/login", data);
      localStorage.setItem("token", response.data);
      window.location = "/"; // Redirect and reload to update navbar
    } catch (ex) {
      if (ex.response && ex.response.status === 400) {
        setErrors({ form: "Invalid email or password." });
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
          <h2 className="text-2xl font-bold text-gray-800">Welcome Back!</h2>
          <p className="text-gray-500 mt-2">Please sign in to continue.</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="space-y-6">
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
                placeholder="••••••••"
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
              {isSubmitting ? "Signing In..." : "Sign In"}
            </button>
          </div>

          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="font-medium text-blue-600 hover:text-blue-500">
                Sign up now
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
