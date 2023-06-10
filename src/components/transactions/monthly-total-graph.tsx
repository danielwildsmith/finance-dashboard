import React from 'react';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CATEGORIES, COLORS_MAP, MonthlyTotalData } from './transactions';

export const MonthlyTotalGraph = ( { data }: {data: MonthlyTotalData[] | null }) => {
    if(data) {
        return (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                width={500}
                height={300}
                data={data}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
                layout="vertical" 
                barCategoryGap={1}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="month"/>
                <Tooltip />
                {CATEGORIES.map((category, index) => (
                    <Bar key={category} dataKey={category} stackId="stack" name={category} fill={COLORS_MAP[category]} />
                ))}
                {/* <Bar dataKey="FOOD_AND_DRINK" fill="#8884d8" stackId={'stack'} />
                <Bar dataKey="UTILITY" fill="#82ca9d" stackId={'stack'} /> */}
              </BarChart>
            </ResponsiveContainer>
        );
    }
    return <></>;
};
