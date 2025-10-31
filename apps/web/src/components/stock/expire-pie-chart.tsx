import { LabelList, Pie, PieChart } from "recharts";

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

export const description = "A pie chart with a label list";

interface ChartData {
  status: string;
  count: number;
  fill: string;
}

const chartConfig = {
  count: {
    label: "Jumlah Obat Exp.",
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

export function ExpirePieChart({ data }: { data: ChartData[] }) {
  const total = data.reduce((sum, item) => sum + item.count, 0);
  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Diagram Persentase Expire</CardTitle>
        <CardDescription>Menampilkan persentase expire obat.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="[&_.recharts-pie-label-text]:fill-foreground mx-auto aspect-square max-h-[400px] pb-0"
        >
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <Pie
              data={data}
              dataKey="count"
              nameKey="status"
              label={(props: any) => {
                const p = props?.percent
                  ? Math.round(props.percent * 100)
                  : total
                    ? Math.round((props.value / total) * 100)
                    : 0;
                return `${p}%`;
              }}
            />
            <ChartLegend
              content={<ChartLegendContent nameKey="status" />}
              className="-translate-y-2 flex-wrap gap-2 *:basis-1/4 *:justify-center"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
