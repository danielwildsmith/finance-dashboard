import React, { useState, useEffect } from 'react';
import { Grid, Card, CardActions, CardContent, Button, Typography, Container, Box } from '@mui/material';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import axios from 'axios';
import { GetUsername } from '../login';
import { NorthOutlined, SouthOutlined, CreditCard } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export interface MonthlyAmountComparison {
    recentAmount: number,
    previousAmount: number,
    available: boolean
}

const BalancesCard = () => {
  const [data, setData] = useState<MonthlyAmountComparison | null>(null);

  const navigate = useNavigate();

  const getData = () => {
    axios.get(`http://localhost:8000/api/balances/comparison/${GetUsername()}/`)
        .then(res => {
            setData(res.data);
        })
        .catch(error => {
            console.error(error);
        });
  }

  useEffect(() => {
    const fetchData = async () => {
        await getData()
      };

    fetchData();
  }, [])

  const renderComparison = () => {
    if(data) {
        if(data.available) {
            const percentageChange = ((data.recentAmount - data.previousAmount) / Math.abs(data.previousAmount)) * 100;
            const roundedPercentageChange = Number(percentageChange.toFixed(0));

            if(data.recentAmount >= data.previousAmount) {
                return (
                    <span>
                        <NorthOutlined sx={{color: '#1ebd1e'}}></NorthOutlined>
                        <Typography variant='h6' sx={{color: '#1ebd1e'}}>{roundedPercentageChange}%</Typography>
                    </span>
                )
            } 
            else {
                return (
                    <span>
                        <SouthOutlined sx={{color: '#c71414'}}></SouthOutlined>
                        <Typography variant='h6' sx={{color: '#c71414'}}>{roundedPercentageChange}%</Typography>
                    </span>
                )
            }   
        }
        else {
            return <p>Comparison data not available yet.</p>
        }
    }
    return <></>;
  }

  if(data) {
    return (
        <Container>
            <Card sx={{ minWidth: 275, backgroundColor: '#343a46' }}>
                <CardContent>
                    <Box sx={{ backgroundColor: '#444c5d', width: 'fit-content', height: 'fit-content', padding: 2}}>
                        <AccountBalanceIcon sx={{ color: '#f6f7f9', fontSize: 36 }}/>
                    </Box>
                    <Typography variant='h6' sx={{color: '#707787'}}><strong>Net Worth</strong></Typography>
                    <Typography variant='h6' sx={{color: '#878fa0'}}>${data.recentAmount}</Typography>
                    {renderComparison()}
                </CardContent>
                <CardActions>
                    <Button onClick={() => navigate('/balances')}>See More</Button>
                </CardActions>
            </Card>
        </Container>
    );
  }
  return <></>;
}

const TransactionsCard = () => {
    const [data, setData] = useState<MonthlyAmountComparison | null>(null);

  const navigate = useNavigate();

  const getData = () => {
    axios.get(`http://localhost:8000/api/transactions/comparison/${GetUsername()}/`)
        .then(res => {
            setData(res.data);
        })
        .catch(error => {
            console.error(error);
        });
  }

  useEffect(() => {
    const fetchData = async () => {
        await getData()
      };

    fetchData();
  }, [])

  const renderComparison = () => {
    if(data) {
        if(data.available) {
            const percentageChange = ((data.recentAmount - data.previousAmount) / Math.abs(data.previousAmount)) * 100;
            const roundedPercentageChange = Number(percentageChange.toFixed(0));

            if(data.recentAmount >= data.previousAmount) {
                return (
                    <span>
                        <NorthOutlined sx={{color: '#1ebd1e'}}></NorthOutlined>
                        <Typography variant='h6' sx={{color: '#1ebd1e'}}>{roundedPercentageChange}%</Typography>
                    </span>
                )
            } 
            else {
                return (
                    <span>
                        <SouthOutlined sx={{color: '#c71414'}}></SouthOutlined>
                        <Typography variant='h6' sx={{color: '#c71414'}}>{roundedPercentageChange}%</Typography>
                    </span>
                )
            }   
        }
        else {
            return <p>Comparison data not available yet.</p>
        }
    }
    return <></>;
  }

  if(data) {
    return (
        <Container>
            <Card sx={{ minWidth: 275, backgroundColor: '#343a46' }}>
                <CardContent>
                    <Box sx={{ backgroundColor: '#444c5d', width: 'fit-content', height: 'fit-content', padding: 2}}>
                        <CreditCard sx={{ color: '#f6f7f9', fontSize: 36 }}/>
                    </Box>
                    <Typography variant='h6' sx={{color: '#707787'}}><strong>Transactions</strong></Typography>
                    <Typography variant='h6' sx={{color: '#878fa0'}}>${data.recentAmount}</Typography>
                    {renderComparison()}
                </CardContent>
                <CardActions>
                    <Button onClick={() => navigate('/transactions')}>See More</Button>
                </CardActions>
            </Card>
        </Container>
    );
  }
  return <></>;
}

export const DashboardCards = () => {
    return (
        <Grid container spacing={0}>
                <Grid item xs={12} sm={4} lg={4} height={'60vh'} >
                    <BalancesCard />
                </Grid>
                <Grid item xs={12} sm={4} lg={4} height={'60vh'} >
                    <TransactionsCard />
                </Grid>
        </Grid>
    )
}