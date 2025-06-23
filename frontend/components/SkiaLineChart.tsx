import React, { useMemo, useState } from 'react';
import { useWindowDimensions, View, GestureResponderEvent, Text as RNText } from 'react-native';
import {
  Canvas,
  Circle,
  Path,
  Rect,
  Skia,
  Text,
  TileMode,
  useFont,
  vec,
} from '@shopify/react-native-skia';

export type SkiaLineChartProps = {
  dateSeries: { date: string; value: number }[];
  height: number;
};

export function SkiaLineChart({ dateSeries, height }: SkiaLineChartProps) {
  const { width } = useWindowDimensions();
  const padding = 32;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const font = useFont(require('../assets/fonts/SpaceMono-Regular.ttf'), 12);
  const fontReady = font && font.getSize() > 0;
  const [tooltip, setTooltip] = useState<{ x: number; y: number; value: number } | null>(null);
  //c

  const values = dateSeries.map(p => p.value);
  const max = Math.max(...values)+2;
  const min = Math.min(...values);
  const range = max - min || 1;

  const points = useMemo(() => {
    if (dateSeries.length < 2) return [];
    return dateSeries.map((pt, i) => {
      const x = (chartWidth / (dateSeries.length - 1)) * i + padding;
      const y = chartHeight - ((pt.value - min) / range) * chartHeight + padding;
      return { x, y, value: pt.value };
    });
  }, [dateSeries, chartWidth, chartHeight]);

  const invalidPoints = points.some(p => !isFinite(p.x) || !isFinite(p.y));

  const linePath = useMemo(() => {
    const p = Skia.Path.Make();
    points.forEach((pt, i) => {
      if (i === 0) p.moveTo(pt.x, pt.y);
      else p.lineTo(pt.x, pt.y);
    });
    return p;
  }, [points]);

  const fillPath = useMemo(() => {
    const p = Skia.Path.Make();
    if (points.length === 0) return p;
    p.moveTo(points[0].x, chartHeight + padding);
    points.forEach(pt => p.lineTo(pt.x, pt.y));
    p.lineTo(points[points.length - 1].x, chartHeight + padding);
    p.close();
    return p;
  }, [points, chartHeight]);

  const paint = useMemo(() => {
    const shader = Skia.Shader.MakeLinearGradient(
      vec(padding, padding),
      vec(padding, chartHeight + padding),
      [Skia.Color('#007AFF33'), Skia.Color('#007AFF00')],
      null,
      TileMode.Clamp
    );
    const p = Skia.Paint();
    p.setShader(shader);
    return p;
  }, [chartHeight, padding]);

  const handleTouch = (event: GestureResponderEvent) => {
    const x = event?.nativeEvent?.locationX;
    if (typeof x !== 'number' || points.length === 0) return;

    const closest = points.reduce((prev, curr) =>
      Math.abs(curr.x - x) < Math.abs(prev.x - x) ? curr : prev
    );
    if (!isFinite(closest.x) || !isFinite(closest.y)) return;

    setTooltip(closest);
  };

  const gridLines = 5;
  const gridSpacing = chartHeight / (gridLines - 1);

  const startDate = new Date(dateSeries[0]?.date);
  const midDate = new Date(dateSeries[Math.floor(dateSeries.length / 2)]?.date);
  const endDate = new Date(dateSeries[dateSeries.length - 1]?.date);

  const formatDate = (d: Date) => d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  const xLabels = [formatDate(startDate), formatDate(midDate), formatDate(endDate)];

  if (!fontReady || points.length === 0 || invalidPoints) {
    console.warn('[SkiaLineChart] Cannot render: font not ready or invalid points');
    return (
      <View style={{ height, justifyContent: 'center', alignItems: 'center' }}>
        <RNText style={{ color: 'gray' }}>Chart loading or unavailable</RNText>
      </View>
    );
  }

  return (
    <View
      onTouchStart={handleTouch}
      onTouchMove={handleTouch}
      onTouchEnd={() => setTooltip(null)}
    >
      <Canvas style={{ width, height }}>
        {/* Horizontal grid lines and y-axis values */}
        {Array.from({ length: gridLines }).map((_, i) => {
          const y = i * gridSpacing + padding;
          const labelVal = max - (range / (gridLines - 1)) * i;
          return (
            <React.Fragment key={i}>
              <Path
                path={Skia.Path.Make().moveTo(padding/2, y).lineTo(width - padding, y)}
                color={Skia.Color('#DDD')}
                style="stroke"
                strokeWidth={1}
              />
              <Text
                x={padding/2 -16}
                y={y}
                text={labelVal.toFixed(0)}
                font={font}
                
                color={Skia.Color('#888')}
              />
            </React.Fragment>
          );
        })}

        <Path path={fillPath} paint={paint} />

        <Path path={linePath} color={Skia.Color('#007AFF')} style="stroke" strokeWidth={2} />

        {points.map((pt, i) => (
          <Circle key={i} cx={pt.x} cy={pt.y} r={1} color={Skia.Color('#007AFF')} />
        ))}

        {tooltip && isFinite(tooltip.x) && isFinite(tooltip.y) && (
          <>
            <Circle cx={tooltip.x} cy={tooltip.y} r={4} color={Skia.Color('#007AFF')} />
            <Rect
              x={tooltip.x - 30}
              y={tooltip.y - 50}
              width={60}
              height={30}
              color={Skia.Color('rgba(0,0,0,0.7)')}
            />
            <Text
              x={tooltip.x}
              y={tooltip.y - 30}
              text={`${tooltip.value}`}
              color={Skia.Color('white')}
              font={font}
            />
          </>
        )}

        {/* X-axis date labels */}
        <>
          <Text
            x={points[0].x-(padding)+5}
            y={height - 8}
            text={xLabels[0]}
            font={font}
            color={Skia.Color('#444')}
          />
          <Text
            x={points[Math.floor(points.length / 2)].x-25}
            y={height - 8}
            text={xLabels[1]}
            font={font}
            color={Skia.Color('#444')}
          />
          <Text
            x={points[points.length - 1].x-45}
            y={height - 8}
            text={xLabels[2]}
            font={font}
            color={Skia.Color('#444')}
          />
        </>
      </Canvas>
    </View>
  );
}
