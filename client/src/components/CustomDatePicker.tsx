import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { WheelPicker } from './WheelPicker';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function CustomDatePicker({
  value,
  onChange,
}: {
  value: Date;
  onChange: (d: Date) => void;
}) {
  const currentYear = new Date().getFullYear();
  // Allow birth years from 100 years ago up to current year
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
  const months = MONTHS.map((m, i) => ({ label: m, value: i }));
  
  const [day, setDay] = useState(value.getDate());
  const [month, setMonth] = useState(value.getMonth());
  const [year, setYear] = useState(value.getFullYear());

  // Number of days in the selected month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => ({
    label: `${i + 1}.`,
    value: i + 1,
  }));

  // Auto-correct day if month changes to one with fewer days (e.g. 31st to Feb)
  useEffect(() => {
    let correctedDay = day;
    if (day > daysInMonth) {
      correctedDay = daysInMonth;
      setDay(correctedDay);
    }
    
    // Only fire onChange if something actually changed compared to the prop to avoid loops
    const newDate = new Date(year, month, correctedDay);
    if (newDate.getTime() !== value.getTime()) {
      onChange(newDate);
    }
  }, [day, month, year]);

  return (
    <View style={styles.container}>
      <View style={styles.wheel}>
        <WheelPicker 
          data={days} 
          selectedValue={day} 
          onValueChange={(v) => setDay(v as number)} 
        />
      </View>
      <View style={[styles.wheel, { flex: 1.5 }]}>
        <WheelPicker 
          data={months} 
          selectedValue={month} 
          onValueChange={(v) => setMonth(v as number)} 
        />
      </View>
      <View style={styles.wheel}>
        <WheelPicker 
          data={years.map(y => ({ label: String(y), value: y }))} 
          selectedValue={year} 
          onValueChange={(v) => setYear(v as number)} 
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    width: '100%',
    paddingHorizontal: 10,
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wheel: {
    flex: 1,
  }
});
