import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert, useWindowDimensions } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SegmentedButtons } from 'react-native-paper';
import { ThemedText } from '@/components/ThemedText';
import { ThemedLineChart } from '@/components/ThemedLineChart';
import { ThemedView } from '@/components/ThemedView';
import Constants from 'expo-constants';
import { useAuth } from '@/context/AuthContext';
import { Menu, Button } from 'react-native-paper';
import { Chip } from 'react-native-paper';
import { ScrollView } from 'react-native';

import { LineChartProps } from 'react-native-chart-kit/dist/line-chart/LineChart';
import Svg, { Rect, Text as TextSVG } from 'react-native-svg';

const backendBaseUrl = Constants.expoConfig?.extra?.BACKEND_BASE_URL ?? 'http://0.0.0.0:8080';

const timeframes = {
  '1W': 7,
  '1M': 30,
  '3M': 90,
  '6M': 180,
  '1Y': 365,
  'All': null,
};

export default function CustomMetricDetail() {
  const { id, name } = useLocalSearchParams();
  const { width } = useWindowDimensions();
  const { userToken } = useAuth();
  const [timeframe, setTimeframe] = useState<'1W' | '1M' | '3M' | '6M' | '1Y' | 'All'>('1W');
  const [dataPoints, setDataPoints] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [visible, setVisible] = useState(false);
  const [selected, setSelected] = useState<'1W' | '1M' | '3M' | '6M' | '1Y' | 'All'>('1W');

  const getStartDate = (label: keyof typeof timeframes) => {
    if (label === 'All') return '2000-01-01';
    const days = timeframes[label]!;
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().split('T')[0];
  };

  const fetchDataPoints = async () => {
    if (!userToken) return;

    const start = getStartDate(timeframe);
    const end = new Date().toISOString().split('T')[0];

    setLoading(true);
    try {
      const url = `${backendBaseUrl}/api/data_points/${id}?start=${start}&end=${end}`;
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
        },
      });

      const data = await res.json();
      setDataPoints(data);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to load data points');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDataPoints();
  }, [timeframe]);

  const total = dataPoints.length;
  const third = Math.floor(total / 3);

  const chartData = {
    labels: [
              new Date(dataPoints[0]?.date).toLocaleDateString(),                         // start
              new Date(dataPoints[third]?.date).toLocaleDateString(),                    // middle
              new Date(dataPoints[total - 1]?.date).toLocaleDateString(),               // end
            ],
    datasets: [{ data: dataPoints.map(dp => dp.metric_value) }],
  };

  

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.titleContainer}>
              <ThemedText type="title">{name}</ThemedText>
      </ThemedView>

      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 20 }} />
      ) : (
       <ThemedLineChart data={chartData} width={width-32} height={260} />
      )}

      <ThemedView style={styles.chipScrollView}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={true}
          contentContainerStyle={styles.chipContainer}
          style={styles.chipScrollView} // limit height here
        >
          {['1W', '1M', '3M', '6M', '1Y', 'All'].map((label) => (
            <Chip
              key={label}
              selected={label === selected}
              onPress={() => {
                setTimeframe(label as '1M' | '3M' | '6M' | '1Y' | 'All')
                setSelected(label as '1M' | '3M' | '6M' | '1Y' | 'All')
              }
              }
              style={styles.chip}
            >
              {label}
            </Chip>
          ))}
        </ScrollView>
      </ThemedView>

      
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 40,
    padding: 16,
    flex: 1,
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  segmentedContainer: {
    gap: 8,
    marginBottom: 12,
    
  },
  chipContainer: {
    paddingVertical: 4,
  },
  chip: {
    marginRight: 8,
    height: 32,
    borderRadius: 16,
  },
  chipContent: {
    height: 32,
    paddingHorizontal: 12,
  },
  chipScrollView: {
    maxHeight: 40, // or 36 if you want it even tighter
  },
});
