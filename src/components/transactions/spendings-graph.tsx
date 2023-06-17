import React from 'react';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, LabelList, ResponsiveContainer } from 'recharts';
import { CATEGORIES, COLORS_MAP, CategoryData } from './transactions';
import chroma from 'chroma-js';

const CustomYAxisFormatter = (value : number) => `$${value.toLocaleString()}`;

export const CategorySpendingsGraph = ( { data }: {data: CategoryData[] | null} ) => {
  if(data) {
    let index = 0;

    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          width={500}
          height={300}
          data={data}
          margin={{
            top: 0,
            right: 20,
            left: 20,
            bottom: 0,
          }}
          barGap={0}
          barCategoryGap={18}
        >
          <CartesianGrid vertical={false} strokeDasharray="none" stroke="#878fa0" />
          <YAxis tickFormatter={CustomYAxisFormatter} stroke="#878fa0" />
          <XAxis tick={false} stroke="#878fa0" />
          <Bar dataKey='previous_month_amount'>
            {
              data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={chroma(COLORS_MAP[entry.category]).brighten(0.95).hex()} />
              ))
            }
          </Bar>
          <Bar dataKey='amount' >
            <LabelList 
              dataKey="amount" 
              position="top"
              content={({ value, x, y }) => (
                <g>
                  <line x1={Number(x) + 12} y1={y} x2={Number(x) + 12} y2={Number(y) - 6} stroke="#878fa0" strokeWidth={1} />
                  <text x={Number(x) + 12} y={Number(y) - 6} fill={`${COLORS_MAP[CATEGORIES[index++]]}`} textAnchor="middle" dy={-4} fontSize={12}>
                    {`$${value?.toLocaleString()}`}
                  </text>
                </g>
              )}
            />
            {
              data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS_MAP[entry.category]} />
              ))
            }
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  }
  return <></>;
};
