import React from 'react';
import { Box, Typography } from '@mui/material';
import { Bar } from 'react-chartjs-2';

// Import the Chart.js setup
import '../../utils/ChartSetup';

const PortStatusChart = ({ asset }) => {
  if (!asset || !asset.ports) {
    return (
      <Box>
        <Typography variant="h6">Port Status</Typography>
        <Typography>No data available</Typography>
      </Box>
    );
  }

  const portStates = asset.ports.reduce((acc, port) => {
    acc[port.state] = (acc[port.state] || 0) + 1;
    return acc;
  }, {});

  const portData = {
    labels: Object.keys(portStates),
    datasets: [
      {
        label: 'Port Status',
        data: Object.values(portStates),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
        ],
      },
    ],
  };

  return (
    <Box className="chart">
      <Typography variant="h6">Port Status</Typography>
      <Bar data={portData} />
    </Box>
  );
};

export default PortStatusChart;
