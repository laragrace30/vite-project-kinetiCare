import React, { useState, useEffect } from 'react';
import { db } from '../firebase/firebase-config'; // Adjust import path as needed
import { collection, doc, setDoc, getDoc } from 'firebase/firestore';

const WeightsConfiguration = () => {
  const [weights, setWeights] = useState({
    specialization: 60,
    location: 20,
    fee: 20,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load existing weights if they exist
  useEffect(() => {
    const loadWeights = async () => {
      try {
        const weightsDoc = await getDoc(doc(db, 'weights', 'recommendationWeights'));
        if (weightsDoc.exists()) {
          setWeights(weightsDoc.data());
        }
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading weights:', err);
        setError('Failed to load weights');
        setIsLoading(false);
      }
    };

    loadWeights();
  }, []);

  const handleWeightChange = (type, value) => {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue)) {
      setWeights(prev => ({
        ...prev,
        [type]: numValue
      }));
    }
  };

  const validateWeights = () => {
    const total = weights.specialization + weights.location + weights.fee;
    return total === 100;
  };

  const saveWeights = async () => {
    if (!validateWeights()) {
      setError('Weights must sum to 100%');
      return;
    }

    try {
      await setDoc(doc(db, 'weights', 'recommendationWeights'), weights);
      setError(null);
      alert('Weights saved successfully!');
    } catch (err) {
      console.error('Error saving weights:', err);
      setError('Failed to save weights');
    }
  };

  if (isLoading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">PT Recommendation Weights Configuration</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Specialization Weight (%)
          </label>
          <input
            type="number"
            value={weights.specialization}
            onChange={(e) => handleWeightChange('specialization', e.target.value)}
            className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
            min="0"
            max="100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location Weight (%)
          </label>
          <input
            type="number"
            value={weights.location}
            onChange={(e) => handleWeightChange('location', e.target.value)}
            className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
            min="0"
            max="100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fee Weight (%)
          </label>
          <input
            type="number"
            value={weights.fee}
            onChange={(e) => handleWeightChange('fee', e.target.value)}
            className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
            min="0"
            max="100"
          />
        </div>

        <div className="pt-4">
          <p className="text-sm text-gray-600 mb-2">
            Total: {weights.specialization + weights.location + weights.fee}% 
            {validateWeights() ? 
              <span className="text-green-600 ml-2">(Valid)</span> : 
              <span className="text-red-600 ml-2">(Must equal 100%)</span>
            }
          </p>
          <button
            onClick={saveWeights}
            disabled={!validateWeights()}
            className={`w-full py-2 px-4 rounded font-medium ${
              validateWeights()
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Save Weights
          </button>
        </div>
      </div>
    </div>
  );
};

export default WeightsConfiguration;