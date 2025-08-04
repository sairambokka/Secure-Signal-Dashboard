import React, { useState, useEffect } from 'react';
import { Signal } from '../types';
import { signalsApi } from '../services/api';

interface SignalListProps {
  refreshTrigger?: number;
}

const SignalList: React.FC<SignalListProps> = ({ refreshTrigger }) => {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    sort: '-timestamp',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const signalTypes = [
    { value: '', label: 'All Types' },
    { value: 'HRV', label: 'Heart Rate Variability', color: '#dc2626' },
    { value: 'GSR', label: 'Galvanic Skin Response', color: '#f59e0b' },
    { value: 'respiration', label: 'Respiration', color: '#3b82f6' },
    { value: 'temperature', label: 'Temperature', color: '#8b5cf6' },
    { value: 'heart_rate', label: 'Heart Rate', color: '#059669' },
  ];

  const getSignalTypeInfo = (type: string) => {
    return signalTypes.find(t => t.value === type) || signalTypes[1];
  };

  const fetchSignals = async () => {
    try {
      setLoading(true);
      setError('');

      const filterParams: any = {
        page: currentPage,
        limit: 10,
        sort: filters.sort,
      };

      if (filters.type) filterParams.type = filters.type;

      const response = await signalsApi.getAll(filterParams);
      
      if (response.success) {
        setSignals(response.data.signals);
        setTotalPages(response.data.pagination.totalPages);
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to fetch signals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSignals();
  }, [currentPage, filters, refreshTrigger]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };


  const handleDeleteSignal = async (signalId: string) => {
    if (!window.confirm('Are you sure you want to delete this signal?')) {
      return;
    }

    try {
      await signalsApi.delete(signalId);
      fetchSignals();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to delete signal');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="signal-list-container">
        <div className="loading-spinner">Loading signals...</div>
      </div>
    );
  }

  return (
    <div className="signal-list-container">
      <div className="signal-list-header">
        <h2>Biometric Signal Dashboard</h2>
        
        <div className="filters-container">
          <div className="filter-group">
            <label htmlFor="type-filter">Type:</label>
            <select
              id="type-filter"
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
            >
              {signalTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>


          <div className="filter-group">
            <label htmlFor="sort-filter">Sort:</label>
            <select
              id="sort-filter"
              name="sort"
              value={filters.sort}
              onChange={handleFilterChange}
            >
              <option value="-timestamp">Newest First</option>
              <option value="timestamp">Oldest First</option>
              <option value="signal_type">Type A-Z</option>
              <option value="-signal_type">Type Z-A</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-container">
          <div className="error-message">{error}</div>
        </div>
      )}

      {signals.length === 0 ? (
        <div className="empty-state">
          <h3>No signals found</h3>
          <p>No signals match your current filters. Try adjusting the filters or create a new signal.</p>
        </div>
      ) : (
        <>
          <div className="signals-grid">
            {signals.map(signal => {
              const typeInfo = getSignalTypeInfo(signal.signal_type);
              return (
                <div key={signal._id} className="signal-card">
                  <div className="signal-header">
                    <span 
                      className="signal-badge"
                      style={{ backgroundColor: typeInfo.color }}
                    >
                      {typeInfo.label}
                    </span>
                    <span className="agent-badge">
                      {signal.agent_id}
                    </span>
                  </div>
                  
                  <div className="signal-content">
                    <div className="signal-metrics">
                      <div className="metric">
                        <strong>Average:</strong> {signal.payload.avg}
                      </div>
                      {signal.payload.sdnn && (
                        <div className="metric">
                          <strong>SDNN:</strong> {signal.payload.sdnn}
                        </div>
                      )}
                      <div className="metric">
                        <strong>Raw Samples:</strong> {signal.payload.raw.length} values
                      </div>
                    </div>
                    
                    {signal.context && (Object.keys(signal.context).length > 0) && (
                      <div className="signal-context">
                        <strong>Context:</strong>
                        {signal.context.activity && (
                          <span className="context-item">Activity: {signal.context.activity}</span>
                        )}
                        {signal.context.environment && (
                          <span className="context-item">Environment: {signal.context.environment}</span>
                        )}
                      </div>
                    )}
                    
                    <div className="signal-timestamp">
                      {formatDate(signal.timestamp)}
                    </div>
                  </div>
                  
                  <div className="signal-actions">
                    <button
                      onClick={() => handleDeleteSignal(signal._id)}
                      className="delete-button"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="pagination-button"
              >
                Previous
              </button>
              
              <span className="pagination-info">
                Page {currentPage} of {totalPages}
              </span>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="pagination-button"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SignalList;