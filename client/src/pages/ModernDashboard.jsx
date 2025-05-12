import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";
import LanguageSelector from "../components/LanguageSelector";
import ModernNavbar from "../components/ModernNavbar";

export default function ModernDashboard() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [progressData, setProgressData] = useState([]);
  const [dailyGoal, setDailyGoal] = useState(70);
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [assignments, setAssignments] = useState([]);
  const [areasToImprove, setAreasToImprove] = useState([]);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [showCompletionMessage, setShowCompletionMessage] = useState(false);
  const [recentlyCompletedLesson, setRecentlyCompletedLesson] = useState(null);

  // Load saved language and check for completed lessons on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem("selectedLanguage");
    if (savedLanguage) {
      try {
        setSelectedLanguage(JSON.parse(savedLanguage));
      } catch (e) {
        localStorage.removeItem("selectedLanguage");
      }
    }
    
    // Load all completed lessons from local storage
    try {
      const storedCompletedLessons = localStorage.getItem("completedLessons");
      if (storedCompletedLessons) {
        const parsedLessons = JSON.parse(storedCompletedLessons);
        if (Array.isArray(parsedLessons) && parsedLessons.length > 0) {
          setCompletedLessons(parsedLessons);
          
          // Set the most recently completed lesson for the notification
          const sortedLessons = [...parsedLessons].sort((a, b) => 
            new Date(b.timestamp) - new Date(a.timestamp)
          );
          
          const mostRecent = sortedLessons[0];
          setRecentlyCompletedLesson(mostRecent);
          
          // Only show completion message if the lesson was completed recently (last 5 minutes)
          const recentTimeThreshold = 5 * 60 * 1000; // 5 minutes in milliseconds
          const lessonTime = new Date(mostRecent.timestamp).getTime();
          const currentTime = new Date().getTime();
          
          if (currentTime - lessonTime < recentTimeThreshold) {
            setShowCompletionMessage(true);
          }
        }
      }
    } catch (error) {
      console.error("Error loading completed lessons:", error);
    }
    
    // Legacy support for individual lesson completion flags
    const lessonCompleted = localStorage.getItem("lessonCompleted");
    if (lessonCompleted === "true" && !recentlyCompletedLesson) {
      const completedLessonId = localStorage.getItem("completedLessonId");
      const completedLessonLanguage = localStorage.getItem("completedLessonLanguage");
      const completedAt = localStorage.getItem("lessonCompletedAt");
      
      if (completedLessonId) {
        const legacyLesson = {
          id: completedLessonId,
          language: completedLessonLanguage || "Spanish",
          timestamp: completedAt || new Date().toISOString(),
          badge: "Basic" // Default badge for legacy completed lessons
        };
        
        setRecentlyCompletedLesson(legacyLesson);
        setShowCompletionMessage(true);
      }
    }
  }, []);

  // Fetch user data and mock data based on selected language
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Try to fetch completed lessons from the API if user is logged in
        let completedLessonCount = 0;
        let userCompletedLessons = [];
        
        const token = localStorage.getItem('token');
        if (token) {
          try {
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            const progressResponse = await api.get('/progress');
            if (progressResponse.data && progressResponse.data.completedLessons) {
              completedLessonCount = progressResponse.data.completedLessons.length;
              userCompletedLessons = progressResponse.data.completedLessons;
              setCompletedLessons(userCompletedLessons);
            }
          } catch (err) {
            console.error("Error fetching user progress:", err);
            // Fall back to mock data if API call fails
          }
        }
        
        // Mock user data with real completed lesson count if available
        setUser({
          name: currentUser?.name || "Test User",
          language: selectedLanguage?.name || "Spanish",
          progress: 65,
          lessonsCompleted: completedLessonCount || 28,
          streak: 14,
          level: "A2"
        });

        // Mock progress data - same categories for all languages
        setProgressData([
          { name: "Greetings", value: 80 },
          { name: "Grammar", value: 60 },
          { name: "Vocabulary", value: 90 },
          { name: "Listening", value: 68 },
          { name: "Speaking", value: 75 }
        ]);

        // Mock lessons data based on selected language
        if (selectedLanguage) {
          let mockLessons = [];
          
          // Define base lessons for each language
          const languageLessons = {
            "Spanish": [
              { id: 1, title: "Greetings and Introductions", description: "Learn basic Spanish greetings and how to introduce yourself.", progress: 0 },
              { id: 2, title: "Numbers and Counting", description: "Learn to count and use numbers in Spanish.", progress: 0 },
              { id: 3, title: "Common Phrases", description: "Essential phrases for everyday Spanish conversations.", progress: 0 }
            ],
            "French": [
              { id: 1, title: "Salutations et Présentations", description: "Learn basic French greetings and introductions.", progress: 0 },
              { id: 2, title: "Les Nombres", description: "Learn to count and use numbers in French.", progress: 0 },
              { id: 3, title: "Phrases Courantes", description: "Essential phrases for everyday French conversations.", progress: 0 }
            ],
            "German": [
              { id: 1, title: "Begrüßungen und Vorstellungen", description: "Learn basic German greetings and introductions.", progress: 0 },
              { id: 2, title: "Zahlen und Zählen", description: "Learn to count and use numbers in German.", progress: 0 },
              { id: 3, title: "Häufige Ausdrücke", description: "Essential phrases for everyday German conversations.", progress: 0 }
            ],
            "Japanese": [
              { id: 1, title: "挨拶と自己紹介", description: "Learn basic Japanese greetings and self-introductions.", progress: 0 },
              { id: 2, title: "数字と数え方", description: "Learn Japanese numbers and counting systems.", progress: 0 },
              { id: 3, title: "基本的なフレーズ", description: "Essential phrases for everyday Japanese conversations.", progress: 0 }
            ]
          };
          
          // Get lessons for the selected language
          mockLessons = languageLessons[selectedLanguage.name] || languageLessons["Spanish"];
          
          // Mark lessons as completed based on API data or recently completed lesson
          mockLessons = mockLessons.map(lesson => {
            // Check if this lesson is in the completedLessons array from API
            const isCompleted = completedLessons.some(id => id === lesson.id.toString() || id === lesson.id);
            
            // Check if this is the recently completed lesson
            const isRecentlyCompleted = recentlyCompletedLesson && 
                                       (recentlyCompletedLesson.id === lesson.id.toString() || 
                                        recentlyCompletedLesson.id === lesson.id) &&
                                       recentlyCompletedLesson.language === selectedLanguage.name;
            
            return {
              ...lesson,
              completed: isCompleted || isRecentlyCompleted,
              progress: isCompleted || isRecentlyCompleted ? 100 : lesson.progress
            };
          });
          
          setLessons(mockLessons);
        }

        // Language-specific content based on selected language
        const languageContent = {
          Spanish: {
            assignments: [
              { id: 1, title: "Spanish Past Tense", difficulty: "MEDIUM", dueDate: "2025-05-15", description: "Complete exercises on Spanish past tense verbs" },
              { id: 2, title: "Spanish Conversation", difficulty: "EASY", dueDate: "2025-05-14", description: "Record yourself speaking Spanish for 5 minutes" }
            ],
            areasToImprove: [
              { id: 1, name: "Spanish Verb Conjugation", description: "Practice regular and irregular Spanish verb forms" },
              { id: 2, name: "Spanish Listening", description: "Work on understanding native Spanish speakers" }
            ]
          },
          French: {
            assignments: [
              { id: 1, title: "French Passé Composé", difficulty: "MEDIUM", dueDate: "2025-05-16", description: "Complete exercises on French past tense" },
              { id: 2, title: "French Pronunciation", difficulty: "EASY", dueDate: "2025-05-15", description: "Practice French pronunciation for 10 minutes" }
            ],
            areasToImprove: [
              { id: 1, name: "French Articles", description: "Practice using definite and indefinite articles" },
              { id: 2, name: "French Nasal Sounds", description: "Work on pronouncing French nasal vowels correctly" }
            ]
          },
          German: {
            assignments: [
              { id: 1, title: "German Cases", difficulty: "HARD", dueDate: "2025-05-17", description: "Practice using German nominative and accusative cases" },
              { id: 2, title: "German Word Order", difficulty: "MEDIUM", dueDate: "2025-05-16", description: "Complete exercises on German sentence structure" }
            ],
            areasToImprove: [
              { id: 1, name: "German Articles", description: "Practice der, die, das and their variations" },
              { id: 2, name: "German Compounds", description: "Work on understanding compound nouns in German" }
            ]
          },
          Japanese: {
            assignments: [
              { id: 1, title: "Hiragana Practice", difficulty: "MEDIUM", dueDate: "2025-05-18", description: "Complete Hiragana writing exercises" },
              { id: 2, title: "Basic Particles", difficulty: "HARD", dueDate: "2025-05-17", description: "Practice using は, を, and が particles" }
            ],
            areasToImprove: [
              { id: 1, name: "Japanese Pronunciation", description: "Work on pitch accent and pronunciation" },
              { id: 2, name: "Basic Kanji", description: "Learn and practice the most common kanji characters" }
            ]
          }
        };

        // Set content based on selected language or default to Spanish
        const currentLanguage = selectedLanguage?.name || "Spanish";
        const content = languageContent[currentLanguage] || languageContent.Spanish;
        
        setAssignments(content.assignments);
        setAreasToImprove(content.areasToImprove);

        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser, selectedLanguage]);

  // Helper function to determine lesson difficulty based on lesson ID
  const determineLessonDifficulty = (lessonId) => {
    // Convert to number if it's a string
    const id = typeof lessonId === 'string' ? parseInt(lessonId, 10) : lessonId;
    
    // Assign difficulty based on lesson ID
    if (id <= 3) {
      return "Beginner";
    } else if (id > 3 && id <= 6) {
      return "Intermediate";
    } else {
      return "Advanced";
    }
  };
  
  const handleLanguageSelect = (language) => {
    setSelectedLanguage(language);
    localStorage.setItem("selectedLanguage", JSON.stringify(language));
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
      <ModernNavbar onLanguageSelect={handleLanguageSelect} />
      <main className="container mx-auto px-4 py-8">
        {/* Lesson completion message */}
        {showCompletionMessage && recentlyCompletedLesson && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-green-800">Lesson completed!</h3>
              <div className="mt-1 text-sm text-green-700">
                <p>Your progress has been saved. Keep up the good work!</p>
              </div>
              <div className="mt-2">
                <button
                  type="button"
                  onClick={() => setShowCompletionMessage(false)}
                  className="-mr-1 flex p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <span className="sr-only">Dismiss</span>
                  <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
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
              {/* User Profile */}
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
                      {user?.level && (
                        <span className="ml-1">
                          {selectedLanguage ? " - " : ""}{user.level}
                        </span>
                      )}
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
              
              {/* Quick Actions - Improved with better UI and icons */}
              <div className="bg-white rounded-xl shadow-sm p-6 overflow-hidden">
                <h3 className="font-bold text-lg mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 gap-3">
                  <button 
                    onClick={() => navigate("/lessons")}
                    className="group w-full flex items-center px-4 py-3 bg-gradient-to-r from-indigo-50 to-indigo-100 text-indigo-700 rounded-lg hover:shadow-md transition-all duration-300 hover:from-indigo-100 hover:to-indigo-200 relative overflow-hidden"
                  >
                    <div className="absolute inset-y-0 left-0 w-1 bg-indigo-600 transform transition-all duration-300 group-hover:w-2"></div>
                    <div className="z-10 w-12 h-12 rounded-full bg-white flex items-center justify-center text-indigo-600 shadow-sm group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                      </svg>
                    </div>
                    <div className="ml-4">
                      <span className="font-semibold block">Continue Learning</span>
                      <span className="text-xs text-indigo-600 opacity-80">Resume your last lesson</span>
                    </div>
                    <svg className="w-5 h-5 ml-auto text-indigo-500 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                  </button>
                  
                  <button className="group w-full flex items-center px-4 py-3 bg-gradient-to-r from-red-50 to-red-100 text-red-700 rounded-lg hover:shadow-md transition-all duration-300 hover:from-red-100 hover:to-red-200 relative overflow-hidden">
                    <div className="absolute inset-y-0 left-0 w-1 bg-red-600 transform transition-all duration-300 group-hover:w-2"></div>
                    <div className="z-10 w-12 h-12 rounded-full bg-white flex items-center justify-center text-red-600 shadow-sm group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>
                      </svg>
                    </div>
                    <div className="ml-4">
                      <span className="font-semibold block">Speaking Practice</span>
                      <span className="text-xs text-red-600 opacity-80">Improve your pronunciation</span>
                    </div>
                    <svg className="w-5 h-5 ml-auto text-red-500 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                  </button>
                  
                  <button className="group w-full flex items-center px-4 py-3 bg-gradient-to-r from-green-50 to-green-100 text-green-700 rounded-lg hover:shadow-md transition-all duration-300 hover:from-green-100 hover:to-green-200 relative overflow-hidden">
                    <div className="absolute inset-y-0 left-0 w-1 bg-green-600 transform transition-all duration-300 group-hover:w-2"></div>
                    <div className="z-10 w-12 h-12 rounded-full bg-white flex items-center justify-center text-green-600 shadow-sm group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                      </svg>
                    </div>
                    <div className="ml-4">
                      <span className="font-semibold block">Writing Exercises</span>
                      <span className="text-xs text-green-600 opacity-80">Practice your writing skills</span>
                    </div>
                    <svg className="w-5 h-5 ml-auto text-green-500 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                  </button>
                  
                  <Link to="/chat" className="group w-full flex items-center px-4 py-3 bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 rounded-lg hover:shadow-md transition-all duration-300 hover:from-purple-100 hover:to-purple-200 relative overflow-hidden">
                    <div className="absolute inset-y-0 left-0 w-1 bg-purple-600 transform transition-all duration-300 group-hover:w-2"></div>
                    <div className="z-10 w-12 h-12 rounded-full bg-white flex items-center justify-center text-purple-600 shadow-sm group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
                      </svg>
                    </div>
                    <div className="ml-4">
                      <span className="font-semibold block">Chat with LinguaAI</span>
                      <span className="text-xs text-purple-600 opacity-80">Get help from your AI tutor</span>
                    </div>
                    <svg className="w-5 h-5 ml-auto text-purple-500 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                    </svg>
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
              {/* Progress Visualization - Improved with better bar charts */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-2xl font-bold mb-4">Your Learning Progress</h2>
                <p className="text-gray-500 text-sm mb-6">Track your progress across different language skills</p>
                
                <div className="h-80">
                  {progressData.length > 0 && (
                    <div className="grid grid-cols-5 gap-6 h-full">
                      {progressData.map((item, index) => {
                        // Generate a unique gradient for each bar
                        const colors = [
                          ['from-blue-400 to-blue-500', 'bg-blue-100', 'text-blue-700'],
                          ['from-indigo-400 to-indigo-500', 'bg-indigo-100', 'text-indigo-700'],
                          ['from-purple-400 to-purple-500', 'bg-purple-100', 'text-purple-700'],
                          ['from-green-400 to-green-500', 'bg-green-100', 'text-green-700'],
                          ['from-red-400 to-red-500', 'bg-red-100', 'text-red-700']
                        ];
                        
                        const [gradientClass, bgClass, textClass] = colors[index % colors.length];
                        
                        return (
                          <div key={index} className="flex flex-col items-center h-full">
                            <div className="relative flex flex-col items-center justify-end w-full h-full">
                              {/* Background bar */}
                              <div className="absolute inset-0 w-full h-full bg-gray-100 rounded-lg"></div>
                              
                              {/* Progress bar */}
                              <div 
                                className={`absolute bottom-0 w-full bg-gradient-to-t ${gradientClass} rounded-lg transition-all duration-1000 ease-out`} 
                                style={{ height: `${item.value}%` }}
                              ></div>
                              
                              {/* Percentage indicator */}
                              <div className={`absolute -top-7 left-1/2 transform -translate-x-1/2 ${bgClass} ${textClass} text-xs font-bold rounded-full w-10 h-10 flex items-center justify-center shadow-sm`}>
                                {item.value}%
                              </div>
                              
                              {/* Horizontal lines for scale */}
                              {[25, 50, 75].map(line => (
                                <div 
                                  key={line}
                                  className="absolute w-full h-px bg-gray-200" 
                                  style={{ bottom: `${line}%` }}
                                ></div>
                              ))}
                            </div>
                            
                            {/* Label */}
                            <div className="mt-4 text-center">
                              <div className="text-sm font-medium">{item.name}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Available Lessons - Improved with better UI and icons */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-bold">Available Lessons</h2>
                    <p className="text-gray-500 text-sm mt-1">Continue your language learning journey</p>
                  </div>
                  <div className="flex space-x-2">
                    <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
                      </svg>
                    </button>
                    <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {lessons.map((lesson) => {
                    const status = lesson.completed ? "Completed" : "Available";
                    const actionText = lesson.completed ? "Review" : "Start";
                    
                    // Determine lesson difficulty based on ID if not explicitly set
                    const difficulty = lesson.difficulty || determineLessonDifficulty(lesson.id);
                    
                    const difficultyColors = {
                      'BEGINNER': 'bg-green-100 text-green-800 border-green-200',
                      'INTERMEDIATE': 'bg-yellow-100 text-yellow-800 border-yellow-200',
                      'ADVANCED': 'bg-red-100 text-red-800 border-red-200',
                      'Beginner': 'bg-green-100 text-green-800 border-green-200',
                      'Intermediate': 'bg-yellow-100 text-yellow-800 border-yellow-200', 
                      'Advanced': 'bg-red-100 text-red-800 border-red-200'
                    };
                    const difficultyColor = difficultyColors[difficulty] || 'bg-indigo-100 text-indigo-800 border-indigo-200';
                    
                    return (
                      <div 
                        key={lesson.id} 
                        className={`relative bg-white border ${lesson.completed ? 'border-green-200' : 'border-gray-200'} rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group`}
                      >
                        {lesson.completed && (
                          <div className="absolute top-0 right-0">
                            <div className="bg-green-500 text-white px-3 py-1 rounded-bl-lg text-xs font-medium flex items-center">
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                              </svg>
                              Completed
                            </div>
                          </div>
                        )}
                        
                        <div className="p-5">
                          <div className="flex items-center mb-3">
                            <span className={`inline-block px-2.5 py-1 text-xs font-medium rounded-full border ${difficultyColor}`}>
                              {difficulty || lesson.difficulty || "Beginner"}
                            </span>
                          </div>
                          
                          <h3 className="font-semibold text-lg mb-2 group-hover:text-indigo-600 transition-colors">{lesson.title}</h3>
                          <p className="text-gray-600 text-sm mb-4">{lesson.description}</p>
                          
                          <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                            <div className="flex items-center text-gray-500 text-sm">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                              </svg>
                              15 min
                            </div>
                            
                            <button 
                              onClick={() => navigate(`/lesson/${lesson.id}?language=${encodeURIComponent(selectedLanguage?.name || 'Spanish')}`)}
                              className={`px-4 py-1.5 rounded-lg text-sm font-medium flex items-center ${lesson.completed ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-indigo-600 text-white hover:bg-indigo-700'} transition-colors`}
                            >
                              {actionText}
                              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <div className="mt-6 text-center">
                  <button className="px-6 py-2 bg-white border border-indigo-200 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors font-medium flex items-center mx-auto">
                    View All Lessons
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* Completed Lessons with Badges */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-bold text-lg mb-4">Completed Lessons</h3>
                {completedLessons.length > 0 ? (
                  <div className="space-y-4">
                    {completedLessons.map((lesson, index) => (
                      <div 
                        key={`${lesson.id}-${index}`} 
                        className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-start space-x-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-lg">
                              {lesson.languageFlag || "🇪🇸"}
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{lesson.title || `Lesson ${lesson.id}`}</h4>
                              <p className="text-sm text-gray-500 mt-1">
                                {lesson.language || "Spanish"} • Completed {new Date(lesson.timestamp).toLocaleDateString()}
                              </p>
                              {lesson.correctExercises && lesson.totalExercises && (
                                <p className="text-xs text-indigo-600 mt-1">
                                  Score: {lesson.correctExercises}/{lesson.totalExercises} exercises
                                </p>
                              )}
                            </div>
                          </div>
                          <span className="inline-block px-2.5 py-1 text-xs font-medium rounded-full border bg-indigo-100 text-indigo-800 border-indigo-200">
                            {lesson.badge || "Basic"}
                          </span>
                        </div>
                        
                        {/* Visual completion indicator */}
                        <div className="absolute top-0 right-0">
                          <div className="bg-green-500 text-white px-3 py-1 rounded-bl-lg text-xs font-medium flex items-center">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                            </svg>
                            Completed
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                    </svg>
                    <p className="mt-2 text-gray-500">No lessons completed yet</p>
                    <button 
                      onClick={() => navigate('/lessons')} 
                      className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Start Learning
                    </button>
                  </div>
                )}
              </div>
              
              {/* Areas to Improve */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-bold text-lg mb-4">Areas to Improve</h3>
                {areasToImprove.length > 0 ? (
                  <div className="space-y-3">
                    {areasToImprove.map((area) => (
                      <div key={area.id} className="p-3 bg-amber-50 border border-amber-100 rounded-lg">
                        <h4 className="font-medium text-amber-900">{area.name}</h4>
                        <p className="text-sm text-amber-700 mt-1">{area.description}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No areas to improve at this time.</p>
                )}
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
}
