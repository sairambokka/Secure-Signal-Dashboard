import React, { useState } from 'react';
import { signalsApi } from '../services/api';

interface SignalFormProps {
  onSuccess?: () => void;
}

const SignalForm: React.FC<SignalFormProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    agent_id: '',
    signal_type: 'HRV' as 'HRV' | 'GSR' | 'respiration' | 'temperature' | 'heart_rate',
    timestamp: new Date().toISOString(),
    raw: '',
    avg: '',
    sdnn: '',
    activity: '',
    environment: '',
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const signalTypes = [
    { value: 'HRV', label: 'Heart Rate Variability', color: '#dc2626' },
    { value: 'GSR', label: 'Galvanic Skin Response', color: '#f59e0b' },
    { value: 'respiration', label: 'Respiration', color: '#3b82f6' },
    { value: 'temperature', label: 'Temperature', color: '#8b5cf6' },
    { value: 'heart_rate', label: 'Heart Rate', color: '#059669' },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setErrors([]);
    setSuccessMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors([]);
    setSuccessMessage('');

    try {
      let rawData = [];
      if (formData.raw.trim()) {
        try {
          rawData = JSON.parse(formData.raw);
          if (!Array.isArray(rawData)) {
            setErrors(['Raw data must be an array of numbers']);
            setIsLoading(false);
            return;
          }
        } catch (error) {
          setErrors(['Invalid JSON format in raw data field']);
          setIsLoading(false);
          return;
        }
      }

      const payload = {
        raw: rawData,
        avg: parseFloat(formData.avg),
        ...(formData.sdnn && { sdnn: parseFloat(formData.sdnn) })
      };

      const context = {
        ...(formData.activity && { activity: formData.activity }),
        ...(formData.environment && { environment: formData.environment })
      };

      const signalData = {
        agent_id: formData.agent_id,
        signal_type: formData.signal_type,
        timestamp: formData.timestamp,
        payload,
        context
      };

      const response = await signalsApi.create(signalData);

      if (response.success) {
        setSuccessMessage('Biometric signal recorded successfully!');
        setFormData({
          agent_id: '',
          signal_type: 'HRV',
          timestamp: new Date().toISOString(),
          raw: '',
          avg: '',
          sdnn: '',
          activity: '',
          environment: '',
        });
        onSuccess?.();
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to create signal';
      const validationErrors = error.response?.data?.errors?.map((err: any) => err.message) || [];
      setErrors([errorMessage, ...validationErrors]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signal-form-container">
      <div className="signal-form-card">
        <h2>Submit Biometric Signal</h2>
        <p className="form-subtitle">Record biometric data from sensors</p>

        {errors.length > 0 && (
          <div className="error-container">
            {errors.map((error, index) => (
              <div key={index} className="error-message">{error}</div>
            ))}
          </div>
        )}

        {successMessage && (
          <div className="success-container">
            <div className="success-message">{successMessage}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="signal-form">
          <div className="form-group">
            <label htmlFor="agent_id">Agent ID</label>
            <input
              type="text"
              id="agent_id"
              name="agent_id"
              value={formData.agent_id}
              onChange={handleInputChange}
              required
              disabled={isLoading}
              placeholder="e.g., AXIS01, SENSOR_02"
            />
            <div className="field-help">
              Unique identifier for the device/sensor capturing data
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="signal_type">Signal Type</label>
            <select
              id="signal_type"
              name="signal_type"
              value={formData.signal_type}
              onChange={handleInputChange}
              required
              disabled={isLoading}
              className="signal-type-select"
            >
              {signalTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            <div className="signal-type-preview">
              <span 
                className="signal-badge"
                style={{ backgroundColor: signalTypes.find(t => t.value === formData.signal_type)?.color }}
              >
                {signalTypes.find(t => t.value === formData.signal_type)?.label}
              </span>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="timestamp">Timestamp</label>
            <input
              type="datetime-local"
              id="timestamp"
              name="timestamp"
              value={formData.timestamp.slice(0, 16)}
              onChange={(e) => setFormData(prev => ({ ...prev, timestamp: e.target.value + ':00.000Z' }))}
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="avg">Average Value</label>
            <input
              type="number"
              step="0.01"
              id="avg"
              name="avg"
              value={formData.avg}
              onChange={handleInputChange}
              required
              disabled={isLoading}
              placeholder="e.g., 840.5"
            />
            <div className="field-help">
              The calculated average of the raw measurements
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="raw">Raw Data</label>
            <textarea
              id="raw"
              name="raw"
              value={formData.raw}
              onChange={handleInputChange}
              required
              disabled={isLoading}
              placeholder='[856, 840, 830, 835, 845]'
              rows={3}
            />
            <div className="field-help">
              Array of raw sensor readings in JSON format
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="sdnn">SDNN (Optional)</label>
            <input
              type="number"
              step="0.01"
              id="sdnn"
              name="sdnn"
              value={formData.sdnn}
              onChange={handleInputChange}
              disabled={isLoading}
              placeholder="e.g., 58.3"
            />
            <div className="field-help">
              Standard deviation for HRV signals
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="activity">Activity (Optional)</label>
            <input
              type="text"
              id="activity"
              name="activity"
              value={formData.activity}
              onChange={handleInputChange}
              disabled={isLoading}
              placeholder="e.g., resting, exercise, sleep"
            />
          </div>

          <div className="form-group">
            <label htmlFor="environment">Environment (Optional)</label>
            <input
              type="text"
              id="environment"
              name="environment"
              value={formData.environment}
              onChange={handleInputChange}
              disabled={isLoading}
              placeholder="e.g., cockpit, office, home"
            />
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="submit-button"
              disabled={isLoading || !formData.agent_id.trim() || !formData.avg.trim() || !formData.raw.trim()}
            >
              {isLoading ? 'Submitting...' : 'Submit Signal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignalForm;