import React, { useState } from 'react';
import { PieChart, Pie, Sector, ResponsiveContainer, Cell } from 'recharts';
import { TypedBalance } from './balances';
import { Grid, Typography } from '@mui/material';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#227878', '#9C27B0', '#E5005E', '#555555'];

//@ts-ignore
const renderActiveShape = (props) => {
  const RADIAN = Math.PI / 180;
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill}>
        {`${payload.type[0].toUpperCase()}${payload.type.slice(1)}`}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#f6f7f9">{`$${value}`}</text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fontSize={13} fill="#707787">{`(${(percent * 100).toFixed(2)}%)`}</text>
    </g>
  );
};

export const Totals = ({ data }: { data: TypedBalance[] | null }) => {
  const [index, setIndex] = useState(0); 

  const onPieEnter = (_ : null, index : number) => {
    setIndex(index);
  };

  const getCurrentNetWorth = (): string => {
    let total = 0;
    data?.forEach(balance => {
        total += balance.total;
    });

    return `$${(total).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
};


  if(data) {
    return (
        <Grid container spacing={0} justifyContent={'center'}>
            <Grid item xs={12} sm={6} lg={3.5} height={'43vh'} sx={{display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
                    <Typography variant="h4" sx={{textAlign: 'center', color: '#878fa0', textDecoration: 'underline'}}><strong>Total Net Worth</strong></Typography>
                    <Typography variant="h4" sx={{textAlign: 'center', color: '#139eca'}}>{getCurrentNetWorth()}</Typography>
                </Grid>
            <Grid item xs={12} sm={6} lg={3.5} height={'43vh'}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            activeIndex={index}
                            activeShape={renderActiveShape}
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={'50%'}
                            outerRadius={'70%'}
                            dataKey="total"
                            onMouseEnter={onPieEnter}
                            onClick={onPieEnter}
                            >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
            </Grid>
        </Grid>
    );
  }
  return <></>;
}
