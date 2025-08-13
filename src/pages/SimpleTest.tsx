// src/pages/SimpleTest.tsx - Ultra Stable Version

import React, { useState } from 'react';

export default function SimpleTest() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<string[]>(['', '', '']);
  
  const questions = [
    {
      text: "Does water drain away from your house properly?",
      options: ["Yes, drains well", "No, water pools"]
    },
    {
      text: "Are there any damaged electrical cords visible?", 
      options: ["No damage seen", "Yes, some damage"]
    },
    {
      text: "Is there visible mold in any rooms?",
      options: ["No mold", "Some mold present"]
    }
  ];

  const handleAnswer = (answer: string) => {
    const newResponses = [...responses];
    newResponses[currentQuestion] = answer;
    setResponses(newResponses);
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const resetTest = () => {
    setCurrentQuestion(0);
    setResponses(['', '', '']);
  };

  const isComplete = responses.every(r => r !== '');
  const riskScore = responses.reduce((score, response, index) => {
    if (response.includes('No') || response.includes('well')) return score;
    return score + (index === 2 ? 30 : 25); // Mold = higher risk
  }, 0);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          🏠 Home Safety Quick Check
        </h1>

        {!isComplete ? (
          <div>
            <div className="mb-4">
              <div className="text-sm text-gray-500 mb-2">
                Question {currentQuestion + 1} of {questions.length}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                />
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                {questions[currentQuestion].text}
              </h2>
              
              <div className="space-y-3">
                {questions[currentQuestion].options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswer(option)}
                    className="w-full p-4 text-left border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {currentQuestion > 0 && (
              <button
                onClick={() => setCurrentQuestion(currentQuestion - 1)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                ← Previous
              </button>
            )}
          </div>
        ) : (
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              ✅ Assessment Complete!
            </h2>
            
            <div className={`text-4xl font-bold mb-4 ${
              riskScore > 50 ? 'text-red-600' : 
              riskScore > 25 ? 'text-yellow-600' : 'text-green-600'
            }`}>
              Risk Score: {riskScore}/100
            </div>

            <div className="space-y-2 mb-6 text-left">
              {questions.map((q, i) => (
                <div key={i} className="flex justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm text-gray-700">{q.text.slice(0, 30)}...</span>
                  <span className="text-sm font-medium">{responses[i]}</span>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <button
                onClick={resetTest}
                className="w-full bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600"
              >
                🔄 Take Test Again
              </button>
              
              <a 
                href="/"
                className="block w-full bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 text-center"
              >
                ← Back to Main App
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
