import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

const PortsTable = ({ asset }) => {
  if (!asset || !asset.ports) {
    return <p>No port information available.</p>;
  }

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
          {asset.ports.map((port) => (
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

export default PortsTable;
