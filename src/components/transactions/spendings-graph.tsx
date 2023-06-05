import React from 'react';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { MonthlyCategoryData } from './transactions';
import chroma from 'chroma-js';

export const SpendingsGraph = ( { data, colors }: {data: MonthlyCategoryData[] | null, colors: string[]} ) => {
  console.log(data);
  if(data) {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          width={500}
          height={300}
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3 " />
          <XAxis dataKey="category" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey='selected_month_amount'>
            {
              data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index]} />
              ))
            }
          </Bar>
          <Bar dataKey='previous_month_amount'>
            {
              data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={chroma(colors[index]).brighten(0.95).hex()} />
              ))
            }
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  }
  return <></>;
};
