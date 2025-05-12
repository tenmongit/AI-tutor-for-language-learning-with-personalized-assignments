import { useState, useEffect } from "react";
import api from "../services/api";

function ExerciseCard({ exercise, onComplete }) {
  // Reset state when exercise changes
  useEffect(() => {
    setIsCorrect(null);
    setUserAnswer("");
    setExplanation("");
    setShowExplanation(false);
  }, [exercise.id]);
  const [userAnswer, setUserAnswer] = useState("");
  const [isCorrect, setIsCorrect] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Safely handle exercise properties
    const correctAnswer = exercise?.correctAnswer || '';
    const exerciseId = exercise?.id || null;
    const language = exercise?.language || 'Spanish';

    // In a real app, this would call an AI service to check the answer
    // const response = await api.post('/ai/check-answer', {
    //   exerciseId,
    //   exerciseType: exercise.type,
    //   question: exercise.question,
    //   userAnswer,
    //   correctAnswer,
    //   language
    // });
    // const correct = response.data.isCorrect;
    
    // For now, simulate AI checking with some flexibility for translation exercises
    let correct = false;
    
    if (exercise.type === 'translate') {
      // More flexible matching for translation exercises
      // Simulating AI understanding of semantic equivalence and minor variations
      const userAnswerClean = userAnswer.toLowerCase().trim();
      const correctAnswerClean = correctAnswer.toLowerCase().trim();
      
      // Check for exact match first
      if (userAnswerClean === correctAnswerClean) {
        correct = true;
      } 
      // Check if answer contains the key parts of the correct answer
      else if (correctAnswerClean.includes('...')) {
        // For phrases with placeholders like "Me llamo..."
        const mainPart = correctAnswerClean.replace('...', '');
        correct = userAnswerClean.includes(mainPart);
      }
      // Check for minor variations (simulating AI flexibility)
      else {
        // Remove punctuation and check if core words match
        const userWords = userAnswerClean.replace(/[.,?!;]/g, '').split(' ');
        const correctWords = correctAnswerClean.replace(/[.,?!;]/g, '').split(' ');
        
        // If most words match (>70%), consider it correct
        const matchingWords = userWords.filter(word => correctWords.includes(word)).length;
        const matchRatio = matchingWords / Math.max(userWords.length, correctWords.length);
        correct = matchRatio > 0.7;
      }
    } else if (exercise.type === 'multiple-choice' || exercise.type === 'multiple_choice') {
      // For multiple choice, still do exact matching
      correct = userAnswer === correctAnswer;
    }
    
    setIsCorrect(correct);
    setLoading(false);

    // If completed, notify parent component
    if (exerciseId && correct) {
      onComplete(exerciseId, correct);
    }
  };

  const handleExplain = async () => {
    setLoading(true);
    try {
      // In a real app, this would call an AI service with the user's answer,
      // the correct answer, the language context, etc.
      // const response = await api.post("/ai/explain", {
      //   exerciseId: exercise.id,
      //   exerciseType: exercise.type,
      //   question: exercise.question,
      //   userAnswer,
      //   correctAnswer: exercise.correctAnswer,
      //   language: exercise.language || 'Spanish'
      // });
      // setExplanation(response.data.explanation);
      
      // For now, generate explanations dynamically based on the exercise context
      const language = exercise.language || '';
      let aiExplanation = '';
      
      if (exercise.type === 'translate') {
        if (isCorrect) {
          aiExplanation = `Great job! "${exercise.correctAnswer}" is the correct translation for this phrase. ` + 
            `This is a common expression used in ${language} conversation.`;
        } else {
          aiExplanation = `The correct translation is "${exercise.correctAnswer}". ` +
            `Your answer "${userAnswer}" was not quite right. ` +
            `Here's a breakdown of the translation:\n\n` +
            `- The key words in this phrase are important to understand\n` +
            `- Pay attention to the grammar structure in ${language}\n` +
            `- Try practicing this phrase in different contexts`;
        }
      } else if (exercise.type === 'multiple-choice' || exercise.type === 'multiple_choice') {
        if (isCorrect) {
          aiExplanation = `Excellent choice! "${exercise.correctAnswer}" is indeed correct. ` +
            `This is an important concept in ${language}.`;
        } else {
          const wrongOption = exercise.options?.find(opt => opt === userAnswer) || 'your selection';
          aiExplanation = `The correct answer is "${exercise.correctAnswer}". ` +
            `You selected "${wrongOption}", which isn't right in this context. ` +
            `Here's why this distinction matters:\n\n` +
            `- In ${language}, these terms have specific meanings\n` +
            `- The context of the question points to "${exercise.correctAnswer}"\n` +
            `- This is a common area of confusion for language learners`;
        }
      } else {
        aiExplanation = `The correct answer is "${exercise.correctAnswer}". ` +
          `Focus on understanding the specific context and usage in ${language}.`;
      }
      
      setExplanation(aiExplanation);
      setShowExplanation(true);
    } catch (error) {
      setExplanation(
        "I'm sorry, I couldn't generate a personalized explanation at this moment. Please try again later."
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
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 mb-4"
            disabled={loading || isCorrect === true}
          />
        )}

        {(exercise.type === "multiple_choice" || exercise.type === "multiple-choice") && (
          <div className="space-y-3 mt-3">
            {exercise.options && exercise.options.length > 0 ? (
              exercise.options.map((option, index) => (
                <div key={index} className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                     onClick={() => setUserAnswer(option)}>
                  <input
                    type="radio"
                    id={`option-${index}`}
                    name="answer"
                    value={option}
                    checked={userAnswer === option}
                    onChange={() => setUserAnswer(option)}
                    className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                    disabled={loading || isCorrect === true}
                  />
                  <label htmlFor={`option-${index}`} className="ml-3 block text-gray-700 cursor-pointer">{option}</label>
                </div>
              ))
            ) : (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                  </svg>
                  <span>No options available for this question.</span>
                </div>
              </div>
            )}
          </div>
        )}

        {isCorrect === null && (
          <button 
            type="submit" 
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
            disabled={loading || !userAnswer.trim()}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Checking...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Check Answer
              </>
            )}
          </button>
        )}
      </form>

      {isCorrect !== null && (
        <div
          className={`p-3 rounded-md mb-4 ${isCorrect ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
        >
          {isCorrect ? (
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span>Correct! Well done.</span>
            </div>
          ) : (
            <div>
              <div className="flex items-center mb-2">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
                <span>Not quite right.</span>
              </div>
              <p>The correct answer is: <span className="font-semibold">{exercise.correctAnswer}</span></p>
              <button 
                onClick={() => setIsCorrect(null)} 
                className="mt-2 text-red-700 hover:text-red-900 underline text-sm flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
                Try again
              </button>
            </div>
          )}
        </div>
      )}

      {isCorrect !== null && !showExplanation && (
        <button
          onClick={handleExplain}
          className="px-4 py-2 border border-indigo-200 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors flex items-center"
          disabled={loading}
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating...
            </>
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              Explain
            </>
          )}
        </button>
      )}

      {showExplanation && (
        <div className="mt-4 p-4 bg-indigo-50 border border-indigo-100 rounded-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0 mt-1">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h4 className="font-semibold text-indigo-800 mb-2">AI Tutor Explanation:</h4>
              <p className="text-gray-700 whitespace-pre-line">{explanation}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ExerciseCard;
