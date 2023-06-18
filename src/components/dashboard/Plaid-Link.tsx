// APP COMPONENT
// Upon rendering of App component, make a request to create and
// obtain a link token to be used in the Link component
import React, { useEffect, useState } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import { Typography } from '@mui/material';
import Button from '@mui/material/Button';
import styled from '@emotion/styled/types/base';

const App = () => {
  const [linkToken, setLinkToken] = useState(null);
  const generateToken = async () => {
    const response = await fetch('/api/user-tokens/create', {
      method: 'POST',
    });
    const data = await response.json();
    setLinkToken(data.link_token);
  };
  useEffect(() => {
    generateToken();
  }, []);
  return linkToken != null ? <Link linkToken={linkToken} /> : <></>;
};

// LINK COMPONENT
// Use Plaid Link and pass link token and onSuccess function
// in configuration to initialize Plaid Link
interface LinkProps {
  linkToken: string | null;
}

const Link: React.FC<LinkProps> = (props: LinkProps) => {
    // @ts-ignore
  const onSuccess = React.useCallback((public_token, metadata) => {
    // send public_token to server
    const response = fetch('/api/user-tokens/set', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ public_token }),
    });
    // Handle response ...
  }, []);
  const config: Parameters<typeof usePlaidLink>[0] = {
    token: props.linkToken!,
    onSuccess,
  };
  const { open, ready } = usePlaidLink(config);
  return (
    <Button 
      onClick={() => open()} disabled={!ready}
      sx={{
        backgroundColor: 'black', color: '#f6f7f9', border: 'none', padding: 1.5, paddingRight: 10, paddingLeft: 10, borderRadius: 5,
        ':hover': { backgroundColor: '#1a1e24', color: '#139eca'}
      }}
    >
        Link An Account
    </Button>
  );
};

export default App;