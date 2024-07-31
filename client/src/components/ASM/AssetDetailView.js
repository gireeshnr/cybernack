import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchAssetDetail } from '../../utils/api';
import { Card, CardContent, Typography, Grid, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Paper, CircularProgress, Box, Tabs, Tab } from '@mui/material';
import OSDistributionChart from './OSDistributionChart';
import PortStatusChart from './PortStatusChart';
import ServiceDistributionChart from './ServiceDistributionChart';
import PortsTable from './PortsTable';
import VulnerabilityInfo from './VulnerabilityInfo';
import AdditionalInfo from './AdditionalInfo'; // Import the new component
import 'chart.js/auto';
import './AssetDetailView.css';

const AssetDetailView = () => {
  const { assetId } = useParams();
  const [asset, setAsset] = useState(null);
  const [scanResults, setScanResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const getAssetDetail = async () => {
      try {
        const response = await fetchAssetDetail(assetId);
        setAsset(response.data.asset);
        setScanResults(response.data.scanResults);
        console.log('Asset:', response.data.asset); // Debugging statement
        console.log('Scan Results:', response.data.scanResults); // Debugging statement
      } catch (error) {
        console.error('Error fetching asset detail:', error);
        setError('Error fetching asset detail');
      } finally {
        setLoading(false);
      }
    };

    getAssetDetail();
  }, [assetId]);

  const handleChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Typography variant="h6" color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Card className="asset-detail-view">
      <CardContent>
        <Typography variant="h5" component="div">
          Asset Detail: {asset?.domain}
        </Typography>
        <Tabs value={tabValue} onChange={handleChange} className="tabs-container">
          <Tab label="Asset Details" />
          <Tab label="Network Information" />
          <Tab label="Vulnerability Information" />
          <Tab label="Scan History" />
        </Tabs>
        <Box className="tab-content">
          {tabValue === 0 && (
            <Grid container spacing={3} mt={2}>
              <Grid item xs={12} md={6}>
                <TableContainer component={Paper} className="asset-summary">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Field</TableCell>
                        <TableCell>Value</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>IP Address</TableCell>
                        <TableCell>{asset?.ip}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Status</TableCell>
                        <TableCell>{asset?.status}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Hostnames</TableCell>
                        <TableCell>{asset?.hostnames?.join(', ')}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>OS</TableCell>
                        <TableCell>{asset?.os}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Uptime</TableCell>
                        <TableCell>{asset?.uptime}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
              <Grid item xs={12} md={6}>
                <OSDistributionChart scanResults={scanResults} />
              </Grid>
            </Grid>
          )}
          {tabValue === 1 && (
            <Box>
              <Grid container spacing={3} mt={2}>
                <Grid item xs={12} md={6}>
                  <PortStatusChart asset={asset} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <ServiceDistributionChart asset={asset} />
                </Grid>
              </Grid>
              <Box mt={4}>
                <Typography variant="h6">Ports</Typography>
                <PortsTable asset={asset} />
              </Box>
              <Box mt={4}>
                <Typography variant="h6">Additional Information</Typography>
                <AdditionalInfo asset={asset} />
              </Box>
            </Box>
          )}
          {tabValue === 2 && (
            <Box mt={4}>
              <Typography variant="h6">Vulnerability Information</Typography>
              <VulnerabilityInfo />
            </Box>
          )}
          {tabValue === 3 && (
            <Box mt={4}>
              <Typography variant="h6">Scan History</Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Scan Info</TableCell>
                      <TableCell>Run Stats</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {scanResults.map(result => (
                      <TableRow key={result._id}>
                        <TableCell>{new Date(result.createdAt).toLocaleString()}</TableCell>
                        <TableCell>{JSON.stringify(result.scanInfo)}</TableCell>
                        <TableCell>{JSON.stringify(result.runStats)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default AssetDetailView;
