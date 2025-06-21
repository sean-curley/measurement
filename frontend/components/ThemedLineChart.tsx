import React from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import { TextInput as PaperTextInput, TextInputProps as PaperTextInputProps } from 'react-native-paper';
import { useThemeColor } from '@/hooks/useThemeColor';
import { LineChart } from 'react-native-chart-kit';
import Svg, { Rect, Text as TextSVG } from 'react-native-svg';
import { LineChartProps } from 'react-native-chart-kit/dist/line-chart/LineChart';
import { useEffect, useState } from 'react';

export type ThemedLineChartProps = LineChartProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default';
};

export function ThemedLineChart({
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedLineChartProps) {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0, visible: false, value: 0 });
  const { width } = useWindowDimensions();

  return (
    <LineChart
          
          onDataPointClick={(data) => {
            const same = tooltipPos.x === data.x && tooltipPos.y === data.y;
            setTooltipPos({
              x: data.x,
              y: same ? 0 : data.y, 
              visible: !same,
              value: same ? 0 : data.value,
            });
          }}
        
          decorator={() =>
            tooltipPos.visible ? (
              <Svg>
                <Rect
                  x={tooltipPos.x - 30}
                  y={tooltipPos.y + 10}
                  width="60"
                  height="30"
                  fill="rgba(0,0,0,0.7)"
                  rx="5"
                />
                <TextSVG
                  x={tooltipPos.x}
                  y={tooltipPos.y + 30}
                  fill="white"
                  fontSize="14"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {tooltipPos.value}
                </TextSVG>
              </Svg>
            ) : null
          }
          data={rest.data}
          width={rest.width} // subtract padding
          height={rest.height}
          withVerticalLines={false}
          chartConfig={{
            backgroundGradientFrom: '#fff',
            backgroundGradientTo: '#fff',
            
            decimalPlaces: 0,
            color: () => '#007AFF',
            labelColor: () => '#444',
            style: { borderRadius: 16 },
            propsForBackgroundLines: {
              stroke: '#cccccc', // custom line color
              strokeOpacity: 0.5, // adjust opacity
              strokeDasharray: '', // empty string makes it solid
            },
            propsForLabels: {
            fontSize: 12,
            fill: '#444',
            fontWeight: 'bold',
            textAnchor: 'start',
            opacity: 0.8,
          },
          }}
          bezier
          style={{ marginTop: 0 ,
                  marginLeft: 0, // shift left to align Y-axis tighter
                  paddingRight: 14,
                  
          }}
        />
  );
}

const styles = StyleSheet.create({
  default: {
    marginBottom: 16,
  },
});
