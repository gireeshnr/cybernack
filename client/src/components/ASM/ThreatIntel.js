import React, { useState } from 'react';
import { fetchThreatIntel } from '../../utils/api';
import ThreatIntelSearch from './ThreatIntelSearch';
import ThreatIntelResults from './ThreatIntelResults';
import './Vulnerability.css';

const ThreatIntel = () => {
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [threatIntelData, setThreatIntelData] = useState([]);
  const [filters, setFilters] = useState({
    domain: '',
    source: '',
    data: '',
  });

  const handleThreatIntel = async () => {
    if (!domain) {
      alert('Domain is required for threat intel.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetchThreatIntel(domain);
      setThreatIntelData(response.data);
    } catch (error) {
      console.error('Error fetching threat intel:', error);
      alert('Error fetching threat intel');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e, field) => {
    const value = e.target.value.toLowerCase();
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);

    const filtered = threatIntelData.filter((item) => {
      return Object.keys(newFilters).every((key) => {
        return item[key].toString().toLowerCase().includes(newFilters[key]);
      });
    });

    setThreatIntelData(filtered);
  };

  return (
    <div>
      <ThreatIntelSearch
        domain={domain}
        setDomain={setDomain}
        handleThreatIntel={handleThreatIntel}
        loading={loading}
        setShowToast={() => {}}
      />
      <ThreatIntelResults
        threatIntelData={threatIntelData}
        filters={filters}
        handleFilterChange={handleFilterChange}
      />
    </div>
  );
};

export default ThreatIntel;
