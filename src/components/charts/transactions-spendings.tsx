import React from "react";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LabelList,
  ResponsiveContainer,
} from "recharts";
import {CATEGORIES, COLORS_MAP, CategoryData} from "../pages/transactions";
import chroma from "chroma-js";

const CustomYAxisFormatter = (value: number) => `$${value.toLocaleString()}`;

export const CategorySpendingsGraph = ({
  data,
}: {
  data: CategoryData[] | null;
}) => {
  if (data) {
    let index = 0;

    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 20,
            left: 20,
            bottom: 0,
          }}
          barGap={0}
          barCategoryGap={18}
        >
          <CartesianGrid
            vertical={false}
            strokeDasharray="none"
            stroke="#878fa0"
          />
          <YAxis tickFormatter={CustomYAxisFormatter} stroke="#878fa0" />
          <XAxis tick={false} stroke="#878fa0" />
          <Bar dataKey="previous_month_amount">
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={chroma(COLORS_MAP[entry.category]).brighten(0.95).hex()}
              />
            ))}
          </Bar>
          <Bar dataKey="amount">
            <LabelList
              dataKey="amount"
              position="top"
              content={({value, x, y, width}) => (
                <g>
                  <line
                    x1={Number(x) + Number(width) / 2}
                    y1={y}
                    x2={Number(x) + Number(width) / 2}
                    y2={Number(y) - 8}
                    stroke="#878fa0"
                    strokeWidth={1}
                  />
                  <text
                    x={Number(x) + Number(width) / 2}
                    y={Number(y) - 8}
                    fill={`${COLORS_MAP[CATEGORIES[index++]]}`}
                    textAnchor="middle"
                    dy={-4}
                    fontSize={12}
                  >
                    {`$${Number(value).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}`}
                  </text>
                </g>
              )}
            />
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS_MAP[entry.category]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  }
  return <></>;
};
