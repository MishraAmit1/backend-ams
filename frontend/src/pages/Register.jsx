import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    fullname: "",
    password: "",
    avatar: null,
    coverImage: null,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  // Validate form inputs
  const validateForm = () => {
    let newErrors = {};
    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username =
        "Username can only contain letters, numbers, and underscores";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!formData.fullname.trim()) {
      newErrors.fullname = "Full name is required";
    } else if (formData.fullname.length < 2) {
      newErrors.fullname = "Full name must be at least 2 characters";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    } else if (!/^[A-Za-z\d]{6,}$/.test(formData.password)) {
      newErrors.password = "Password must contain only letters or numbers";
    }
    if (!formData.avatar) {
      newErrors.avatar = "Avatar image is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes (text and files)
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      // Handle file inputs
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      // Handle text inputs
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    setErrors({});

    // Create FormData for multipart/form-data
    const data = new FormData();
    data.append("username", formData.username);
    data.append("email", formData.email);
    data.append("fullname", formData.fullname);
    data.append("password", formData.password);
    data.append("avatar", formData.avatar);
    if (formData.coverImage) {
      data.append("coverImage", formData.coverImage);
    }

    try {
      // Make POST request to backend
      const response = await axios.post(
        "http://localhost:3000/api/v1/users/register",
        data,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true, // Send cookies (if any)
        }
      );

      // Log user details to console
      console.log("Registration successful:", {
        user: response.data.data,
        message: response.data.message,
      });

      // Clear form and redirect to login
      setFormData({
        username: "",
        email: "",
        fullname: "",
        password: "",
        avatar: null,
        coverImage: null,
      });
      navigate("/login");
    } catch (error) {
      // Handle backend errors
      const errorMessage =
        error.response?.data?.message || "Registration failed! Try again.";
      setErrors({ general: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>
        {errors.general && (
          <p className="mb-4 text-sm text-red-600">{errors.general}</p>
        )}
        <form
          method="post"
          encType="multipart/form-data"
          className="space-y-4"
          onSubmit={handleSubmit}
        >
          <div>
            <label className="block text-sm font-medium">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your username"
              disabled={loading}
            />
            {errors.username && (
              <p className="mt-1 text-sm text-red-600">{errors.username}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your email"
              disabled={loading}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium">Full Name</label>
            <input
              type="text"
              name="fullname"
              value={formData.fullname}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your full name"
              disabled={loading}
            />
            {errors.fullname && (
              <p className="mt-1 text-sm text-red-600">{errors.fullname}</p>
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
          <div>
            <label className="block text-sm font-medium">Avatar Image</label>
            <input
              type="file"
              name="avatar"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              onChange={handleChange}
              className="w-full p-2 border rounded"
              disabled={loading}
            />
            {errors.avatar && (
              <p className="mt-1 text-sm text-red-600">{errors.avatar}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium">
              Cover Image (Optional)
            </label>
            <input
              type="file"
              name="coverImage"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              onChange={handleChange}
              className="w-full p-2 border rounded"
              disabled={loading}
            />
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
                Registering...
              </div>
            ) : (
              "Register"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
