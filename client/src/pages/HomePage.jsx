import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function HomePage() {
  const { currentUser } = useAuth();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to AI Language Tutor
        </h1>
        <p className="text-xl text-gray-600">
          Learn languages effectively with personalized exercises and AI-powered
          explanations
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="card">
          <h2 className="text-2xl font-bold mb-4">Personalized Learning</h2>
          <p className="text-gray-600 mb-4">
            Our adaptive system adjusts to your learning pace and focuses on
            areas where you need more practice.
          </p>
          <ul className="list-disc list-inside text-gray-600 mb-4">
            <li>Exercises adapt to your skill level</li>
            <li>Focus on your weak points</li>
            <li>Track your progress over time</li>
          </ul>
        </div>

        <div className="card">
          <h2 className="text-2xl font-bold mb-4">AI-Powered Explanations</h2>
          <p className="text-gray-600 mb-4">
            Get detailed explanations for each exercise to understand the
            concepts better.
          </p>
          <ul className="list-disc list-inside text-gray-600 mb-4">
            <li>Clear explanations for grammar rules</li>
            <li>Understand why your answer was correct or incorrect</li>
            <li>Learn from your mistakes</li>
          </ul>
        </div>
      </div>

      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-6">Available Languages</h2>
        <div className="flex justify-center space-x-8">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-2">
              <span className="text-2xl">🇪🇸</span>
            </div>
            <span className="font-medium">Spanish</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-2">
              <span className="text-2xl">🇫🇷</span>
            </div>
            <span className="font-medium">French</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-2">
              <span className="text-2xl">🇩🇪</span>
            </div>
            <span className="font-medium">German</span>
          </div>
        </div>
      </div>

      <div className="text-center">
        {currentUser ? (
          <Link to="/dashboard" className="btn btn-primary text-lg px-8 py-3">
            Go to Dashboard
          </Link>
        ) : (
          <div className="space-x-4">
            <Link to="/register" className="btn btn-primary text-lg px-8 py-3">
              Get Started
            </Link>
            <Link to="/login" className="btn btn-secondary text-lg px-8 py-3">
              Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default HomePage;
