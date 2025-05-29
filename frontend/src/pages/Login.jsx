import { useState } from "react";
import axios from "axios";

const Login = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Validate form inputs
  const validateForm = () => {
    let newErrors = {};
    if (!formData.username.trim()) {
      newErrors.username = "Username or Email is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username or Email must be at least 3 characters";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) {
      setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    }
  };

  // Handle login form submission
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    setErrors({}); // Clear previous errors

    try {
      // Make POST request to backend
      const response = await axios.post(
        "http://localhost:3000/api/v1/users/login", // Updated port
        {
          username: formData.username,
          email: formData.username, // Backend accepts either
          password: formData.password,
        },
        {
          withCredentials: true, // Send cookies
        }
      );

      // Log user details and token info to console
      console.log("Login successful:", {
        user: response.data.data.user,
        message: response.data.message,
        accessToken: "Check browser cookies (HTTP-only)",
        refreshToken: "Check browser cookies (HTTP-only)",
      });

      // Clear form and redirect to home
      setFormData({ username: "", password: "" });
    } catch (error) {
      // Handle backend errors
      const errorMessage =
        error.response?.data?.message || "Login failed! Try again.";
      setErrors({ general: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        {errors.general && (
          <p className="mb-4 text-sm text-red-600">{errors.general}</p>
        )}
        <form method="post" className="space-y-4" onSubmit={handleLogin}>
          <div>
            <label className="block text-sm font-medium">
              Username or Email
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your username or email"
              disabled={loading}
            />
            {errors.username && (
              <p className="mt-1 text-sm text-red-600">{errors.username}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your password"
              disabled={loading}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full p-3 rounded-lg font-medium transition-all ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600 text-white"
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Logging in...
              </div>
            ) : (
              "Login"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
