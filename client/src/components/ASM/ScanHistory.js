import React from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

const ScanHistory = ({ scanResults }) => {
  return (
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
  );
};

export default ScanHistory;
