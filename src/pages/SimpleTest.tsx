// src/pages/SimpleTest.tsx

import React from 'react';

export default function SimpleTest() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          🏠 Simple Test Page
        </h1>
        <p className="text-gray-700 mb-4">
          If you can see this page, our new file system is working!
        </p>
        <a 
          href="/"
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          ← Back to Main App
        </a>
      </div>
    </div>
  );
}
