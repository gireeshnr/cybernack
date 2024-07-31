import React from 'react';
import { Box, Grid, Typography } from '@mui/material';
import { Bar } from 'react-chartjs-2';

const NetworkInformation = ({ asset }) => {
  const renderPorts = () => {
    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Port</TableCell>
              <TableCell>Protocol</TableCell>
              <TableCell>State</TableCell>
              <TableCell>Reason</TableCell>
              <TableCell>Reason TTL</TableCell>
              <TableCell>Service</TableCell>
              <TableCell>Product</TableCell>
              <TableCell>Extra Info</TableCell>
              <TableCell>Method</TableCell>
              <TableCell>Confidence</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {asset.ports.map(port => (
              <TableRow key={port._id}>
                <TableCell>{port.portid}</TableCell>
                <TableCell>{port.protocol}</TableCell>
                <TableCell>{port.state}</TableCell>
                <TableCell>{port.reason}</TableCell>
                <TableCell>{port.reason_ttl}</TableCell>
                <TableCell>{port.service}</TableCell>
                <TableCell>{port.product}</TableCell>
                <TableCell>{port.extra_info}</TableCell>
                <TableCell>{port.method}</TableCell>
                <TableCell>{port.confidence}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const renderAdditionalInfo = () => {
    return (
      <TableContainer component={Paper} className="additional-info-table">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Field</TableCell>
              <TableCell>Value</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>TCP Sequence</TableCell>
              <TableCell>{asset.tcpSequence}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>IP ID Sequence</TableCell>
              <TableCell>{asset.ipIdSequence}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>TCP Timestamp Sequence</TableCell>
              <TableCell>{asset.tcpTimestampSeq}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>SRTT</TableCell>
              <TableCell>{asset.srtt}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>RTT Variance</TableCell>
              <TableCell>{asset.rttVariance}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Timeout</TableCell>
              <TableCell>{asset.timeout}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Distance</TableCell>
              <TableCell>{asset.distance}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Traceroute</TableCell>
              <TableCell>
                <pre>{JSON.stringify(asset.traceroute, null, 2)}</pre>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const renderPortStatusCharts = () => {
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

  const renderServiceDistribution = () => {
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
  
    return (
      <Box>
        <Grid container spacing={3} mt={2}>
          <Grid item xs={12} md={6}>
            {renderPortStatusCharts()}
          </Grid>
          <Grid item xs={12} md={6}>
            {renderServiceDistribution()}
          </Grid>
        </Grid>
        <Box mt={4}>
          <Typography variant="h6">Ports</Typography>
          {renderPorts()}
        </Box>
        <Box mt={4}>
          <Typography variant="h6">Additional Information</Typography>
          {renderAdditionalInfo()}
        </Box>
      </Box>
    );
  };
  
  export default NetworkInformation;
  