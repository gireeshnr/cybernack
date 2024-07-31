import React from 'react';
import { Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography } from '@mui/material';
import OSDistributionChart from './OSDistributionChart';

const AssetDetails = ({ asset, scanResults }) => {
  return (
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
                <TableCell>Domain</TableCell>
                <TableCell>{asset.domain}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>IP Address</TableCell>
                <TableCell>{asset.ip}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Status</TableCell>
                <TableCell>{asset.status}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Hostnames</TableCell>
                <TableCell>{asset.hostnames.join(', ')}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>OS</TableCell>
                <TableCell>{asset.os}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Uptime</TableCell>
                <TableCell>{asset.uptime}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Sources</TableCell>
                <TableCell>
                  {Object.keys(asset.sources).map((source, index) => (
                    <div key={index}>
                      <strong>{source}</strong>: Last seen at {new Date(asset.sources[source]).toLocaleString()}
                    </div>
                  ))}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>
      <Grid item xs={12} md={6}>
        <OSDistributionChart scanResults={scanResults} />
      </Grid>
      <Grid item xs={12}>
        <TableContainer component={Paper}>
          <Typography variant="h6" component="div" gutterBottom>
            Ports
          </Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Port</TableCell>
                <TableCell>Protocol</TableCell>
                <TableCell>State</TableCell>
                <TableCell>Service</TableCell>
                <TableCell>Product</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {asset.ports.map((port, index) => (
                <TableRow key={index}>
                  <TableCell>{port.portid}</TableCell>
                  <TableCell>{port.protocol}</TableCell>
                  <TableCell>{port.state}</TableCell>
                  <TableCell>{port.service}</TableCell>
                  <TableCell>{port.product}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>
    </Grid>
  );
};

export default AssetDetails;
