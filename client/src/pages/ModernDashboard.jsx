import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";
import ProgressChart from "../components/ProgressChart";
import ProgressBar from "../components/ProgressBar";
import LanguageSelector from "../components/LanguageSelector";

export default function ModernDashboard() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [progressData, setProgressData] = useState([]);
  const [dailyGoal, setDailyGoal] = useState(70); // Percentage of daily goal completed
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [userProgress, setUserProgress] = useState(null);
  const [error, setError] = useState(null);
  const [areasToImprove, setAreasToImprove] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);

  useEffect(() => {
    // Load user's last selected language from localStorage
    const savedLanguage = localStorage.getItem("selectedLanguage");
    if (savedLanguage) {
      try {
        setSelectedLanguage(JSON.parse(savedLanguage));
      } catch (e) {
        localStorage.removeItem("selectedLanguage");
      }
    }
  }, []);

  useEffect(() => {
    // Fetch user data
    const fetchUserData = async () => {
      try {
        // Use currentUser if available, otherwise use mock data
        if (currentUser) {
          setUser({
            name: currentUser.name,
            proficiency: "Intermediate",
            language: selectedLanguage?.name || "Spanish",
            progress: 65,
            lessonsCompleted: 28,
            streak: 14,
            level: "A2"
          });
        } else {
          // Mock data for testing
          setUser({
            name: "Test User",
            proficiency: "Intermediate",
            language: selectedLanguage?.name || "Spanish",
            progress: 65,
            lessonsCompleted: 28,
            streak: 14,
            level: "A2"
          });
        }

        // Mock progress data for chart
        setProgressData([
          { name: "Greetings", value: 80 },
          { name: "Grammar", value: 60 },
          { name: "Vocabulary", value: 90 },
          { name: "Listening", value: 68 },
          { name: "Speaking", value: 75 }
        ]);

        // Mock areas to improve
        setAreasToImprove([
          { id: 1, name: "Verb Conjugation", description: "Practice regular and irregular verb forms" },
          { id: 2, name: "Listening Comprehension", description: "Work on understanding native speakers" },
          { id: 3, name: "Vocabulary Expansion", description: "Learn more words related to daily activities" }
        ]);

        setLoading(false);
      } catch (err) {
        setError("Failed to fetch user data");
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [currentUser, selectedLanguage]);

  useEffect(() => {
    // Fetch lessons
    const fetchLessons = async () => {
      try {
        // Mock lessons data
        const mockLessons = [
          { id: 1, title: "Greetings and Introductions", difficulty: "BEGINNER", description: "Learn basic Spanish greetings and how to introduce yourself.", completed: true },
          { id: 2, title: "Numbers and Counting", difficulty: "BEGINNER", description: "Learn to count and use numbers in Spanish.", completed: true },
          { id: 3, title: "Common Phrases", difficulty: "BEGINNER", description: "Essential phrases for everyday conversations.", completed: false },
          { id: 4, title: "Food and Dining", difficulty: "INTERMEDIATE", description: "Vocabulary for restaurants and food items.", completed: false },
          { id: 5, title: "Travel Expressions", difficulty: "INTERMEDIATE", description: "Useful phrases for traveling in Spanish-speaking countries.", completed: false },
          { id: 6, title: "Past Tense Basics", difficulty: "INTERMEDIATE", description: "Learn to talk about past events.", completed: false }
        ];
        
        setLessons(mockLessons);
      } catch (err) {
        setError("Failed to fetch lessons");
      }
    };
    
    fetchLessons();
  }, [selectedLanguage]);

  useEffect(() => {
    // Fetch user progress
    const fetchUserProgress = async () => {
      try {
        // Mock assignments data
        setAssignments([
          { id: 1, title: "Past Tense Practice", difficulty: "MEDIUM", dueDate: "2025-05-15", description: "Complete exercises on past tense verbs" },
          { id: 2, title: "Conversation Practice", difficulty: "EASY", dueDate: "2025-05-14", description: "Record yourself speaking for 5 minutes" },
          { id: 3, title: "Reading Comprehension", difficulty: "HARD", dueDate: "2025-05-16", description: "Read a short story and answer questions" }
        ]);
      } catch (err) {
        setError("Failed to fetch user progress");
      }
    };
    
    fetchUserProgress();
  }, [selectedLanguage]);

  const handleLanguageSelect = (language) => {
    setSelectedLanguage(language);
    localStorage.setItem("selectedLanguage", JSON.stringify(language));
  };

  const getLessonStatus = (lessonId) => {
    const lesson = lessons.find(l => l.id === lessonId);
    
    if (!lesson) return { status: "UNAVAILABLE", action: "Unavailable" };
    
    if (lesson.completed) {
      return { status: "COMPLETED", action: "Review" };
    }
    
    // Check if previous lessons are completed to determine if this one is available
    const previousLessonsCompleted = lessons
      .filter(l => l.id < lessonId)
      .every(l => l.completed);
    
    return previousLessonsCompleted 
      ? { status: "AVAILABLE", action: "Start" } 
      : { status: "LOCKED", action: "Locked" };
  };

  if (loading) {
    return (
      <div className="flex justify-center my-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modern Header - Similar to Image 3 */}
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
          
          <div className="flex items-center space-x-6">
            <Link to="/" className="text-gray-600 hover:text-indigo-600 transition-colors duration-200">Home</Link>
            <Link to="/dashboard" className="text-gray-600 hover:text-indigo-600 transition-colors duration-200">Dashboard</Link>
            <Link to="/chat" className="text-gray-600 hover:text-indigo-600 transition-colors duration-200">Chat with AI</Link>
            
            {/* Improved language selector */}
            <div className="relative language-selector">
              <button 
                onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
                className="flex items-center space-x-2 text-gray-600 hover:text-indigo-600 transition-colors duration-200"
              >
                <span className="mr-1 text-lg">{selectedLanguage ? selectedLanguage.flag : "🌐"}</span>
                <span className="hidden md:inline">{selectedLanguage ? selectedLanguage.name : "Language"}</span>
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              
              {/* Language dropdown menu */}
              {isLanguageMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 py-1 animate-fadeIn border border-gray-200">
                  <div className="py-1">
                    <button 
                      onClick={() => {
                        handleLanguageSelect({ id: 1, name: "Spanish", flag: "🇪🇸" });
                        setIsLanguageMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                    >
                      🇪🇸 Spanish
                    </button>
                    <button 
                      onClick={() => {
                        handleLanguageSelect({ id: 2, name: "French", flag: "🇫🇷" });
                        setIsLanguageMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                    >
                      🇫🇷 French
                    </button>
                    <button 
                      onClick={() => {
                        handleLanguageSelect({ id: 3, name: "German", flag: "🇩🇪" });
                        setIsLanguageMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                    >
                      🇩🇪 German
                    </button>
                    <button 
                      onClick={() => {
                        handleLanguageSelect({ id: 4, name: "Japanese", flag: "🇯🇵" });
                        setIsLanguageMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                    >
                      🇯🇵 Japanese
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* User profile button with proper icon */}
            <div className="relative">
              <button className="flex items-center text-gray-600 hover:text-indigo-600 transition-colors duration-200">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
                <span className="ml-1 hidden md:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Language banner - similar to Image 2 */}
      {selectedLanguage && (
        <div className="bg-indigo-600 text-white py-3 px-4">
          <div className="container mx-auto flex justify-between items-center">
            <div className="flex items-center">
              <span className="text-2xl mr-2">{selectedLanguage.flag}</span>
              <span className="font-medium">{selectedLanguage.name}</span>
            </div>
            <button 
              onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
              className="bg-white bg-opacity-20 px-3 py-1 rounded text-sm hover:bg-opacity-30 transition-all"
            >
              Change
            </button>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        {/* If no language is selected, show language selector prominently */}
        {!selectedLanguage ? (
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
            <div className="bg-white rounded-xl shadow-sm p-8">
              <h2 className="text-xl font-semibold mb-4">Select a Language</h2>
              <LanguageSelector onLanguageSelect={handleLanguageSelect} />
            </div>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <aside className="lg:w-1/4 space-y-6">
              {/* User Profile - Similar to Image 2 */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xl font-medium">
                    {user?.name?.charAt(0) || "T"}
                  </div>
                  <div>
                    <h3 className="font-medium text-lg">{user?.name || "Test User"}</h3>
                    <p className="text-sm text-gray-500 flex items-center">
                      {selectedLanguage && (
                        <>
                          <span className="mr-1">{selectedLanguage.flag}</span>
                          <span>{selectedLanguage.name}</span>
                        </>
                      )}
                      {userProgress?.level && (
                        <span className="ml-1">
                          {selectedLanguage ? " - " : ""}{userProgress.level || "A2"}
                        </span>
                      )}
                      {!selectedLanguage && "Select a language"}
                    </p>
                  </div>
                </div>
                
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-500">Progress</span>
                    <span className="text-indigo-600 font-medium">{user?.progress || "65"}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div 
                      className="bg-indigo-600 rounded-full h-2" 
                      style={{ width: `${user?.progress || 65}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-xl font-bold text-indigo-600">{user?.lessonsCompleted || "28"}</div>
                    <div className="text-xs text-gray-500 mt-1">Lessons</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-indigo-600">{user?.streak || "14"}</div>
                    <div className="text-xs text-gray-500 mt-1">Streak</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-indigo-600">{user?.level || "A2"}</div>
                    <div className="text-xs text-gray-500 mt-1">Level</div>
                  </div>
                </div>
              </div>
              
              {/* Quick Actions - with proper icons */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-bold text-lg mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button 
                    onClick={() => navigate("/lessons")}
                    className="w-full flex items-center space-x-3 px-4 py-3 bg-indigo-50 text-indigo-700 rounded-lg hover:shadow-md transition-all duration-300 hover:bg-indigo-100"
                  >
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"></path>
                      </svg>
                    </div>
                    <span className="font-medium">Continue Learning</span>
                  </button>
                  <button className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 rounded-lg hover:shadow-md transition-all duration-300">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd"></path>
                      </svg>
                    </div>
                    <span className="font-medium">Speaking Practice</span>
                  </button>
                  <button className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 rounded-lg hover:shadow-md transition-all duration-300">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"></path>
                      </svg>
                    </div>
                    <span className="font-medium">Writing Exercises</span>
                  </button>
                  <Link to="/chat" className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 rounded-lg hover:shadow-md transition-all duration-300">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"></path>
                        <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"></path>
                      </svg>
                    </div>
                    <span className="font-medium">Chat with LinguaAI</span>
                  </Link>
                </div>
              </div>
              
              {/* Daily Goal */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-bold text-lg mb-4">Daily Goal</h3>
                <div className="flex justify-center">
                  <div className="relative w-32 h-32">
                    <svg className="w-full h-full" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="18" cy="18" r="16" fill="none" stroke="#e6e6e6" strokeWidth="2"></circle>
                      <circle 
                        cx="18" 
                        cy="18" 
                        r="16" 
                        fill="none" 
                        stroke="#4f46e5" 
                        strokeWidth="2" 
                        strokeDasharray={`${dailyGoal}, 100`} 
                        strokeLinecap="round" 
                        transform="rotate(-90 18 18)"
                      ></circle>
                      <text x="18" y="18" textAnchor="middle" dominantBaseline="middle" fill="#4f46e5" fontSize="8" fontWeight="bold">
                        {dailyGoal}%
                      </text>
                      <text x="18" y="22" textAnchor="middle" dominantBaseline="middle" fill="#6b7280" fontSize="3">
                        Completed
                      </text>
                    </svg>
                  </div>
                </div>
                <button className="w-full mt-4 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                  Complete Today's Goal
                </button>
              </div>
            </aside>
            
            {/* Main Content */}
            <div className="lg:w-3/4 space-y-6">
              {/* Progress Visualization */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-2xl font-bold mb-6">Your Learning Progress</h2>
                <div className="h-64">
                  {progressData.length > 0 && (
                    <div className="flex justify-between h-full">
                      {progressData.map((item, index) => (
                        <div key={index} className="flex flex-col items-center justify-end w-full">
                          <div className="w-full px-2">
                            <div 
                              className="bg-indigo-400 rounded-t-md w-full" 
                              style={{ height: `${item.value}%` }}
                            ></div>
                          </div>
                          <div className="text-xs text-gray-600 mt-2">{item.name}</div>
                          <div className="text-xs font-medium">{item.value}%</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Available Lessons */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Available Lessons</h2>
                  <button className="text-indigo-600 hover:text-indigo-800">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd"></path>
                    </svg>
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {lessons.map((lesson) => {
                    const status = lesson.completed ? "Completed" : "Available";
                    const actionText = lesson.completed ? "Review" : "Start";
                    
                    return (
                      <div key={lesson.id} className="border border-gray-200 rounded-lg overflow-hidden">
                        <div className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <span className="inline-block px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded">
                              {lesson.difficulty}
                            </span>
                            <span className="text-sm font-medium text-gray-500">
                              {status}
                            </span>
                          </div>
                          <h3 className="font-medium text-lg mb-1">{lesson.title}</h3>
                          <p className="text-gray-600 text-sm mb-4">{lesson.description}</p>
                          
                          <div className="flex justify-between items-center">
                            {lesson.completed && (
                              <div className="flex items-center">
                                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                                </svg>
                                <span className="text-sm text-green-500 ml-1">Completed</span>
                              </div>
                            )}
                            <button 
                              onClick={() => navigate(`/lesson/${lesson.id}`)}
                              className="px-4 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors text-sm"
                            >
                              {actionText}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Personalized Assignments */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Your Personalized Assignments</h2>
                  <button className="text-indigo-600 hover:text-indigo-800">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd"></path>
                    </svg>
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {assignments.map((assignment) => (
                    <div key={assignment.id} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${assignment.difficulty === 'EASY' ? 'bg-green-100 text-green-800' : assignment.difficulty === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                            {assignment.difficulty}
                          </span>
                          <span className="text-sm font-medium text-gray-500">
                            Due: {new Date(assignment.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                        <h3 className="font-medium text-lg mb-1">{assignment.title}</h3>
                        <p className="text-gray-600 text-sm mb-4">{assignment.description}</p>
                        
                        <button className="w-full px-4 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors text-sm">
                          Start
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Areas to Improve */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-2xl font-bold mb-6">Areas to Improve</h2>
                <div className="space-y-4">
                  {areasToImprove.map((area) => (
                    <div key={area.id} className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium text-lg">{area.name}</h3>
                        <p className="text-gray-600 text-sm">{area.description}</p>
                      </div>
                      <button className="px-4 py-1 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 transition-colors">
                        Practice
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      
      {/* Floating Action Button - Chat with AI */}
      <div className="fixed bottom-8 right-8">
        <Link 
          to="/chat" 
          className="floating-button w-16 h-16 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xl hover:bg-indigo-700 shadow-lg transition-all duration-300 hover:scale-110 group"
          title="Chat with LinguaAI"
        >
          <div className="relative">
            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path>
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"></path>
            </svg>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"></span>
          </div>
          <span className="absolute -top-10 bg-white text-indigo-700 px-3 py-1 rounded-lg text-sm font-medium shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            Chat with LinguaAI
          </span>
        </Link>
      </div>
    </div>
  );
