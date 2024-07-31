import React, { useState } from 'react';
import axios from 'axios';
import './Discovery.css';

const Discovery = () => {
  const [selectedSources, setSelectedSources] = useState({
    zoomEye: false,
    NMAP: false,
    Shodan: false,
    Censys: false,
    // Add more sources as needed
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target;
    setSelectedSources((prevState) => ({
      ...prevState,
      [name]: checked,
    }));
  };

  const handleDiscovery = async () => {
    const selected = Object.keys(selectedSources).filter(source => selectedSources[source]);

    if (selected.length === 0) {
      setMessage('Please select at least one source.');
      return;
    }

    setLoading(true);
    setMessage('Discovery started...');
    try {
      for (const source of selected) {
        const response = await axios.post(`/api/discovery/${source.toLowerCase()}`, {}, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('auth_jwt_token')}`
          }
        });
        console.log(`${source} results:`, response.data);
      }
      setMessage('Discovery completed successfully');
    } catch (error) {
      console.error('Error running discovery:', error);
      setMessage('Error running discovery');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="discovery-container">
      <h2>Discovery</h2>
      <form>
        {Object.keys(selectedSources).map((source) => (
          <div key={source} className="form-group">
            <input
              type="checkbox"
              id={source}
              name={source}
              checked={selectedSources[source]}
              onChange={handleCheckboxChange}
            />
            <label htmlFor={source} style={{ marginLeft: '8px' }}>{source}</label>
          </div>
        ))}
      </form>
      <button onClick={handleDiscovery} className="discover-button" disabled={loading}>
        {loading ? 'Running...' : <><i className="fas fa-search"></i> Discover</>}
      </button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default Discovery;
