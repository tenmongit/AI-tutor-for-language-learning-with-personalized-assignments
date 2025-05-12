import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [formTouched, setFormTouched] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  // Validate form on input change
  useEffect(() => {
    if (formTouched) {
      validateForm();
    }
  }, [name, email, password, confirmPassword, formTouched]);

  const validateForm = () => {
    const errors = {};
    
    // Name validation
    if (!name.trim()) {
      errors.name = "Name is required";
    } else if (name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters";
    }
    
    // Email validation
    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Please enter a valid email address";
    }
    
    // Password validation
    if (!password) {
      errors.password = "Password is required";
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    } else if (!/\d/.test(password)) {
      errors.password = "Password must contain at least one number";
    } else if (!/[a-zA-Z]/.test(password)) {
      errors.password = "Password must contain at least one letter";
    }
    
    // Confirm password validation
    if (!confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setFormTouched(true);
    
    // Validate all fields
    if (!validateForm()) {
      return; // Don't proceed if validation fails
    }

    setLoading(true);

    try {
      console.log("Submitting registration form with:", { name, email, passwordLength: password.length });
      
      // Check if the server is running first using the proxy
      try {
        console.log('Checking server health at: /health');
        
        const healthCheck = await fetch('/health', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        
        if (!healthCheck.ok) {
          throw new Error('Server health check failed');
        }
        
        console.log('Server is running and healthy');
      } catch (healthErr) {
        console.error('Server health check failed:', healthErr);
        throw new Error('Cannot connect to the server. Please make sure the server is running.');
      }
      
      // Add a delay to ensure the UI updates before the API call
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const user = await register(name, email, password);
      console.log("Registration successful, user:", user);
      
      // Set a success message in localStorage for the dashboard
      localStorage.setItem("registrationSuccess", "true");
      localStorage.setItem("registeredEmail", email);
      
      // Navigate to dashboard
      navigate("/dashboard");
    } catch (err) {
      console.error("Registration error in component:", err);
      
      // Handle specific error cases
      if (typeof err === 'string' && err.includes("already exists")) {
        setError("This email is already registered. Please use a different email or login.");
        setValidationErrors(prev => ({ ...prev, email: "This email is already registered" }));
      } else if (typeof err === 'string' && err.includes("No response from server") || 
                 err.toString().includes("Cannot connect to the server")) {
        setError("Cannot connect to the server. Please make sure the server is running.");
      } else if (err && err.toString().includes("Network Error")) {
        setError("Network error. Please check your internet connection and ensure the server is running.");
      } else {
        // Generic error message with any details we have
        setError(typeof err === 'string' ? err : "Failed to create an account. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
    if (!formTouched) setFormTouched(true);
  };

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-3xl font-bold text-center mb-6">Register</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-start">
          <svg className="w-5 h-5 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span>{error}</span>
        </div>
      )}

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="name"
              className="block text-gray-700 font-medium mb-2"
            >
              Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={handleInputChange(setName)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${validationErrors.name ? 'border-red-500' : 'border-gray-300'}`}
              required
            />
            {validationErrors.name && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.name}</p>
            )}
          </div>

          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-gray-700 font-medium mb-2"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={handleInputChange(setEmail)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${validationErrors.email ? 'border-red-500' : 'border-gray-300'}`}
              required
            />
            {validationErrors.email && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.email}</p>
            )}
          </div>

          <div className="mb-4">
            <label
              htmlFor="password"
              className="block text-gray-700 font-medium mb-2"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={handleInputChange(setPassword)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${validationErrors.password ? 'border-red-500' : 'border-gray-300'}`}
              required
            />
            {validationErrors.password && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.password}</p>
            )}
            {password && !validationErrors.password && (
              <div className="mt-1">
                <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${password.length < 8 ? 'bg-red-500' : password.length < 10 ? 'bg-yellow-500' : 'bg-green-500'}`}
                    style={{ width: `${Math.min(100, (password.length / 12) * 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {password.length < 8 ? 'Weak' : password.length < 10 ? 'Good' : 'Strong'} password
                </p>
              </div>
            )}
          </div>

          <div className="mb-6">
            <label
              htmlFor="confirmPassword"
              className="block text-gray-700 font-medium mb-2"
            >
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={handleInputChange(setConfirmPassword)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${validationErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
              required
            />
            {validationErrors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.confirmPassword}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center"
            disabled={loading}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Account...
              </>
            ) : (
              "Register"
            )}
          </button>
        </form>
      </div>

      <div className="text-center mt-4">
        <p>
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
