import React, { useState } from 'react';
import axios from '../api';

const TargetForm = ({ onTargetAdded }) => {
  const [name, setName] = useState('');
  const [domain, setDomain] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/targets', { name, domain });
      onTargetAdded(response.data);
      setName('');
      setDomain('');
    } catch (error) {
      console.error('Error adding target:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div>
        <label>Domain</label>
        <input value={domain} onChange={(e) => setDomain(e.target.value)} required />
      </div>
      <button type="submit">Add Target</button>
    </form>
  );
};

export default TargetForm;
