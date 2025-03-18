import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ClientActivityChartProps {
  data: {
    date: string;
    workoutsCompleted: number;
    workoutsAssigned: number;
  }[];
}

const ClientActivityChart = ({ data }: ClientActivityChartProps) => {
  return (
    <Card className="col-span-3 h-[350px]">
      <CardHeader>
        <CardTitle>Client Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart
            data={data}
            margin={{
              top: 10,
              right: 30,
              left: 0,
              bottom: 0,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                borderColor: "hsl(var(--border))",
                borderRadius: "6px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
              }}
              itemStyle={{ color: "hsl(var(--foreground))" }}
              labelStyle={{ color: "hsl(var(--foreground))" }}
            />
            <Area
              type="monotone"
              dataKey="workoutsAssigned"
              stackId="1"
              stroke="hsl(var(--primary))"
              fill="hsla(var(--primary), 0.2)"
            />
            <Area
              type="monotone"
              dataKey="workoutsCompleted"
              stackId="2"
              stroke="hsl(var(--success))"
              fill="hsla(var(--success), 0.2)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default ClientActivityChart;
