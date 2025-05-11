import { useState } from "react";
import api from "../services/api";

function ExerciseCard({ exercise, onComplete }) {
  const [userAnswer, setUserAnswer] = useState("");
  const [isCorrect, setIsCorrect] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Check if the answer is correct
    const correct =
      userAnswer.toLowerCase().trim() ===
      exercise.correctAnswer.toLowerCase().trim();
    setIsCorrect(correct);

    // If completed, notify parent component
    if (correct) {
      onComplete(exercise.id, true);
    } else {
      onComplete(exercise.id, false);
    }
  };

  const handleExplain = async () => {
    setLoading(true);
    try {
      const response = await api.post("/exercises/explain", {
        exerciseId: exercise.id,
        userAnswer,
      });
      setExplanation(response.data.explanation);
      setShowExplanation(true);
    } catch (error) {
      setExplanation(
        "Sorry, we could not generate an explanation at this time.",
      );
      setShowExplanation(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card mb-6">
      <h3 className="text-xl font-semibold mb-4">{exercise.type}</h3>

      <div className="mb-4">
        <p className="text-lg">{exercise.question}</p>
        {exercise.imageUrl && (
          <img
            src={exercise.imageUrl}
            alt="Exercise visual"
            className="mt-2 rounded-lg max-h-48 object-contain"
          />
        )}
      </div>

      <form onSubmit={handleSubmit} className="mb-4">
        {exercise.type === "translate" && (
          <input
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Your translation..."
            className="input mb-4"
            disabled={isCorrect === true}
          />
        )}

        {exercise.type === "multiple_choice" && (
          <div className="space-y-2">
            {exercise.options.map((option, index) => (
              <div key={index} className="flex items-center">
                <input
                  type="radio"
                  id={`option-${index}`}
                  name="answer"
                  value={option}
                  checked={userAnswer === option}
                  onChange={() => setUserAnswer(option)}
                  className="mr-2"
                  disabled={isCorrect === true}
                />
                <label htmlFor={`option-${index}`}>{option}</label>
              </div>
            ))}
          </div>
        )}

        {isCorrect === null && (
          <button type="submit" className="btn btn-primary mr-2">
            Check Answer
          </button>
        )}
      </form>

      {isCorrect !== null && (
        <div
          className={`p-3 rounded-md mb-4 ${isCorrect ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
        >
          {isCorrect
            ? "Correct! Well done."
            : `Incorrect. The correct answer is: ${exercise.correctAnswer}`}
        </div>
      )}

      {isCorrect !== null && !showExplanation && (
        <button
          onClick={handleExplain}
          className="btn btn-secondary"
          disabled={loading}
        >
          {loading ? "Loading..." : "Explain"}
        </button>
      )}

      {showExplanation && (
        <div className="mt-4 p-4 bg-blue-50 rounded-md">
          <h4 className="font-semibold mb-2">Explanation:</h4>
          <p>{explanation}</p>
        </div>
      )}
    </div>
  );
}

export default ExerciseCard;
