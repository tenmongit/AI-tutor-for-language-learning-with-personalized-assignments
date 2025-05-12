import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import ExerciseCard from "../components/ExerciseCard";
import ProgressBar from "../components/ProgressBar";
import ModernNavbar from "../components/ModernNavbar";
import api from "../services/api";

function LessonPage() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [lesson, setLesson] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [completedExercises, setCompletedExercises] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lessonCompleted, setLessonCompleted] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(null);

  // Get the language from URL query parameter
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const languageParam = queryParams.get('language');
    
    if (languageParam) {
      setSelectedLanguage({
        name: languageParam,
        flag: getLanguageFlag(languageParam)
      });
    } else {
      // Use saved language from localStorage if available
      const savedLanguage = localStorage.getItem("selectedLanguage");
      if (savedLanguage) {
        try {
          setSelectedLanguage(JSON.parse(savedLanguage));
        } catch (e) {
          // Default to Spanish
          setSelectedLanguage({ name: "Spanish", flag: "🇪🇸" });
        }
      } else {
        // Default to Spanish
        setSelectedLanguage({ name: "Spanish", flag: "🇪🇸" });
      }
    }
  }, [location.search]);

  // Helper function to determine the appropriate badge for a lesson
  const determineLessonBadge = (lesson) => {
    if (!lesson) return "Basic";
    
    // Determine badge based on lesson difficulty, type, or category
    if (lesson.difficulty === "beginner" || lesson.id <= 3) {
      return "Beginner";
    } else if (lesson.difficulty === "intermediate" || (lesson.id > 3 && lesson.id <= 6)) {
      return "Intermediate";
    } else if (lesson.difficulty === "advanced" || lesson.id > 6) {
      return "Advanced";
    }
    
    // Default badge
    return "Basic";
  };

  // Helper function to get flag emoji for a language
  const getLanguageFlag = (language) => {
    const flags = {
      'Spanish': '🇪🇸',
      'French': '🇫🇷',
      'German': '🇩🇪',
      'Japanese': '🇯🇵'
    };
    return flags[language] || '🌐';
  };

  useEffect(() => {
    if (selectedLanguage) {
      fetchLesson();
      fetchExercises();
    }
  }, [lessonId, selectedLanguage]);

  const fetchLesson = async () => {
    // Mock language-specific lesson data based on selected language and lessonId
    if (!selectedLanguage) return;
    
    try {
      // In a real app, we would call the API with language parameter
      // const response = await api.get(`/lessons/${lessonId}?language=${selectedLanguage.name}`);
      // setLesson(response.data);
      
      // For now, we'll use mock data based on language
      const mockLessons = {
        Spanish: {
          1: { id: 1, title: "Greetings and Introductions", description: "Learn basic Spanish greetings and how to introduce yourself." },
          2: { id: 2, title: "Numbers and Counting", description: "Learn to count and use numbers in Spanish." },
          3: { id: 3, title: "Common Phrases", description: "Essential phrases for everyday Spanish conversations." }
        },
        French: {
          1: { id: 1, title: "Salutations et Présentations", description: "Learn basic French greetings and introductions." },
          2: { id: 2, title: "Les Nombres", description: "Learn to count and use numbers in French." },
          3: { id: 3, title: "Phrases Courantes", description: "Essential phrases for everyday French conversations." }
        },
        German: {
          1: { id: 1, title: "Begrüßungen und Vorstellungen", description: "Learn basic German greetings and introductions." },
          2: { id: 2, title: "Zahlen und Zählen", description: "Learn to count and use numbers in German." },
          3: { id: 3, title: "Häufige Ausdrücke", description: "Essential phrases for everyday German conversations." }
        },
        Japanese: {
          1: { id: 1, title: "挨拶と自己紹介", description: "Learn basic Japanese greetings and self-introductions." },
          2: { id: 2, title: "数字と数え方", description: "Learn Japanese numbers and counting systems." },
          3: { id: 3, title: "基本的なフレーズ", description: "Essential phrases for everyday Japanese conversations." }
        }
      };
      
      // Get lesson data for the selected language
      const languageLessons = mockLessons[selectedLanguage.name] || mockLessons.Spanish;
      const currentLesson = languageLessons[lessonId];
      
      if (currentLesson) {
        setLesson(currentLesson);
      } else {
        setError(`Lesson ${lessonId} not found for ${selectedLanguage.name}`);
      }
    } catch (err) {
      setError("Failed to load lesson");
    }
  };

  const fetchExercises = async () => {
    if (!selectedLanguage) return;
    setLoading(true);
    
    try {
      // In a real app, we would call the API with language parameter
      // const response = await api.get(`/exercises?lessonId=${lessonId}&language=${selectedLanguage.name}`);
      // setExercises(response.data);
      
      // For now, we'll use mock data based on language
      const mockExercises = {
        Spanish: {
          1: [
            { id: "1", type: "translate", question: "How do you say \"Hello\" in Spanish?", correctAnswer: "Hola", options: ["Hola", "Adiós", "Gracias", "Por favor"] },
            { id: "2", type: "translate", question: "Translate \"My name is...\" to Spanish", correctAnswer: "Me llamo..." },
            { id: "3", type: "multiple-choice", question: "Which is the correct way to say \"Good morning\" in Spanish?", correctAnswer: "Buenos días", options: ["Buenos días", "Buenas tardes", "Buenas noches", "Buen día"] }
          ],
          2: [
            { id: "1", type: "multiple-choice", question: "What is the Spanish word for \"one\"?", correctAnswer: "uno", options: ["uno", "dos", "tres", "cuatro"] },
            { id: "2", type: "translate", question: "Count from 1 to 5 in Spanish", correctAnswer: "uno, dos, tres, cuatro, cinco" }
          ],
          3: [
            { id: "1", type: "translate", question: "How do you say \"Thank you\" in Spanish?", correctAnswer: "Gracias", options: ["Gracias", "Por favor", "De nada", "Lo siento"] },
            { id: "2", type: "multiple-choice", question: "Which phrase means \"Excuse me\" in Spanish?", correctAnswer: "Disculpe", options: ["Disculpe", "Lo siento", "Perdón", "Con permiso"] }
          ]
        },
        French: {
          1: [
            { id: "1", type: "translate", question: "How do you say \"Hello\" in French?", correctAnswer: "Bonjour", options: ["Bonjour", "Au revoir", "Merci", "S'il vous plaît"] },
            { id: "2", type: "translate", question: "Translate \"My name is...\" to French", correctAnswer: "Je m'appelle..." },
            { id: "3", type: "multiple-choice", question: "Which is the correct way to say \"Good evening\" in French?", correctAnswer: "Bonsoir", options: ["Bonjour", "Bonsoir", "Au revoir", "Salut"] }
          ],
          2: [
            { id: "1", type: "multiple-choice", question: "What is the French word for \"two\"?", correctAnswer: "deux", options: ["un", "deux", "trois", "quatre"] },
            { id: "2", type: "translate", question: "Count from 1 to 5 in French", correctAnswer: "un, deux, trois, quatre, cinq" }
          ],
          3: [
            { id: "1", type: "translate", question: "How do you say \"Thank you\" in French?", correctAnswer: "Merci", options: ["Merci", "S'il vous plaît", "De rien", "Pardon"] },
            { id: "2", type: "multiple-choice", question: "Which phrase means \"Excuse me\" in French?", correctAnswer: "Excusez-moi", options: ["Excusez-moi", "Pardon", "Je suis désolé", "Permettez-moi"] }
          ]
        },
        German: {
          1: [
            { id: "1", type: "translate", question: "How do you say \"Hello\" in German?", correctAnswer: "Hallo", options: ["Hallo", "Auf Wiedersehen", "Danke", "Bitte"] },
            { id: "2", type: "translate", question: "Translate \"My name is...\" to German", correctAnswer: "Ich heiße..." },
            { id: "3", type: "multiple-choice", question: "Which is the correct way to say \"Good morning\" in German?", correctAnswer: "Guten Morgen", options: ["Guten Morgen", "Guten Tag", "Guten Abend", "Gute Nacht"] }
          ],
          2: [
            { id: "1", type: "multiple-choice", question: "What is the German word for \"three\"?", correctAnswer: "drei", options: ["eins", "zwei", "drei", "vier"] },
            { id: "2", type: "translate", question: "Count from 1 to 5 in German", correctAnswer: "eins, zwei, drei, vier, fünf" }
          ],
          3: [
            { id: "1", type: "translate", question: "How do you say \"Thank you\" in German?", correctAnswer: "Danke", options: ["Danke", "Bitte", "Gern geschehen", "Entschuldigung"] },
            { id: "2", type: "multiple-choice", question: "Which phrase means \"Excuse me\" in German?", correctAnswer: "Entschuldigung", options: ["Entschuldigung", "Es tut mir leid", "Verzeihung", "Mit Erlaubnis"] }
          ]
        },
        Japanese: {
          1: [
            { id: "1", type: "translate", question: "How do you say \"Hello\" in Japanese?", correctAnswer: "こんにちは (Konnichiwa)", options: ["こんにちは (Konnichiwa)", "さようなら (Sayonara)", "ありがとう (Arigatou)", "お願いします (Onegaishimasu)"] },
            { id: "2", type: "translate", question: "Translate \"My name is...\" to Japanese", correctAnswer: "私の名前は...です (Watashi no namae wa... desu)" },
            { id: "3", type: "multiple-choice", question: "Which is the correct way to say \"Good morning\" in Japanese?", correctAnswer: "おはようございます (Ohayou gozaimasu)", options: ["おはようございます (Ohayou gozaimasu)", "こんにちは (Konnichiwa)", "こんばんは (Konbanwa)", "おやすみなさい (Oyasuminasai)"] }
          ],
          2: [
            { id: "1", type: "multiple-choice", question: "What is the Japanese word for \"one\"?", correctAnswer: "一 (ichi)", options: ["一 (ichi)", "二 (ni)", "三 (san)", "四 (shi)"] },
            { id: "2", type: "translate", question: "Count from 1 to 5 in Japanese", correctAnswer: "一、二、三、四、五 (ichi, ni, san, shi, go)" }
          ],
          3: [
            { id: "1", type: "translate", question: "How do you say \"Thank you\" in Japanese?", correctAnswer: "ありがとう (Arigatou)", options: ["ありがとう (Arigatou)", "お願いします (Onegaishimasu)", "どういたしまして (Douitashimashite)", "すみません (Sumimasen)"] },
            { id: "2", type: "multiple-choice", question: "Which phrase means \"Excuse me\" in Japanese?", correctAnswer: "すみません (Sumimasen)", options: ["すみません (Sumimasen)", "ごめんなさい (Gomen nasai)", "失礼します (Shitsurei shimasu)", "お邪魔します (Ojama shimasu)"] }
          ]
        }
      };
      
      // Get exercises for the selected language and lesson
      const languageExercises = mockExercises[selectedLanguage.name] || mockExercises.Spanish;
      const lessonExercises = languageExercises[lessonId] || [];
      
      setExercises(lessonExercises);
      setLoading(false);
    } catch (err) {
      setError("Failed to load exercises");
      setLoading(false);
    }
  };

  const handleExerciseComplete = async (exerciseId, isCorrect) => {
    // Mark exercise as completed
    setCompletedExercises((prev) => ({
      ...prev,
      [exerciseId]: isCorrect,
    }));

    // Send progress to the server
    try {
      await api.post("/progress", {
        lessonId,
        exerciseId,
        isCorrect,
      });
    } catch (err) {
      console.error("Failed to save progress", err);
    }
    // Do not auto-advance to the next exercise
  };

  const completeLesson = async () => {
    try {
      // First, ensure the user is authenticated
      const token = localStorage.getItem('token');
      if (!token) {
        setError("You must be logged in to save your progress. Please log in and try again.");
        return;
      }

      // Add auth header for the API request
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Mark the lesson as completed on the server
      const response = await api.post(`/lessons/${lessonId}/complete`);
      
      // Verify the lesson was marked as completed
      const verifyResponse = await api.get('/progress');
      const completedLessons = verifyResponse.data.completedLessons || [];
      
      // Store lesson completion data in a more structured way
      // Get existing completed lessons array or initialize if not exists
      const existingCompletedLessons = JSON.parse(localStorage.getItem('completedLessons') || '[]');
      
      // Add the newly completed lesson with more details
      const completionData = {
        id: lessonId,
        title: lesson?.title || '',
        language: selectedLanguage?.name || 'Spanish',
        languageFlag: selectedLanguage?.flag || '🇪🇸',
        timestamp: new Date().toISOString(),
        correctExercises: Object.values(completedExercises).filter(Boolean).length,
        totalExercises: exercises.length,
        badge: determineLessonBadge(lesson)
      };
      
      // Add to the array if not already present
      if (!existingCompletedLessons.some(item => item.id === lessonId)) {
        existingCompletedLessons.push(completionData);
        localStorage.setItem('completedLessons', JSON.stringify(existingCompletedLessons));
      }

      // Keep the individual flags for backward compatibility
      localStorage.setItem('lessonCompleted', 'true');
      localStorage.setItem('completedLessonId', lessonId);
      localStorage.setItem('completedLessonLanguage', selectedLanguage?.name || 'Spanish');
      localStorage.setItem('lessonCompletedAt', new Date().toISOString());
      
      console.log(`Lesson ${lessonId} marked as completed successfully`);
      
      // Show success message
      setLessonCompleted(true);
      
      // No automatic redirect - user will click a button to return to dashboard
    } catch (err) {
      console.error("Failed to mark lesson as completed", err);
      
      // Show a more user-friendly error message
      if (err.response?.status === 401) {
        setError("You must be logged in to save your progress. Please log in and try again.");
      } else {
        setError("There was a problem saving your progress. Your completion will be shown but may not be saved permanently.");
      }
      
      // Still show completion screen even if API fails
      setLessonCompleted(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ModernNavbar onLanguageSelect={lang => setSelectedLanguage(lang)} />
        <div className="flex justify-center items-center min-h-[70vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ModernNavbar onLanguageSelect={lang => setSelectedLanguage(lang)} />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg shadow-sm my-4">
            <div className="flex items-center">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <p className="font-medium">{error}</p>
            </div>
            <div className="mt-4 text-center">
              <button 
                onClick={() => navigate("/dashboard")} 
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (lessonCompleted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ModernNavbar onLanguageSelect={lang => setSelectedLanguage(lang)} />
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold mb-4">Lesson Completed!</h2>
            <p className="text-lg mb-6 text-gray-600">
              Congratulations on completing this lesson.
            </p>

            <div className="mb-6 bg-indigo-50 p-6 rounded-lg inline-block mx-auto">
              <h3 className="text-xl font-semibold mb-2 text-indigo-700">Your Performance</h3>
              <p className="text-gray-700 mb-4">
                You completed {" "}
                <span className="font-bold text-indigo-600">
                  {Object.values(completedExercises).filter(Boolean).length}
                </span>{" "}
                exercises correctly.
              </p>
            </div>

            <div className="flex justify-center space-x-4">
              <button
                onClick={() => navigate("/dashboard")}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                </svg>
                Back to Dashboard
              </button>
              <button
                onClick={() => {
                  setLessonCompleted(false);
                  setCurrentExerciseIndex(0);
                  setCompletedExercises({});
                }}
                className="px-6 py-3 border border-indigo-200 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
                Retry Lesson
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ModernNavbar onLanguageSelect={lang => setSelectedLanguage(lang)} />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          {lesson && (
            <div className="mb-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mr-3">
                  {selectedLanguage && (
                    <span className="text-lg">{selectedLanguage.flag}</span>
                  )}
                </div>
                <h1 className="text-2xl font-bold">{lesson.title}</h1>
              </div>
              <p className="text-gray-600 ml-13">{lesson.description}</p>
            </div>
          )}

          <div className="mb-6">
            <div className="flex justify-between items-center mb-2 text-sm text-gray-500">
              <span>Progress</span>
              <span>{currentExerciseIndex + 1} of {exercises.length}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500" 
                style={{ width: `${(currentExerciseIndex / Math.max(1, exercises.length - 1)) * 100}%` }}
              ></div>
            </div>
          </div>

          {exercises.length > 0 ? (
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <ExerciseCard
                exercise={{
                  ...exercises[currentExerciseIndex],
                  language: selectedLanguage?.name || 'Spanish'
                }}
                onComplete={handleExerciseComplete}
                key={exercises[currentExerciseIndex]?.id}
              />
            </div>
          ) : (
            <div className="bg-gray-50 p-8 rounded-lg border border-gray-200 text-center">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <p className="text-gray-600">
                No exercises available for this lesson.
              </p>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="mt-6 flex justify-between items-center">
            <div>
              <button
                onClick={() => navigate("/dashboard")}
                className="px-4 py-2 text-gray-600 hover:text-indigo-600 flex items-center transition-colors"
              >
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                </svg>
                Back to Dashboard
              </button>
            </div>
            
            <div className="flex space-x-2">
              {currentExerciseIndex > 0 && (
                <button
                  onClick={() => setCurrentExerciseIndex(currentExerciseIndex - 1)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
                >
                  <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                  </svg>
                  Previous
                </button>
              )}
              
              {currentExerciseIndex < exercises.length - 1 ? (
                <button
                  onClick={() => {
                    setCurrentExerciseIndex(currentExerciseIndex + 1);
                    window.scrollTo(0, 0);
                  }}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
                  disabled={completedExercises[exercises[currentExerciseIndex]?.id] !== true}
                >
                  Next
                  <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </button>
              ) : exercises.length > 0 && (
                <button
                  onClick={completeLesson}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                  disabled={completedExercises[exercises[currentExerciseIndex]?.id] !== true}
                >
                  Finish Lesson
                  <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LessonPage;
