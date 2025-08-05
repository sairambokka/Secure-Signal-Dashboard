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
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

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

  const toggleCardExpansion = (signalId: string) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(signalId)) {
        newSet.delete(signalId);
      } else {
        newSet.add(signalId);
      }
      return newSet;
    });
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
              const isExpanded = expandedCards.has(signal._id);
              return (
                <div key={signal._id} className="signal-card">
                  <div className="signal-header">
                    <div className="signal-header-left">
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
                    <button
                      onClick={() => toggleCardExpansion(signal._id)}
                      className="expand-button"
                      aria-label={isExpanded ? "Collapse details" : "Expand details"}
                    >
                      <span className={`expand-arrow ${isExpanded ? 'expanded' : ''}`}>
                        ▼
                      </span>
                    </button>
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
                    
                    <div className="signal-timestamp">
                      {formatDate(signal.timestamp)}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="signal-details">
                      <div className="details-section">
                        <h4>Complete Signal Details</h4>
                        
                        <div className="detail-item">
                          <strong>Signal ID:</strong> {signal._id}
                        </div>
                        
                        <div className="detail-item">
                          <strong>User ID:</strong> {signal.user_id}
                        </div>
                        
                        <div className="detail-item">
                          <strong>Agent ID:</strong> {signal.agent_id}
                        </div>
                        
                        <div className="detail-item">
                          <strong>Signal Type:</strong> {signal.signal_type}
                        </div>
                        
                        <div className="detail-item">
                          <strong>Timestamp:</strong> {signal.timestamp}
                        </div>
                        
                        <div className="detail-item">
                          <strong>Created At:</strong> {formatDate(signal.createdAt)}
                        </div>
                        
                        <div className="detail-item">
                          <strong>Updated At:</strong> {formatDate(signal.updatedAt)}
                        </div>
                      </div>

                      <div className="details-section">
                        <h4>Payload Details</h4>
                        
                        <div className="detail-item">
                          <strong>Average Value:</strong> {signal.payload.avg}
                        </div>
                        
                        {signal.payload.sdnn && (
                          <div className="detail-item">
                            <strong>SDNN:</strong> {signal.payload.sdnn}
                          </div>
                        )}
                        
                        <div className="detail-item">
                          <strong>Raw Data Points:</strong> {signal.payload.raw.length}
                        </div>
                        
                        <div className="detail-item">
                          <strong>Raw Values:</strong>
                          <div className="raw-data-container">
                            <pre className="raw-data">
                              {JSON.stringify(signal.payload.raw, null, 2)}
                            </pre>
                          </div>
                        </div>
                      </div>

                      {signal.context && Object.keys(signal.context).length > 0 && (
                        <div className="details-section">
                          <h4>Context Information</h4>
                          
                          {signal.context.activity && (
                            <div className="detail-item">
                              <strong>Activity:</strong> {signal.context.activity}
                            </div>
                          )}
                          
                          {signal.context.environment && (
                            <div className="detail-item">
                              <strong>Environment:</strong> {signal.context.environment}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  
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