import React, { useContext } from 'react';
import { GoogleDriveContext } from '../../context/GoogleDriveContext';
import { Button, Chip, Box } from '@mui/material';
import { Warning } from '@mui/icons-material';

const Auth: React.FC = () => {
  const context = useContext(GoogleDriveContext);

  if (!context) {
    return null;
  }

  const { isLoggedIn, login, logout, tokenExpired } = context;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {tokenExpired && (
        <Chip 
          icon={<Warning />}
          label="Token Expired"
          color="warning"
          size="small"
          onClick={() => login()}
          clickable
        />
      )}
      {isLoggedIn ? (
        <Button variant="contained" onClick={logout}>Logout</Button>
      ) : (
        <Button variant="contained" onClick={() => login()}>Login with Google</Button>
      )}
    </Box>
  );
};

export default Auth;
