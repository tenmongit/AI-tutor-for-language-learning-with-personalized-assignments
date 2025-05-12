import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function ModernNavbar({ onLanguageSelect }) {
  const location = useLocation();
  const { currentUser, logout } = useAuth();
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  
  // Load saved language on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem("selectedLanguage");
    if (savedLanguage) {
      try {
        setSelectedLanguage(JSON.parse(savedLanguage));
      } catch (e) {
        localStorage.removeItem("selectedLanguage");
      }
    }
  }, []);
  
  const handleLanguageSelect = (language) => {
    setSelectedLanguage(language);
    localStorage.setItem("selectedLanguage", JSON.stringify(language));
    if (onLanguageSelect) {
      onLanguageSelect(language);
    }
  };
  
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };
  
  return (
    <>
      {/* Main Navigation */}
      <header className="bg-white border-b border-gray-200 py-3 px-4 shadow-sm">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/" className="text-indigo-600 font-bold text-xl flex items-center">
              <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z" fill="#4F46E5"/>
                <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#4F46E5" strokeWidth="2"/>
              </svg>
              LinguaAI
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link 
              to="/" 
              className={`text-gray-600 hover:text-indigo-600 transition-colors duration-200 ${location.pathname === '/' ? 'font-medium text-indigo-600' : ''}`}
            >
              Home
            </Link>
            <Link 
              to="/dashboard" 
              className={`text-gray-600 hover:text-indigo-600 transition-colors duration-200 ${location.pathname === '/dashboard' ? 'font-medium text-indigo-600' : ''}`}
            >
              Dashboard
            </Link>
            <Link 
              to="/chat" 
              className={`text-gray-600 hover:text-indigo-600 transition-colors duration-200 ${location.pathname === '/chat' ? 'font-medium text-indigo-600' : ''}`}
            >
              Chat with AI
            </Link>
            
            {/* Language Selector */}
            <div className="relative">
              <button 
                onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
                className="flex items-center px-3 py-1.5 rounded-full border border-gray-200 bg-white text-gray-700 hover:border-indigo-300 hover:text-indigo-600 transition-all duration-200"
              >
                <span className="mr-2 text-lg">{selectedLanguage ? selectedLanguage.flag : "🌐"}</span>
                <span className="hidden md:inline font-medium">{selectedLanguage ? selectedLanguage.name : "Select Language"}</span>
                <svg className="w-4 h-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              
              {isLanguageMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg z-50 py-2 border border-gray-100 animate-fadeIn">
                  <h3 className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Select Language</h3>
                  <div className="py-1">
                    {[{ id: 1, name: "Spanish", flag: "🇪🇸" }, 
                      { id: 2, name: "French", flag: "🇫🇷" }, 
                      { id: 3, name: "German", flag: "🇩🇪" },
                      { id: 4, name: "Japanese", flag: "🇯🇵" }].map(lang => (
                      <button 
                        key={lang.id}
                        onClick={() => {
                          handleLanguageSelect(lang);
                          setIsLanguageMenuOpen(false);
                        }}
                        className={`flex items-center w-full px-4 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 ${selectedLanguage?.id === lang.id ? 'bg-indigo-50 text-indigo-600' : ''}`}
                      >
                        <span className="text-xl mr-3">{lang.flag}</span>
                        <span className="font-medium">{lang.name}</span>
                        {selectedLanguage?.id === lang.id && (
                          <svg className="w-5 h-5 ml-auto text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* User profile */}
            {currentUser ? (
              <div className="relative">
                <button 
                  onClick={handleLogout}
                  className="flex items-center text-gray-600 hover:text-indigo-600 transition-colors duration-200"
                >
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mr-1">
                    <span className="font-medium">{currentUser?.name?.charAt(0) || "T"}</span>
                  </div>
                  <span className="hidden md:inline">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex space-x-2">
                <Link to="/login" className="text-gray-600 hover:text-indigo-600 transition-colors duration-200">Login</Link>
                <Link to="/register" className="px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200">Sign Up</Link>
              </div>
            )}
          </div>
        </div>
      </header>
      
      {/* Language banner - only shown when language is selected, with no change button */}
      {selectedLanguage && location.pathname === '/dashboard' && (
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 text-white py-3 px-4 shadow-md">
          <div className="container mx-auto flex items-center">
            <span className="text-2xl mr-2">{selectedLanguage.flag}</span>
            <div>
              <span className="font-medium text-lg">{selectedLanguage.name}</span>
              <div className="text-xs text-indigo-100">Level: A2</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
