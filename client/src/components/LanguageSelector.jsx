import { useState, useEffect } from "react";
import api from "../services/api";

function LanguageSelector({ onLanguageSelect }) {
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const response = await api.get("/languages");
        setLanguages(response.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to load languages");
        setLoading(false);
      }
    };

    fetchLanguages();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center my-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
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

  return (
    <div className="my-8">
      <h2 className="text-2xl font-bold mb-4">Choose a language to learn</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {languages.map((language) => (
          <button
            key={language.id}
            onClick={() => onLanguageSelect(language)}
            className="card hover:shadow-lg transition-shadow duration-300 flex flex-col items-center p-6"
          >
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
              <span className="text-2xl">{language.flag}</span>
            </div>
            <h3 className="text-xl font-semibold">{language.name}</h3>
          </button>
        ))}
      </div>
    </div>
  );
}

export default LanguageSelector;
