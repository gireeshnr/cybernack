import React, { useEffect, useState } from 'react';
import axios from '../api';

const TargetList = () => {
  const [targets, setTargets] = useState([]);

  useEffect(() => {
    axios.get('/api/targets').then(response => {
      setTargets(response.data);
    }).catch(error => {
      console.error('Error fetching targets:', error);
    });
  }, []);

  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Domain</th>
        </tr>
      </thead>
      <tbody>
        {targets.map(target => (
          <tr key={target._id}>
            <td>{target.name}</td>
            <td>{target.domain}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default TargetList;
