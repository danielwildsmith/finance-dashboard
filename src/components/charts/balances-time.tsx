import React, { PureComponent } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DatedNetWorth } from '../pages/balances';
import { Typography } from '@mui/material';

const CustomYAxisFormatter = (value : number) => `$${value.toLocaleString()}`;

const CustomOnHoverFormatter = (value : any) => {
  if(typeof value === 'number') {
    return `$${(value).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`
  }

  return value;
}

export const NetWorthTimeGraph = ({ data }: { data: DatedNetWorth[] | null }) => {
    if(data) {
        return (
          <>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="none" stroke="#878fa0"  />
                <XAxis dataKey="date" stroke="#878fa0" />
                <YAxis tickFormatter={CustomYAxisFormatter} stroke="#878fa0"  />
                <Tooltip formatter={CustomOnHoverFormatter}/>
                <Line type="monotone" dataKey="Total" stroke="#139eca" />
              </LineChart>
            </ResponsiveContainer>
            {data.length < 5 ? 
              <Typography variant='body2' sx={{textAlign: 'center', color: '#878fa0'}}>
                *The graph displays the most recent 13 weekly balance records available and provides more meaningful insights 
                a few weeks after account creation.*
              </Typography>
              : null
            }
          </>
        );
    };
    return <></>;
}
