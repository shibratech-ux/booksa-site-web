import { useEffect, useRef } from 'react';

const chartData = [
  { month: 'Jan', value: 120 },
  { month: 'Feb', value: 182 },
  { month: 'Mar', value: 151 },
  { month: 'Apr', value: 214 },
  { month: 'May', value: 276 },
  { month: 'Jun', value: 243 }
];

export function RevenueAmChart() {
  const chartRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let root: any;
    let disposed = false;

    async function init() {
      if (!chartRef.current) return;

      const am5 = await import('@amcharts/amcharts5');
      const am5xy = await import('@amcharts/amcharts5/xy');
      const am5themesAnimated = await import('@amcharts/amcharts5/themes/Animated');

      if (disposed || !chartRef.current) return;

      root = am5.Root.new(chartRef.current);
      root.setThemes([am5themesAnimated.default.new(root)]);

      const chart = root.container.children.push(
        am5xy.XYChart.new(root, {
          panX: false,
          panY: false,
          wheelX: 'none',
          wheelY: 'none',
          layout: root.verticalLayout
        })
      );

      const xAxis = chart.xAxes.push(
        am5xy.CategoryAxis.new(root, {
          categoryField: 'month',
          renderer: am5xy.AxisRendererX.new(root, {
            minGridDistance: 30,
            strokeOpacity: 0.2
          })
        })
      );

      const yAxis = chart.yAxes.push(
        am5xy.ValueAxis.new(root, {
          renderer: am5xy.AxisRendererY.new(root, {
            strokeOpacity: 0.2
          })
        })
      );

      const series = chart.series.push(
        am5xy.ColumnSeries.new(root, {
          name: 'Revenue',
          xAxis,
          yAxis,
          valueYField: 'value',
          categoryXField: 'month'
        })
      );

      series.columns.template.setAll({
        cornerRadiusTL: 14,
        cornerRadiusTR: 14,
        width: am5.percent(60),
        fill: am5.color(0x22d3ee),
        strokeOpacity: 0
      });

      xAxis.data.setAll(chartData);
      series.data.setAll(chartData);
    }

    init();

    return () => {
      disposed = true;
      root?.dispose();
    };
  }, []);

  return <div ref={chartRef} className="h-[320px] w-full" />;
}
