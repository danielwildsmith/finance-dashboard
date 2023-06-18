import React from 'react';
import { BarChart, Bar, Legend, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Label, LabelList } from 'recharts';
import { CATEGORIES, COLORS_MAP, MonthlyTotalData } from '../pages/transactions';
import { styled } from '@mui/material/styles';

const CustomYAxisFormatter = (value : string) => {
  const date = new Date();
  date.setMonth(Number(value) - 1);

  return date.toLocaleString('en-US', { month: 'long' }).substring(0, 3); 
};

const CustomXAxisFormatter = (value : number) => `$${value.toLocaleString()}`;

const formatLabel = (label: string) => {
  if (['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'].includes(label)) {
    const date = new Date();
    date.setMonth(Number(label) - 1);
    return date.toLocaleString('en-US', { month: 'long' }); 
  }
  return label;
};

const CustomOnHoverValueFormatter = (value : any) => {
  if(typeof value === 'number') {
    return `$${(value).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`
  }

  return value;
}

export const MonthlyTotalGraph = ({ data }: { data: MonthlyTotalData[] | null }) => {
  if (data) {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 0,
            right: 60,
            left: 0,
            bottom: 0,
          }}
          layout="vertical"
          barCategoryGap={18}
        >
          <CartesianGrid horizontal={false} strokeDasharray="none" stroke="#878fa0" />
          <XAxis type="number" tickFormatter={CustomXAxisFormatter} tickCount={5} stroke="#878fa0" />
          <YAxis type="category" dataKey="month" tickFormatter={CustomYAxisFormatter} stroke="#878fa0" />
          <Tooltip labelFormatter={formatLabel} formatter={CustomOnHoverValueFormatter}/>
          {CATEGORIES.map((category, index) => {
            const result = (
              <Bar key={category} dataKey={category} stackId="stack" name={category} fill={COLORS_MAP[category]}>
                {index === CATEGORIES.length - 1 ? 
                <LabelList
                  dataKey={"total"}
                  position="center"
                  content={({ value, x, y, width, height }) => (
                    <g>
                      <line x1={Number(x) + Number(width)} y1={Number(y) + Number(height) / 2} x2={Number(x) + Number(width) + 8} y2={Number(y) + Number(height) / 2} stroke="#878fa0" strokeWidth={1} />
                      <text x={Number(x) + Number(width) + 32} y={Number(y) + Number(height) / 2} fill={'#878fa0'} textAnchor="middle" dy={+4} fontSize={12}>
  {`$${value?.toLocaleString()}`}
</text>

                    </g>
                  )}
                /> : null}
              </Bar>
            );
            return result;
          })}
        </BarChart>
      </ResponsiveContainer>
    );
  }
  return <></>;
};
