import React, { useState, useEffect } from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface User {
    username: string,
    password: string
}

export const isLoggedIn = () => {
    const cookies = document.cookie.split(';');
    
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.startsWith('username' + '=')) {
        return true;
      }
    }
    
    return false;
  }

  export const GetUsername = (): string => {
    const cookieString = document.cookie;
    const match = cookieString.match(/username=([^;]+)/);

    return match ? match[1] : '';
  };

export const LoginForm = () => {
    const [status, setStatus] = useState('');
    const [message, setMessage] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        if(isLoggedIn())
            navigate('/dashboard');
    });

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
    
        const req : User = {
            username: data.get('username') as string,
            password: data.get('password') as string
        }

        const config = {
            headers: {"Content-Type": "application/json"},
            withCredentials: true
        }
    
        axios.post('http://localhost:8000/api/users/signin', req, config)
        .then(res => {
            setStatus('success');
            setMessage('Success!');
            document.cookie = 'username=' + req.username + '; path=/; SameSite=Lax';
            navigate('/dashboard');
        })
        .catch(error => {
            if (error.response)
                setMessage(error.response.data.error);
            else {
                // Handle network or other errors
                console.error(error);
                setMessage('Internal server error.')
            }
            setStatus('error');
        });
    };

    let alert;
    if(status === 'error')
        alert = <Alert variant="filled" severity="error" sx={{ mt: 1 }}><strong>Error.</strong> {message}</Alert>
    else if(status === 'success')
        alert = <Alert variant="filled" severity="success" sx={{ mt: 1 }}><strong>{message}</strong></Alert>
    else
        alert = <></>;

    return (
        <Container component="main" maxWidth="xs" className="container">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: 4,
            borderRadius: 2
          }}
        >
          <Avatar sx={{ m: 1, backgroundColor: '#139eca' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h4" sx={{color: "#f6f7f9"}}>
            Sign in
          </Typography>
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              //required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              autoFocus
              style={{backgroundColor: '#343a46'}}
              InputLabelProps={{ style: {color: '#707787'} }}
              inputProps={{ style: {color: '#707787'} }}
              placeholder="user_good"
            />
            <TextField
              margin="normal"
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              style={{backgroundColor: '#343a46'}}
              InputLabelProps={{ style: {color: '#707787'} }}
              inputProps={{ style: {color: '#707787'} }}
              placeholder="pass_good"
            />
            {alert}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Sign In
            </Button>
            <Grid container>
              <Grid item xs>
                <Link href="#" variant="body2">
                  Forgot password?
                </Link>
              </Grid>
              <Grid item>
                <Link href="#" variant="body2">
                  {"Don't have an account? Sign Up"}
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Container>
    )
};