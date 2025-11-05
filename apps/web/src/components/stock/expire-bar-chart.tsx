"use client";

import { TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export const description = "A bar chart";

interface ChartData {
  status: string;
  count: number;
  fill: string;
}

const chartConfig = {
  count: {
    label: "Expire",
    color: "var(--chart-1)",
  },
  hijau: {
    label: "> 12 bln",
    color: "var(--chart-green)",
  },
  kuning: {
    label: "6-12 bln",
    color: "var(--chart-amber)",
  },
  merah: {
    label: "< 6 bln",
    color: "var(--chart-red)",
  },
} satisfies ChartConfig;

export function ExpireBarChart({ data }: { data: ChartData[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Diagram Expire Obat</CardTitle>
        <CardDescription>
          Menampilkan total expire obat untuk setiap golongan.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={data}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="status"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value: keyof typeof chartConfig) =>
                chartConfig[value]?.label || value
              }
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="count" fill="var(--color-count)" radius={8}>
              <LabelList
                position="top"
                offset={12}
                className="fill-foreground"
                fontSize={12}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
