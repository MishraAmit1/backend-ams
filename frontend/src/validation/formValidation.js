export const validateForm = () => {
  let newErrors = {};
  if (!formData.username.trim()) {
    newErrors.username = "Username/Email is required";
  } else if (formData.username.length < 3) {
    newErrors.username = "Username must be at least 3 characters";
  }
  if (!formData.password) {
    newErrors.password = "Password is required";
  } else if (formData.password.length < 6) {
    newErrors.password = "Password must be at least 6 characters";
  }
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
