import React from 'react';
import { Box, Typography } from '@mui/material';
import { Bar } from 'react-chartjs-2';

// Import the Chart.js setup
import '../../utils/ChartSetup';

const ServiceDistributionChart = ({ asset }) => {
  if (!asset || !asset.ports) {
    return (
      <Box>
        <Typography variant="h6">Service Distribution</Typography>
        <Typography>No data available</Typography>
      </Box>
    );
  }

  const serviceCounts = asset.ports.reduce((acc, port) => {
    acc[port.service] = (acc[port.service] || 0) + 1;
    return acc;
  }, {});

  const serviceData = {
    labels: Object.keys(serviceCounts),
    datasets: [
      {
        label: 'Service Distribution',
        data: Object.values(serviceCounts),
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
      <Typography variant="h6">Service Distribution</Typography>
      <Bar data={serviceData} />
    </Box>
  );
};

export default ServiceDistributionChart;
