import React, { useState, useEffect } from 'react';
import { Grid, Card, CardActions, CardContent, Button, Typography, Container, Box } from '@mui/material';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import axios from 'axios';
import { GetUsername } from './pages/auth';
import { NorthOutlined, SouthOutlined, CreditCard } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PlaidLink from './Plaid-Link';

export interface MonthlyAmountComparison {
    recentAmount: number,
    previousAmount: number,
    available: boolean
}

const DashboardCard = ({type}: {type: string}) => {
  const [data, setData] = useState<MonthlyAmountComparison | null>(null);

  const heading = type === 'balances' ? 'Net Worth' : 'Transactions';
  const navigate = useNavigate();

  const getData = () => {
    axios.get(`http://localhost:8000/api/${type}/comparison/${GetUsername()}/`)
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
  }, []);

  const renderComparison = () => {
    if(data) {
        if(data.available) {
            const percentageChange = ((data.recentAmount - data.previousAmount) / Math.abs(data.previousAmount)) * 100;
            const roundedPercentageChange = Number(percentageChange.toFixed(0));

            if(data.recentAmount >= data.previousAmount) {
                return (
                    <div style={{display: 'flex', gap: 4, marginTop: 12, paddingBottom: 12, borderBottom: '1px solid #444c5d', justifyContent: 'center', alignItems: 'center'}}>
                        <NorthOutlined sx={{color: '#1ebd1e', fontSize: 28}} />
                        <Typography variant='h6' sx={{color: '#1ebd1e'}}>{roundedPercentageChange}%</Typography>
                    </div>
                )
            } 
            else {
                return (
                    <div style={{display: 'flex', gap: 4, marginTop: 12, paddingBottom: 12, borderBottom: '1px solid #444c5d', justifyContent: 'center', alignItems: 'center'}}>
                        <SouthOutlined sx={{color: '#1ebd1e', fontSize: 28}} />
                        <Typography variant='h6' sx={{color: '#1ebd1e'}}>{roundedPercentageChange}%</Typography>
                    </div>
                )
            }   
        }
        else {
            return (
                <div style={{display: 'flex', gap: 8, marginTop: 12, paddingBottom: 12, borderBottom: '1px solid #444c5d', justifyContent: 'center', alignItems: 'center'}}>
                    <Typography variant='h6' sx={{textAlign: 'center', color: '#707787'}}>
                        Data not yet available.*
                    </Typography>
                </div>
            )
        }
    }
    return <></>;
  }

  if(data) {
    return (
        <Container>
            <Card sx={{ minWidth: 275, backgroundColor: '#343a46' }}>
                <CardContent sx={{marginBottom: 0, paddingBottom: 0}}>
                    <div style={{display: 'flex', alignItems: 'center', marginBottom: 4, borderBottom: '1px solid #444c5d'}}>
                        {type === 'balances' ? <AccountBalanceIcon sx={{ color: '#139eca', fontSize: 32 }}/> 
                        : <CreditCard sx={{ color: '#139eca', fontSize: 32 }}/>
                        }
                        <Typography variant='h4' sx={{color: '#707787', width: '100%', textAlign: 'center'}}><strong>{heading}</strong></Typography>
                    </div>
                    <Typography variant='h4' sx={{color: '#f6f7f9', textAlign: 'center', marginTop: 1, paddingBottom: 1, borderBottom: '1px solid #444c5d'}}>
                        ${data.recentAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </Typography>
                    {renderComparison()}
                </CardContent>
                <CardActions sx={{marginTop: 1, paddingBottom: 1.5, marginLeft: 1, marginRight: 1}}>
                    <div style={{display: 'flex', width: '100%', justifyContent: 'space-between'}}>
                        <Typography variant='body1' sx={{color: '#707787'}}>This month</Typography>
                        <Button style={{color: '#139eca', padding: 0}} onClick={() => navigate(`/${type}`)}>See More</Button>
                    </div>
                </CardActions>
            </Card>
        </Container>
    );
  }
  return <></>;
}

export const DashboardCards = ({accountLinked}: {accountLinked: boolean}) => {
    return (
        <>
            <div style={{height: '84vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
                { !accountLinked ? 
                    <>
                        <Typography variant='h5' color={'#878fa0'} sx={{maxWidth: '60vw', textAlign: 'center'}}>
                            Link a financial account to learn detailed insights about your transactions and balances, powered by Plaid.
                        </Typography>
                    </>                    
                    :
                    <Grid container spacing={2} sx={{justifyContent: 'center'}}>
                        <Grid item xs={12} sm={10} lg={3.5} height={'fit-content'} >
                            <DashboardCard type={'balances'} />
                        </Grid>
                        <Grid item xs={12} sm={10} lg={3.5} height={'fit-content'} >
                            <DashboardCard type='transactions'/>
                        </Grid>
                    </Grid>
                }
                <div style={{width: '100%', display: 'flex', justifyContent: 'center', marginTop: 16}}>
                    <PlaidLink username={GetUsername()} accountLinked={accountLinked} />
                </div>       
            </div>
            { !accountLinked ? 
                <></> :
                <div style={{ display: 'flex', alignItems: 'flex-end', textAlign: 'center' }}>
                    <Typography variant='body1' sx={{ color: '#707787', width: '100%'}}>
                            *Data comparisons are monthly, requiring a time period of 30 days to pass after account creation.
                    </Typography>
                </div>
            }
        </>
    )
}