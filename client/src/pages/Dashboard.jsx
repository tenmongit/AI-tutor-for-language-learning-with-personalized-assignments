import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";
import ProgressChart from "../components/ProgressChart";
import ProgressBar from "../components/ProgressBar";
import LanguageSelector from "../components/LanguageSelector";

export default function Dashboard() {
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
          setUser({
            name: "Sarah Johnson",
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
          { title: "Greetings", total: 10, correct: 8 },
          { title: "Grammar", total: 15, correct: 9 },
          { title: "Vocabulary", total: 20, correct: 18 },
          { title: "Listening", total: 12, correct: 7 },
          { title: "Speaking", total: 8, correct: 6 }
        ]);

        // Mock areas to improve
        setAreasToImprove([
          { id: 1, title: "Verb Conjugation", description: "Practice regular and irregular verb forms" },
          { id: 2, title: "Listening Comprehension", description: "Work on understanding native speakers" },
          { id: 3, title: "Vocabulary Expansion", description: "Learn more words related to daily activities" }
        ]);

        // Mock personalized assignments
        setAssignments([
          { id: 1, title: "Past Tense Practice", description: "Complete exercises on past tense verbs", dueDate: "2025-05-15", difficulty: 3 },
          { id: 2, title: "Conversation Practice", description: "Record yourself speaking for 5 minutes", dueDate: "2025-05-14", difficulty: 2 },
          { id: 3, title: "Reading Comprehension", description: "Read a short story and answer questions", dueDate: "2025-05-16", difficulty: 4 }
        ]);
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [currentUser, selectedLanguage]);

  useEffect(() => {
    if (selectedLanguage) {
      fetchLessons();
      fetchUserProgress();
      // Save selected language to localStorage
      localStorage.setItem(
        "selectedLanguage",
        JSON.stringify(selectedLanguage),
      );
    }
  }, [selectedLanguage]);

  const fetchLessons = async () => {
    if (!selectedLanguage) return;

    setLoading(true);
    try {
      // In a real implementation, this would fetch from your API with the language ID
      // For now, we'll use the existing lessons or mock data
      const response = await api.get(`/lessons${selectedLanguage.id ? `?languageId=${selectedLanguage.id}` : ''}`);
      setLessons(response.data);
      setError(null);
    } catch (err) {
      console.error("Failed to load lessons", err);
      setError("Failed to load lessons");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProgress = async () => {
    if (!selectedLanguage) return;

    try {
      // In a real implementation, this would fetch from your API with the language ID
      // For now, we'll use mock data
      const response = await api.get(`/progress${selectedLanguage.id ? `?languageId=${selectedLanguage.id}` : ''}`);
      setUserProgress(response.data);
    } catch (err) {
      console.error("Failed to load progress", err);
    }
  };

  const handleLanguageSelect = (language) => {
    setSelectedLanguage(language);
  };

  const getLessonStatus = (lessonId) => {
    if (!userProgress) return "locked";

    const lessonProgress = userProgress.lessons?.find(
      (l) => l.lessonId === lessonId,
    );
    if (!lessonProgress) return "locked";

    if (lessonProgress.completed) return "completed";
    if (lessonProgress.started) return "in-progress";
    if (lessonProgress.available) return "available";

    return "locked";
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
      {/* Header */}
      <header className="gradient-bg text-white shadow-lg">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <i className="fas fa-language text-2xl"></i>
            <h1 className="text-2xl font-bold">LinguaAI</h1>
          </div>
          <div className="flex items-center space-x-4">
            {selectedLanguage ? (
              <div className="relative language-selector">
                <button className="flex items-center space-x-2 bg-white bg-opacity-20 px-4 py-2 rounded-full">
                  <span>{selectedLanguage.flag} {selectedLanguage.name || user?.language || "Spanish"}</span>
                  <i className="fas fa-chevron-down text-xs"></i>
                </button>
                <button
                  onClick={() => setSelectedLanguage(null)}
                  className="ml-2 px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm"
                >
                  Change
                </button>
              </div>
            ) : (
              <div className="relative language-selector">
                <button className="flex items-center space-x-2 bg-white bg-opacity-20 px-4 py-2 rounded-full">
                  <span>{user?.language || "Spanish"}</span>
                  <i className="fas fa-chevron-down text-xs"></i>
                </button>
              </div>
            )}
            <div className="relative">
              <button className="w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                <i className="fas fa-user"></i>
              </button>
            </div>
          </div>
        </div>
      </header>

      {!selectedLanguage ? (
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

            {currentUser && (
              <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                <h2 className="text-xl font-semibold mb-2">
                  Welcome, {currentUser.name || user?.name || "User"}!
                </h2>
                <p className="text-gray-600">
                  Continue your language learning journey or start a new one.
                </p>
              </div>
            )}

            <LanguageSelector onLanguageSelect={handleLanguageSelect} />
          </div>
        </main>
      ) : (
        <main className="container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-1/4 space-y-6">
            {/* User Profile */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-2xl text-indigo-600">
                    {user?.name?.charAt(0) || "U"}
                  </div>
                  <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <h3 className="font-bold">{user?.name || currentUser?.name || "User"}</h3>
                  <p className="text-gray-500 text-sm">{user?.level} {user?.language}</p>
                </div>
              </div>
              
              <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-600">Progress</span>
                  <span className="text-sm font-bold">{user?.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-indigo-600 h-2 rounded-full" 
                    style={{ width: `${user?.progress}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="mt-6 grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-indigo-600">{user?.lessonsCompleted}</div>
                  <div className="text-xs text-gray-500">Lessons</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-indigo-600">{user?.streak}</div>
                  <div className="text-xs text-gray-500">Streak</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-indigo-600">{user?.level}</div>
                  <div className="text-xs text-gray-500">Level</div>
                </div>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="font-bold text-lg mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => navigate("/lessons")}
                  className="w-full flex items-center space-x-3 px-4 py-3 bg-indigo-50 text-indigo-700 rounded-lg"
                >
                  <i className="fas fa-book-open"></i>
                  <span>Continue Learning</span>
                </button>
                <button className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 rounded-lg">
                  <i className="fas fa-microphone"></i>
                  <span>Speaking Practice</span>
                </button>
                <button className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 rounded-lg">
                  <i className="fas fa-pen"></i>
                  <span>Writing Exercises</span>
                </button>
                <Link to="/chat" className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 rounded-lg">
                  <i className="fas fa-comment"></i>
                  <span>Chat with LinguaAI</span>
                </Link>
              </div>
            </div>
            
            {/* Daily Goal */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="font-bold text-lg mb-4">Daily Goal</h3>
              <div className="flex items-center justify-center">
                <div className="relative w-32 h-32">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle 
                      className="text-gray-200" 
                      strokeWidth="8" 
                      stroke="currentColor" 
                      fill="transparent" 
                      r="40" 
                      cx="50" 
                      cy="50" 
                    />
                    <circle 
                      className="text-indigo-600" 
                      strokeWidth="8" 
                      strokeDasharray="251.2" 
                      strokeDashoffset={251.2 * (1 - dailyGoal / 100)} 
                      strokeLinecap="round" 
                      stroke="currentColor" 
                      fill="transparent" 
                      r="40" 
                      cx="50" 
                      cy="50" 
                    />
                  </svg>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                    <span className="text-2xl font-bold">{dailyGoal}%</span>
                    <div className="text-xs text-gray-500">Completed</div>
                  </div>
                </div>
              </div>
              <button className="mt-4 w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                Complete Today's Goal
              </button>
            </div>
          </aside>
          
          {/* Main Content Area */}
          <div className="lg:w-3/4 space-y-6">
            {/* Progress Visualization */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Your Learning Progress</h2>
              </div>
              <div className="h-64">
                <ProgressChart data={progressData} />
              </div>
            </div>
            
            {/* Personalized Assignments */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Your Personalized Assignments</h2>
                <button className="text-indigo-600 hover:text-indigo-800">
                  <i className="fas fa-sync-alt"></i> Refresh
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {assignments.map((assignment) => (
                  <div 
                    key={assignment.id}
                    className="assignment-card bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 transition-all duration-300 cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-xs font-bold">
                        {assignment.difficulty === 2 ? "EASY" : assignment.difficulty === 3 ? "MEDIUM" : "HARD"}
                      </div>
                      <div className="text-xs text-gray-500">
                        Due: {assignment.dueDate}
                      </div>
                    </div>
                    <h3 className="font-bold text-lg mb-3">{assignment.title}</h3>
                    <p className="text-gray-600 text-sm mb-4">{assignment.description}</p>
                    <div className="flex justify-between items-center">
                      <div className="flex space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <i 
                            key={i}
                            className={`fas fa-star ${i < assignment.difficulty ? "text-yellow-400" : "text-gray-300"}`}
                          ></i>
                        ))}
                      </div>
                      <button className="bg-indigo-600 text-white px-4 py-1 rounded-full text-sm hover:bg-indigo-700">
                        Start
                      </button>
                    </div>
                  </div>
                ))}
                
                {/* If no assignments are available */}
                {assignments.length === 0 && (
                  <div className="col-span-3 text-center py-8">
                    <p className="text-gray-500">No assignments available. Check back later!</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Areas to Improve */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Areas to Improve</h2>
              </div>
              
              <div className="space-y-4">
                {areasToImprove.map((area) => (
                  <div key={area.id} className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{area.title}</h3>
                      <div className="text-sm text-gray-500">
                        {area.description}
                      </div>
                    </div>
                    <button className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-lg text-sm">
                      Practice
                    </button>
                  </div>
                ))}
                
                {areasToImprove.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No improvement areas identified yet. Keep practicing!</p>
                )}
              </div>
            </div>
          </div>
        </main>
      )}
      
      {/* Floating Action Button */}
      <div className="fixed bottom-8 right-8">
        <Link to="/chat" className="floating-button w-14 h-14 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xl hover:bg-indigo-700 shadow-lg">
          <i className="fas fa-comment"></i>
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="gradient-bg text-white shadow-lg">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <i className="fas fa-language text-2xl"></i>
            <h1 className="text-2xl font-bold">LinguaAI</h1>
          </div>
          <div className="flex items-center space-x-4">
            {selectedLanguage ? (
              <div className="relative language-selector">
                <button className="flex items-center space-x-2 bg-white bg-opacity-20 px-4 py-2 rounded-full">
                  <span>{selectedLanguage.flag} {selectedLanguage.name || user?.language || "Spanish"}</span>
                  <i className="fas fa-chevron-down text-xs"></i>
                </button>
                <button
                  onClick={() => setSelectedLanguage(null)}
                  className="ml-2 px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm"
                >
                  Change
                </button>
              </div>
            ) : (
              <div className="relative language-selector">
                <button className="flex items-center space-x-2 bg-white bg-opacity-20 px-4 py-2 rounded-full">
                  <span>{user?.language || "Spanish"}</span>
                  <i className="fas fa-chevron-down text-xs"></i>
                </button>
              </div>
            )}
            <div className="relative">
              <button className="w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                <i className="fas fa-user"></i>
              </button>
            </div>
          </div>
        </div>
      </header>

      {!selectedLanguage ? (
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

            {currentUser && (
              <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                <h2 className="text-xl font-semibold mb-2">
                  Welcome, {currentUser.name || user?.name || "User"}!
                </h2>
                <p className="text-gray-600">
                  Continue your language learning journey or start a new one.
                </p>
              </div>
            )}

            <LanguageSelector onLanguageSelect={handleLanguageSelect} />
          </div>
        </main>
      ) : (
        <main className="container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-1/4 space-y-6">
            {/* User Profile */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-2xl text-indigo-600">
                    {user?.name?.charAt(0) || "U"}
              <h2 className="text-2xl font-bold">Your Learning Progress</h2>
            </div>
            <div className="h-64">
              <ProgressChart data={progressData} />
            </div>
          </div>
          
          {/* Personalized Assignments */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Your Personalized Assignments</h2>
              <button className="text-indigo-600 hover:text-indigo-800">
                <i className="fas fa-sync-alt"></i> Refresh
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lessons.map((lesson, index) => (
                <div 
                  key={lesson.id || index}
                  onClick={() => navigate(`/lessons/${lesson.id}`)}
                  className="assignment-card bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 transition-all duration-300 cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-xs font-bold">
                      {lesson.level?.toUpperCase() || "BEGINNER"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {lesson.completedAt ? "Completed" : "In Progress"}
                    </div>
                  </div>
                  <h3 className="font-bold text-lg mb-3">{lesson.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{lesson.description}</p>
                  <div className="flex justify-between items-center">
                    <div className="flex space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <i 
                          key={i}
                          className={`fas fa-star ${i < lesson.difficulty ? "text-yellow-400" : "text-gray-300"}`}
                        ></i>
                      ))}
                    </div>
                    <button className="bg-indigo-600 text-white px-4 py-1 rounded-full text-sm hover:bg-indigo-700">
                      {lesson.completedAt ? "Review" : "Start"}
                    </button>
                  </div>
                </div>
              ))}
              
              {/* If no lessons are available */}
              {lessons.length === 0 && (
                <div className="col-span-3 text-center py-8">
                  <p className="text-gray-500">No assignments available. Check back later!</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Weakness Areas */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Areas to Improve</h2>
            </div>
            
            <div className="space-y-4">
              {progressData
                .sort((a, b) => (a.correct / a.total) - (b.correct / b.total))
                .slice(0, 3)
                .map((area, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{area.title}</h3>
                      <div className="text-sm text-gray-500">
                        {Math.round((area.correct / area.total) * 100)}% accuracy
                      </div>
                    </div>
                    <button className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-lg text-sm">
                      Practice
                    </button>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      </main>
      
      {/* Floating Action Button */}
      <div className="fixed bottom-8 right-8">
        <Link to="/chat" className="floating-button w-14 h-14 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xl hover:bg-indigo-700">
          <i className="fas fa-comment"></i>
        </Link>
      </div>
    </div>
  );
}
