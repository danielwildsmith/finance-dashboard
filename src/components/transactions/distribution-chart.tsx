import React from 'react';
import { PieChart, Pie, Sector, Cell, ResponsiveContainer } from 'recharts';
import { COLORS_MAP, CategoryData } from './transactions';

const RADIAN = Math.PI / 180;
//@ts-ignore
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={12}>
      {percent === 0 ? null : `${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export const CategoryDistributionChart = ({ data }: { data: CategoryData[] | null }) => {
  if(data) {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <PieChart width={400} height={400} margin={{ top: 0, left: 0, right: 0, bottom: 0 }}>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={'85%'}
            fill="#8884d8"
            dataKey="amount"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS_MAP[entry.category]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    );
  }
  return <></>;
};
