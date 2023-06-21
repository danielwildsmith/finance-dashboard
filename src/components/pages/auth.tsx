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

  export const CreateAccountLinkedCookie = async () => {
    try {
      const res = await axios.get(`http://localhost:8000/api/user-tokens/${GetUsername()}`);
      if (res.data > 0)
        document.cookie = 'isAccountLinked=true' + '; path=/; SameSite=Lax';
      else 
        document.cookie = 'isAccountLinked=false' + '; path=/; SameSite=Lax';
  
      return Promise.resolve(); // Resolve the promise after creating the cookie
    } catch (error) {
      console.error(error);
      return Promise.reject(error); // Reject the promise if an error occurs
    }
  };  

  export const isAccountLinked = () => {
    const cookies = document.cookie.split(';');
    
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.startsWith('isAccountLinked=')) {
        const cookieValue = cookie.substring(16);
        if (cookieValue === 'true' || GetUsername() === 'sample')
          return true;
        else
          return false;
      }
    }
    return false;
  }

export const AuthForm = ( {type}: {type: string}) => {
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
    
        axios.post(`http://localhost:8000/api/users/${type}`, req, config)
        .then(res => {
            setStatus('success');
            setMessage('Success!');
            const createCookies = async () => {
              document.cookie = 'username=' + req.username + '; path=/; SameSite=Lax';
              const resp = await CreateAccountLinkedCookie();

              navigate('/dashboard');
            }
            createCookies();
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
      <>
        <div style={{height: '85vh', display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
          {type === 'signin' ? null : 
            <div style={{width: '100%', textAlign: 'center', marginTop: 8}}>
              <Typography variant='h4' color={'#f6f7f9'}>Welcome to your Finance Dashboard!</Typography>
            </div>
          }
          <Container component="main" maxWidth="xs" className="container">
          <CssBaseline />
          <Box
            sx={{
              marginTop: type === 'signin' ? 8 : 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: 4,
              paddingTop: type === 'signin' ? 4 : 0,
              borderRadius: 2
            }}
          >
            {type === 'signin' ? 
              <>
                <Avatar sx={{ m: 1, backgroundColor: '#1976d2'}}>
                  <LockOutlinedIcon />
                </Avatar>
                <Typography component="h1" variant="h4" sx={{color: "#f6f7f9"}}>
                Sign In
                </Typography> 
              </>
            : 
              null
            }
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
                {type === 'signin' ? 'Sign in' : 'Sign up'}
              </Button>
              <Grid container>
                {type === 'signup' ? null
                : <Grid item>
                    <Link onClick={() => navigate(`/signup`)} variant="body2"> {"Create Account"} </Link>
                  </Grid>
                }
              </Grid>
            </Box>
          </Box>
        </Container>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', textAlign: 'center' }}>
          <Typography variant='body1' sx={{width: '100%', flexGrow: 1, marginTop: 7, color: '#878fa0'}}>
            { `Created by Daniel Wildsmith. Project details can be found `}
            <Link href="https://github.com/danielwildsmith/finance-dashboard" variant="body1" target="_blank" rel="noopener">{"here"}</Link>
            .
          </Typography>
        </div>
      </>
    )
};