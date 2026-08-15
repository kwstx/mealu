import React, { useMemo, useCallback } from 'react';
import { View, StyleSheet, FlatList, Dimensions, ListRenderItem } from 'react-native';
import MealCard, { Meal } from './MealCard';
import { AppText as Text } from './AppText';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface DayData {
  id: string;
  date: Date;
  meals: Meal[];
}

interface WeeklyCalendarProps {
  days: DayData[];
}

const DayColumn = React.memo(({ day }: { day: DayData }) => {
  return (
    <View style={[styles.dayColumn, { width: SCREEN_WIDTH }]}>
      <Text style={styles.dateHeader}>
        {day.date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
      </Text>
      <View style={styles.mealsContainer}>
        {day.meals.map(meal => (
          <MealCard key={meal.id} meal={meal} />
        ))}
      </View>
    </View>
  );
});

export default function WeeklyCalendar({ days }: WeeklyCalendarProps) {
  const renderItem: ListRenderItem<DayData> = useCallback(({ item }) => {
    return <DayColumn day={item} />;
  }, []);

  return (
    <FlatList
      data={days}
      keyExtractor={item => item.id}
      renderItem={renderItem}
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      removeClippedSubviews={true}
      // Tune memory usage so that only ~3 day columns stay mounted
      windowSize={3}
      initialNumToRender={3}
      maxToRenderPerBatch={1}
      getItemLayout={(data, index) => ({
        length: SCREEN_WIDTH,
        offset: SCREEN_WIDTH * index,
        index,
      })}
    />
  );
}

const styles = StyleSheet.create({
  dayColumn: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  dateHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#333',
  },
  mealsContainer: {
    flex: 1,
  }
});
