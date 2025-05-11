import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";
import LanguageSelector from "../components/LanguageSelector";
import ProgressBar from "../components/ProgressBar";

function DashboardPage() {
  const { currentUser } = useAuth();
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [userProgress, setUserProgress] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
      const response = await api.get(
        `/lessons?languageId=${selectedLanguage.id}`,
      );
      setLessons(response.data);
      setError(null);
    } catch (err) {
      setError("Failed to load lessons");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProgress = async () => {
    if (!selectedLanguage) return;

    try {
      const response = await api.get(
        `/progress?languageId=${selectedLanguage.id}`,
      );
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

    const lessonProgress = userProgress.lessons.find(
      (l) => l.lessonId === lessonId,
    );
    if (!lessonProgress) return "locked";

    if (lessonProgress.completed) return "completed";
    if (lessonProgress.started) return "in-progress";
    if (lessonProgress.available) return "available";

    return "locked";
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      {currentUser && (
        <div className="card mb-8">
          <h2 className="text-xl font-semibold mb-2">
            Welcome, {currentUser.name}!
          </h2>
          <p className="text-gray-600">
            Continue your language learning journey or start a new one.
          </p>
        </div>
      )}

      {!selectedLanguage ? (
        <LanguageSelector onLanguageSelect={handleLanguageSelect} />
      ) : (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                <span className="text-xl">{selectedLanguage.flag}</span>
              </div>
              <h2 className="text-2xl font-bold">{selectedLanguage.name}</h2>
            </div>
            <button
              onClick={() => setSelectedLanguage(null)}
              className="btn btn-secondary"
            >
              Change Language
            </button>
          </div>

          {userProgress && (
            <div className="card mb-8">
              <h3 className="text-lg font-semibold mb-2">Your Progress</h3>
              <ProgressBar
                current={userProgress.completedLessons}
                total={userProgress.totalLessons}
              />
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center my-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Lessons</h3>

              {lessons.length === 0 ? (
                <p className="text-gray-600">
                  No lessons available for this language yet.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {lessons.map((lesson) => {
                    const status = getLessonStatus(lesson.id);
                    const isLocked = status === "locked";

                    return (
                      <div
                        key={lesson.id}
                        className={`card ${isLocked ? "opacity-60" : ""}`}
                      >
                        <h4 className="text-lg font-semibold mb-2">
                          {lesson.title}
                        </h4>
                        <p className="text-gray-600 mb-4">
                          {lesson.description}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <span
                              className={`inline-block w-3 h-3 rounded-full mr-2 ${status === "completed" ? "bg-green-500" : status === "in-progress" ? "bg-yellow-500" : "bg-gray-300"}`}
                            ></span>
                            <span className="text-sm text-gray-600">
                              {status === "completed"
                                ? "Completed"
                                : status === "in-progress"
                                  ? "In Progress"
                                  : status === "available"
                                    ? "Available"
                                    : "Locked"}
                            </span>
                          </div>

                          {!isLocked && (
                            <Link
                              to={`/lesson/${lesson.id}`}
                              className="btn btn-primary"
                            >
                              {status === "completed"
                                ? "Review"
                                : status === "in-progress"
                                  ? "Continue"
                                  : "Start"}
                            </Link>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default DashboardPage;
