import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import ProgressChart from "../components/ProgressChart";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [progressData, setProgressData] = useState([]);
  const [dailyGoal, setDailyGoal] = useState(70); // Percentage of daily goal completed

  useEffect(() => {
    // Fetch user data
    const fetchUserData = async () => {
      try {
        // In a real implementation, this would fetch from your API
        // For now, we'll use mock data
        setUser({
          name: "Sarah Johnson",
          proficiency: "Intermediate",
          language: "Spanish",
          progress: 65,
          lessonsCompleted: 28,
          streak: 14,
          level: "A2"
        });
        
        // Fetch lessons
        const response = await api.get("/lessons");
        setLessons(response.data);
        
        // Mock progress data for chart
        setProgressData([
          { title: "Greetings", total: 10, correct: 8 },
          { title: "Grammar", total: 15, correct: 9 },
          { title: "Vocabulary", total: 20, correct: 18 },
          { title: "Listening", total: 12, correct: 7 },
          { title: "Speaking", total: 8, correct: 6 }
        ]);
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, []);

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
            <h1 className="text-2xl font-bold">AI Language Tutor</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative language-selector">
              <button className="flex items-center space-x-2 bg-white bg-opacity-20 px-4 py-2 rounded-full">
                <span>{user?.language || "English"}</span>
                <i className="fas fa-chevron-down text-xs"></i>
              </button>
              <div className="language-options hidden absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                <div className="py-1">
                  <a href="#" className="block px-4 py-2 text-gray-800 hover:bg-indigo-100">Spanish</a>
                  <a href="#" className="block px-4 py-2 text-gray-800 hover:bg-indigo-100">French</a>
                  <a href="#" className="block px-4 py-2 text-gray-800 hover:bg-indigo-100">German</a>
                  <a href="#" className="block px-4 py-2 text-gray-800 hover:bg-indigo-100">Japanese</a>
                  <a href="#" className="block px-4 py-2 text-gray-800 hover:bg-indigo-100">Mandarin</a>
                </div>
              </div>
            </div>
            <div className="relative">
              <button className="w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                <i className="fas fa-user"></i>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
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
                <h3 className="font-bold">{user?.name || "User"}</h3>
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
                <span>Chat with AI Tutor</span>
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
            <button 
              onClick={() => navigate("/lessons")}
              className="w-full mt-4 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700"
            >
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
