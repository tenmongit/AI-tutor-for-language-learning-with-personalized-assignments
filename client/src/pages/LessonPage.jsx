import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import ExerciseCard from "../components/ExerciseCard";
import ProgressBar from "../components/ProgressBar";

function LessonPage() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [completedExercises, setCompletedExercises] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lessonCompleted, setLessonCompleted] = useState(false);

  useEffect(() => {
    fetchLesson();
    fetchExercises();
  }, [lessonId]);

  const fetchLesson = async () => {
    try {
      const response = await api.get(`/lessons/${lessonId}`);
      setLesson(response.data);
    } catch (err) {
      setError("Failed to load lesson");
    }
  };

  const fetchExercises = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/exercises?lessonId=${lessonId}`);
      setExercises(response.data);
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
    setLessonCompleted(true);
    try {
      await api.post(`/lessons/${lessonId}/complete`);
    } catch (err) {
      console.error("Failed to mark lesson as completed", err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center my-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded my-4">
        {error}
      </div>
    );
  }

  if (lessonCompleted) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <div className="card">
          <h2 className="text-2xl font-bold mb-4">Lesson Completed!</h2>
          <p className="text-lg mb-6">
            Congratulations on completing this lesson.
          </p>

          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">Your Performance</h3>
            <p className="text-gray-600 mb-4">
              You completed{" "}
              {Object.values(completedExercises).filter(Boolean).length}{" "}
              exercises correctly.
            </p>
          </div>

          <div className="flex justify-center space-x-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="btn btn-primary"
            >
              Back to Dashboard
            </button>
            <button
              onClick={() => {
                setLessonCompleted(false);
                setCurrentExerciseIndex(0);
                setCompletedExercises({});
              }}
              className="btn btn-secondary"
            >
              Retry Lesson
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {lesson && (
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">{lesson.title}</h1>
          <p className="text-gray-600">{lesson.description}</p>
        </div>
      )}

      <div className="mb-6">
        <ProgressBar current={currentExerciseIndex} total={exercises.length} />
      </div>

      {exercises.length > 0 ? (
        <ExerciseCard
          exercise={exercises[currentExerciseIndex]}
          onComplete={handleExerciseComplete}
          key={exercises[currentExerciseIndex]?.id}
        />
      ) : (
        <p className="text-center text-gray-600">
          No exercises available for this lesson.
        </p>
      )}

      {/* Next button logic */}
      <div className="mt-4 flex justify-end">
        {currentExerciseIndex < exercises.length - 1 && (
          <button
            onClick={() => {
              setCurrentExerciseIndex(currentExerciseIndex + 1);
              window.scrollTo(0, 0);
            }}
            className="btn btn-primary"
            disabled={completedExercises[exercises[currentExerciseIndex]?.id] !== true}
          >
            Next
          </button>
        )}
        {currentExerciseIndex === exercises.length - 1 && exercises.length > 0 && (
          <button
            onClick={completeLesson}
            className="btn btn-success"
            disabled={completedExercises[exercises[currentExerciseIndex]?.id] !== true}
          >
            Finish Lesson
          </button>
        )}
      </div>

      <div className="mt-8 flex justify-between">
        <button
          onClick={() => navigate("/dashboard")}
          className="btn btn-secondary"
        >
          Back to Dashboard
        </button>

        {currentExerciseIndex > 0 && (
          <button
            onClick={() => setCurrentExerciseIndex(currentExerciseIndex - 1)}
            className="btn btn-secondary"
          >
            Previous Exercise
          </button>
        )}
      </div>
    </div>
  );
}

export default LessonPage;
