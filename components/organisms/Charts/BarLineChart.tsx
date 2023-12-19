/**
 * BarLineChart component
 * Intended to display a comparison of two data points
 * Line chart is used to display the changes in price -- based on UI design
 * Bar chart is used to display the changes in claims -- based on UI design
 */
import { Bar, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, XAxis, YAxis } from 'recharts';

interface IBarLineChartProps {
  // Width of the chart
  width?: number;
  // Height of the chart
  height?: number;
  // Add legends to the chart
  legends?: boolean;
  // Data to be displayed on the chart
  data: Array<{ name: string; lineValue: number; barValue: number }>;
}

const BarLineChart = ({ width = 323, height = 323, legends = false, data }: IBarLineChartProps) => {
  return (
    data && (
      <ResponsiveContainer width={'99%'} height={height}>
        <ComposedChart width={width} height={height} data={data}>
          <XAxis dataKey="name" />
          <YAxis />
          <Legend />
          <CartesianGrid stroke="#d0d5dd" strokeDasharray="0 0" vertical={false} />
          <Bar name="Claim" dataKey="barValue" barSize={20} fill="#fbbf24" />
          <Line name="Price" type="monotone" dataKey="lineValue" stroke="#324aa4" />
        </ComposedChart>
      </ResponsiveContainer>
    )
  );
};

export default BarLineChart;
