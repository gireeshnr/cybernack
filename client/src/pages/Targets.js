import React, { useState } from 'react';
import TargetForm from '../components/TargetForm';
import TargetList from '../components/TargetList';

const Targets = () => {
  const [targets, setTargets] = useState([]);

  const handleTargetAdded = (newTarget) => {
    setTargets([...targets, newTarget]);
  };

  return (
    <div>
      <h1>Targets</h1>
      <TargetForm onTargetAdded={handleTargetAdded} />
      <TargetList />
    </div>
  );
};

export default Targets;
