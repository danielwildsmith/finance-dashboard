import React from 'react';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { COLORS_MAP, CategoryData } from './transactions';
import chroma from 'chroma-js';

export const CategorySpendingsGraph = ( { data }: {data: CategoryData[] | null} ) => {
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
          <Bar dataKey='amount'>
            {
              data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS_MAP[entry.category]} />
              ))
            }
          </Bar>
          <Bar dataKey='previous_month_amount'>
            {
              data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={chroma(COLORS_MAP[entry.category]).brighten(0.95).hex()} />
              ))
            }
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  }
  return <></>;
};
