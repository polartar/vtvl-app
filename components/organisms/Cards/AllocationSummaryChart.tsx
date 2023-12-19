import React from 'react';
import { Cell, Legend, Pie, PieChart } from 'recharts';

export interface AllocationSummaryChartProps {
  width?: number;
  height?: number;
  innerRadius?: number;
  outerRadius?: number;
  colors: Array<string>;
  data: Array<{ name: string; value: number }>;
  legends?: boolean;
}

export default function AllocationSummaryChart({
  width = 323,
  height = 323,
  innerRadius = 120,
  outerRadius = 144,
  data,
  colors,
  legends = false
}: AllocationSummaryChartProps) {
  return (
    <PieChart width={width} height={height}>
      <Pie data={data} cx={'50%'} cy={'50%'} innerRadius={innerRadius} outerRadius={outerRadius} dataKey="value">
        {data.map((_, index) => (
          <Cell key={`cell-${index}`} fill={colors[index]} />
        ))}
      </Pie>
      {legends && <Legend iconType="circle" />}
    </PieChart>
  );
}
