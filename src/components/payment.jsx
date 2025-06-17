import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import apiClient from "../helper/apiclient";

const PaymentPage = () => {
  const { bookingId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const { totalPrice } = location.state || {};

  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!totalPrice || !bookingId) {
      navigate("/cars");
      return;
    }

    const fetchPaymentMethods = async () => {
      try {
        const response = await apiClient.get("/paymentmethod");
        setPaymentMethods(response.data);
        if (response.data.length > 0) {
          setSelectedMethod(response.data[0].id.toString());
        }
      } catch (err) {
        console.error("Failed to fetch payment methods:", err);
        setError("Could not load payment options. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPaymentMethods();
  }, [bookingId, totalPrice, navigate]);

  const handlePayment = async () => {
    setIsProcessing(true);
    setError(null);

    const paymentMethod = paymentMethods.find(
      (pm) => pm.id.toString() === selectedMethod
    );
    if (!paymentMethod) {
      setError("Please select a valid payment method.");
      setIsProcessing(false);
      return;
    }

    if (paymentMethod.name.toLowerCase() === "paypal") {
      try {
        const response = await apiClient.post(
          `/paypal/create-order/${bookingId}`
        );
        const { orderId } = response.data;

        if (orderId) {
          alert(`Redirecting to PayPal for payment. Order ID: ${orderId}`);
          // In a real application, this would be a full redirect:
          // window.location.href = `https://www.sandbox.paypal.com/checkoutnow?token=${orderId}`;
        } else {
          throw new Error("Failed to create PayPal order.");
        }
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || "Failed to initiate PayPal payment.";
        setError(errorMessage);
      } finally {
        setIsProcessing(false);
      }
    } else {
      // Handle other payment methods here
      alert(`Payment method "${paymentMethod.name}" is not yet implemented.`);
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-40">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white shadow-xl rounded-lg p-8">
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Complete Your Payment
          </h2>
          <div className="text-center mt-4 text-gray-600">
            <p className="text-lg">Total Amount</p>
            <p className="text-4xl font-bold text-blue-600">
              €{totalPrice?.toFixed(2)}
            </p>
          </div>

          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded-md my-4 text-sm">
              {error}
            </div>
          )}

          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900">
              Select a Payment Method
            </h3>
            <fieldset className="mt-4">
              <legend className="sr-only">Payment methods</legend>
              <div className="space-y-4">
                {paymentMethods.map((method) => (
                  <div key={method.id} className="flex items-center">
                    <input
                      id={method.id}
                      name="payment-method"
                      type="radio"
                      value={method.id}
                      checked={selectedMethod === method.id.toString()}
                      onChange={(e) => setSelectedMethod(e.target.value)}
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                    />
                    <label
                      htmlFor={method.id}
                      className="ml-3 block text-sm font-medium text-gray-700">
                      {method.name}
                    </label>
                  </div>
                ))}
              </div>
            </fieldset>
          </div>

          <div className="mt-8">
            <button
              onClick={handlePayment}
              disabled={isProcessing || !selectedMethod}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300">
              {isProcessing ?
                "Processing..."
              : `Pay with ${paymentMethods.find((pm) => pm.id.toString() === selectedMethod)?.name || ""}`
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
