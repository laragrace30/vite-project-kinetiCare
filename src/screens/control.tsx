import { useState, useEffect } from 'react';
import SideMenu from '../components/sideMenu';
import '../styles/control.css';
import { db } from '../firebase/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { recommendationService } from '../firebase/recommendationService';

interface Weights {
  specialization: number;
  location: number;
  fee: number;
}

function Controls() {
  const [weights, setWeights] = useState<Weights>({
    specialization: 60,
    location: 20,
    fee: 20,
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch weights from Firestore when the component mounts
  useEffect(() => {
    const fetchWeights = async () => {
      try {
        const docRef = doc(db, 'weights', 'recommendationWeights');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setWeights(docSnap.data() as Weights);
        } else {
          console.warn('No weights found in Firestore. Using default weights.');
        }
      } catch (err) {
        console.error('Error fetching weights:', err);
        setError('Failed to load weights. Please try again later.');
      }
    };

    fetchWeights();
  }, []);

  // Handle input change and update state
  const handleWeightChange = (type: keyof Weights, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setWeights((prev) => ({
        ...prev,
        [type]: numValue,
      }));
    }
  };

  // Validate weights only when saving
  const validateWeights = () => {
    const total = Object.values(weights).reduce((a, b) => a + b, 0);
    return Math.abs(total - 100) < 0.001; // Allow small rounding errors
  };

  const saveWeights = async () => {
    // Perform validation on save
    const total = weights.specialization + weights.location + weights.fee;
    if (total !== 100) {
      setError('Weights must sum to 100%');
      return;
    }

    setIsLoading(true);
    try {
      await setDoc(doc(db, 'weights', 'recommendationWeights'), weights);
      await recommendationService.loadWeights();
      setError(null);
      alert('Weights saved successfully!');
    } catch (err) {
      console.error('Error saving weights:', err);
      setError('Failed to save weights');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <SideMenu />
      <div className="details--content">
        <div className="controls--header">
          <h2 className="controls">Recommendation System Controls</h2>
        </div>
        <div className="controls--container1">
          <div className="controls-container">
            <div className="controls-section--weights">
              <h3 className="weights--feedback">Recommendation Weights Configuration</h3>
              <div className="controls-content">
                <div className="weights-card">
                  {error && <div className="error-message">{error}</div>}

                  <div className="weight-input-group">
                    <label>Specialization Weight (%)</label>
                    <input
                      type="number"
                      value={weights.specialization}
                      onChange={(e) => handleWeightChange('specialization', e.target.value)}
                      min="0"
                      max="100"
                    />
                  </div>

                  <div className="weight-input-group">
                    <label>Location Weight (%)</label>
                    <input
                      type="number"
                      value={weights.location}
                      onChange={(e) => handleWeightChange('location', e.target.value)}
                      min="0"
                      max="100"
                    />
                  </div>

                  <div className="weight-input-group">
                    <label>Fee Weight (%)</label>
                    <input
                      type="number"
                      value={weights.fee}
                      onChange={(e) => handleWeightChange('fee', e.target.value)}
                      min="0"
                      max="100"
                    />
                  </div>

                  <div className="weight-total">
                    <p>
                      Total: {weights.specialization + weights.location + weights.fee}%{' '}
                      {validateWeights() ? (
                        <span className="valid">(Valid)</span>
                      ) : (
                        <span className="invalid">(Must equal 100%)</span>
                      )}
                    </p>
                  </div>

                  <button
                    onClick={saveWeights}
                    disabled={isLoading}
                    className="save-button"
                  >
                    {isLoading ? 'Saving...' : 'Save Weights'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Controls;
