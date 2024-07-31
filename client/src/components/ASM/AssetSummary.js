import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

const AssetSummary = ({ asset }) => {
  return (
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
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default AssetSummary;
