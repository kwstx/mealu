import React, { useState } from 'react';
import { View, Text, StyleSheet, Button, ActivityIndicator, Alert } from 'react-native';
import WeeklyCalendar, { DayData } from '../components/WeeklyCalendar';

const dummyDays: DayData[] = Array.from({ length: 7 }).map((_, i) => ({
  id: `day-${i}`,
  date: new Date(Date.now() + i * 86400000),
  meals: [
    { id: `m-${i}-1`, type: 'breakfast', title: 'Oatmeal', calories: 300 },
    { id: `m-${i}-2`, type: 'lunch', title: 'Chicken Salad', calories: 450 },
    { id: `m-${i}-3`, type: 'dinner', title: 'Grilled Salmon', calories: 600 },
    { id: `m-${i}-4`, type: 'snack', title: 'Apple & Almonds', calories: 150 },
  ],
}));

export default function PlannerScreen() {
  const [loading, setLoading] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);

  const startPlanning = async () => {
    setLoading(true);
    try {
      // Serialize local profile
      const localProfile = {
        dietary_restrictions: ['vegetarian'],
        budget: 50,
      };

      const response = await fetch('http://localhost:3000/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(localProfile),
      });
      
      const data = await response.json();
      
      if (data.job_id) {
        setJobId(data.job_id);
        pollCompletion(data.job_id);
      } else {
        throw new Error('No job ID returned');
      }
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', 'Failed to start planning');
      console.error(error);
    }
  };

  const pollCompletion = async (id: string) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`http://localhost:3000/plans/${id}`);
        const statusData = await res.json();
        
        if (statusData.status === 'completed') {
          clearInterval(interval);
          setLoading(false);
          setJobId(null);
          Alert.alert('Success', 'Plan generated successfully!');
        } else if (statusData.status === 'failed') {
          clearInterval(interval);
          setLoading(false);
          setJobId(null);
          Alert.alert('Error', 'Plan generation failed');
        }
      } catch (e) {
        console.error('Polling error', e);
      }
    }, 2000);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Meal Planner</Text>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.loadingText}>Generating your plan...</Text>
          {jobId && <Text style={styles.jobText}>Job ID: {jobId}</Text>}
        </View>
      ) : (
        <>
          <Button title="Generate Plan" onPress={startPlanning} />
          <View style={styles.calendarWrapper}>
            <WeeklyCalendar days={dummyDays} />
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  jobText: {
    marginTop: 5,
    fontSize: 12,
    color: '#666',
  },
  calendarWrapper: {
    flex: 1,
    marginTop: 20,
    width: '100%',
  }
});
