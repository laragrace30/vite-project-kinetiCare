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

interface CommissionRate {
  platformFee: number;
}

function Controls() {
  const [weights, setWeights] = useState<Weights>({
    specialization: 60,
    location: 20,
    fee: 20,
  });
  const [inputValues, setInputValues] = useState({
    specialization: '60',
    location: '20',
    fee: '20',
  });
  
  const [platformFee, setPlatformFee] = useState<number>(20);
  const [platformFeeInput, setPlatformFeeInput] = useState('20');

  const [error, setError] = useState<string | null>(null);
  const [commissionError, setCommissionError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCommissionLoading, setIsCommissionLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch weights
        const weightsDoc = await getDoc(doc(db, 'weights', 'recommendationWeights'));
        if (weightsDoc.exists()) {
          const data = weightsDoc.data() as Weights;
          setWeights(data);
          setInputValues({
            specialization: data.specialization.toString(),
            location: data.location.toString(),
            fee: data.fee.toString(),
          });
        }

        // Fetch platform fee
        const commissionDoc = await getDoc(doc(db, 'commission', 'rate'));
        if (commissionDoc.exists()) {
          const data = commissionDoc.data() as CommissionRate;
          setPlatformFee(data.platformFee);
          setPlatformFeeInput(data.platformFee.toString());
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again later.');
      }
    };

    fetchData();
  }, []);

  const handleWeightChange = (type: keyof Weights, value: string) => {
    if (value === '' || (!isNaN(Number(value)) && Number(value) >= 0 && Number(value) <= 100)) {
      setInputValues(prev => ({
        ...prev,
        [type]: value
      }));

      if (value !== '') {
        setWeights(prev => ({
          ...prev,
          [type]: Number(value)
        }));
      }
      setError(null);
    }
  };

  const handlePlatformFeeChange = (value: string) => {
    if (value === '' || (!isNaN(Number(value)) && Number(value) >= 0 && Number(value) <= 100)) {
      setPlatformFeeInput(value);
      if (value !== '') {
        setPlatformFee(Number(value));
      }
      setCommissionError(null);
    }
  };

  const calculateTotal = () => {
    return Object.values(weights).reduce((a, b) => a + b, 0);
  };

  const saveWeights = async () => {
    if (Object.values(inputValues).some(value => value === '')) {
      setError('All fields must be filled before saving');
      return;
    }

    const total = calculateTotal();
    if (Math.abs(total - 100) > 0.001) {
      setError('Weights must sum to 100% before saving');
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

  const savePlatformFee = async () => {
    if (platformFeeInput === '') {
      setCommissionError('Platform fee must be filled before saving');
      return;
    }

    if (platformFee < 0 || platformFee > 100) {
      setCommissionError('Platform fee must be between 0 and 100%');
      return;
    }

    setIsCommissionLoading(true);
    try {
      await setDoc(doc(db, 'commission', 'rate'), { platformFee });
      setCommissionError(null);
      alert('Platform fee saved successfully!');
    } catch (err) {
      console.error('Error saving platform fee:', err);
      setCommissionError('Failed to save platform fee');
    } finally {
      setIsCommissionLoading(false);
    }
  };

  const total = calculateTotal();
  const isValid = Math.abs(total - 100) < 0.001;
  const hasEmptyFields = Object.values(inputValues).some(value => value === '');

  return (
    <div className="container">
      <SideMenu />
      <div className="details--content">
        <div className="controls--header">
          <h2 className="controls">System Controls</h2>
        </div>
        <div className="controls-container">
          <div className="controls--container1">
            <div className="controls-section--weights">
              <h3 className="weights--feedback">Recommendation Weights Configuration</h3>
              <div className="controls-content">
                <div className="weights-card">
                  {error && <div className="error-message">{error}</div>}

                  <div className="weight-input-group">
                    <label>Specialization Weight (%)</label>
                    <input
                      type="number"
                      value={inputValues.specialization}
                      onChange={(e) => handleWeightChange('specialization', e.target.value)}
                      min="0"
                      max="100"
                    />
                  </div>

                  <div className="weight-input-group">
                    <label>Location Weight (%)</label>
                    <input
                      type="number"
                      value={inputValues.location}
                      onChange={(e) => handleWeightChange('location', e.target.value)}
                      min="0"
                      max="100"
                    />
                  </div>

                  <div className="weight-input-group">
                    <label>Fee Weight (%)</label>
                    <input
                      type="number"
                      value={inputValues.fee}
                      onChange={(e) => handleWeightChange('fee', e.target.value)}
                      min="0"
                      max="100"
                    />
                  </div>

                  <div className="weight-total">
                    <p>
                      Total: {hasEmptyFields ? '-' : total.toFixed(1)}%{' '}
                      {!hasEmptyFields && !isValid && (
                        <span className="invalid">(Must equal 100% to save)</span>
                      )}
                    </p>
                  </div>

                  <button
                    onClick={saveWeights}
                    disabled={isLoading || hasEmptyFields || !isValid}
                    className="save-button"
                  >
                    {isLoading ? 'Saving...' : 'Save Weights'}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="controls-container2">
            <div className="controls-section--commission">
              <h3 className="commission--feedback">Commission Fee Configuration</h3>
              <div className="controls-content">
                <div className="commission-card">
                  {commissionError && <div className="error-message">{commissionError}</div>}

                  <div className="commission-input-group">
                    <label>Commission Fee (%)</label>
                    <input
                      type="number"
                      value={platformFeeInput}
                      onChange={(e) => handlePlatformFeeChange(e.target.value)}
                      min="0"
                      max="100"
                      placeholder="Enter platform fee percentage"
                    />
                  </div>

                  <p className="text">
                    This is the percentage fee that the platform will charge for each consultation.
                    The remaining amount will go to the therapist.
                  </p>

                  <button
                    onClick={savePlatformFee}
                    disabled={isCommissionLoading || platformFeeInput === '' || platformFee < 0 || platformFee > 100}
                    className="fee-button"
                  >
                    {isCommissionLoading ? 'Saving...' : 'Save Changes'}
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