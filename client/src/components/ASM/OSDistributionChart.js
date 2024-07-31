import React from 'react';
import { Box, Typography } from '@mui/material';
import { Pie } from 'react-chartjs-2';

const OSDistributionChart = ({ scanResults }) => {
  console.log('OSDistributionChart scanResults:', scanResults); // Debugging statement

  const osData = scanResults.map(result => {
    if (result.additionalFields.rawXML) {
      // Parse the raw XML to extract OS information
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(result.additionalFields.rawXML, 'text/xml');
      const osMatches = xmlDoc.getElementsByTagName('osmatch');
      if (osMatches.length > 0) {
        return osMatches[0].getAttribute('name');
      }
    }
    return null;
  }).filter(os => os);

  console.log('Filtered OS Data:', osData); // Debugging statement

  const osCounts = osData.reduce((acc, os) => {
    acc[os] = (acc[os] || 0) + 1;
    return acc;
  }, {});

  console.log('OS Counts:', osCounts); // Debugging statement

  const data = {
    labels: Object.keys(osCounts),
    datasets: [
      {
        data: Object.values(osCounts),
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

  console.log('Chart Data:', data); // Debugging statement

  const chartContainerStyle = {
    height: '300px', // Adjust the height as needed to match the Asset Summary section
  };

  return (
    <Box mt={4} style={chartContainerStyle}>
      <Typography variant="h6">OS Distribution</Typography>
      {Object.keys(osCounts).length > 0 ? <Pie data={data} /> : <Typography>No data available</Typography>}
    </Box>
  );
};

export default OSDistributionChart;
