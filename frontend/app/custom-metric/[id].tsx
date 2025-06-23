// CustomMetricDetail.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Alert,
  useWindowDimensions,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Chip } from 'react-native-paper';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import Constants from 'expo-constants';
import { useAuth } from '@/context/AuthContext';
import { SkiaLineChart } from '@/components/SkiaLineChart';

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
  const { userToken } = useAuth();
  const [timeframe, setTimeframe] = useState<'1W' | '1M' | '3M' | '6M' | '1Y' | 'All'>('1W');
  const [dataPoints, setDataPoints] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

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

  const end = new Date();
  const map = new Map(dataPoints.map(dp => [dp.date.split('T')[0], dp.metric_value]));
  const binnedSeries: { date: string; value: number }[] = [];

  const sumForRange = (start: Date, end: Date) => {
    let sum = 0;
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const key = d.toISOString().split('T')[0];
      sum += map.get(key) || 0;
    }
    return sum;
  };

  if (timeframe === '1W') {
    for (let i = 6; i >= 0; i--) {
      const d = new Date(end);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      binnedSeries.push({ date: key, value: map.get(key) || 0 });
    }
  } else if (timeframe === '1M') {
    for (let i = 0; i < 4; i++) {
      const start = new Date(end);
      start.setDate(end.getDate() - (28 - i * 7));
      const weekEnd = new Date(start);
      weekEnd.setDate(start.getDate() + 6);
      binnedSeries.push({ date: weekEnd.toISOString().split('T')[0], value: sumForRange(start, weekEnd) });
    }
  } else if (timeframe === '3M') {
    for (let i = 0; i < 13; i++) {
      const start = new Date(end);
      start.setDate(end.getDate() - (91 - i * 7));
      const weekEnd = new Date(start);
      weekEnd.setDate(start.getDate() + 6);
      binnedSeries.push({ date: weekEnd.toISOString().split('T')[0], value: sumForRange(start, weekEnd) });
    }
  } else if (timeframe === '6M' || timeframe === '1Y') {
    const months = timeframe === '6M' ? 6 : 12;
    for (let i = months - 1; i >= 0; i--) {
      const month = new Date(end.getFullYear(), end.getMonth() - i, 1);
      const nextMonth = new Date(month.getFullYear(), month.getMonth() + 1, 1);
      const lastDay = new Date(nextMonth.getTime() - 1);
      binnedSeries.push({ date: lastDay.toISOString().split('T')[0], value: sumForRange(month, lastDay) });
    }
  } else if (timeframe === 'All') {
    if (dataPoints.length > 0) {
      const firstDate = new Date(dataPoints[0].date);
      let month = new Date(firstDate.getFullYear(), firstDate.getMonth(), 1);
      while (month <= end) {
        const nextMonth = new Date(month.getFullYear(), month.getMonth() + 1, 1);
        const lastDay = new Date(nextMonth.getTime() - 1);
        binnedSeries.push({ date: lastDay.toISOString().split('T')[0], value: sumForRange(month, lastDay) });
        month = nextMonth;
      }
    }
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">{name}</ThemedText>
      </ThemedView>

      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 20 }} />
      ) : (
        <SkiaLineChart dateSeries={binnedSeries} height={260} />
      )}

      <ThemedView style={styles.chipScrollView}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={true}
          contentContainerStyle={styles.chipContainer}
          style={styles.chipScrollView}
        >
          {Object.keys(timeframes).map(label => (
            <Chip
              key={label}
              selected={label === timeframe}
              onPress={() => {
                setTimeframe(label as typeof timeframe);
              }}
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
    marginTop: 32,
  },
  chipContainer: {
    paddingVertical: 4,
  },
  chip: {
    marginRight: 8,
    height: 32,
    borderRadius: 16,
  },
  chipScrollView: {
    maxHeight: 40,
  },
});
