export const validateUserInput = (userInput) => {
  const { username, email, fullname, password } = userInput;
  const errors = [];
  if (!username?.trim()) errors.push("Username is required");
  if (!email?.trim()) errors.push("Email is required");
  if (!fullname?.trim()) errors.push("fullName is required");
  if (!password?.trim()) errors.push("Password is required");
  return errors;
};
