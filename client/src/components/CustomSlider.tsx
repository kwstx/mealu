import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, PanResponder, Text, LayoutChangeEvent } from 'react-native';

interface Props {
  value: number;
  min: number;
  max: number;
  onChange: (val: number) => void;
  symbol?: string;
}

export function CustomSlider({ value, min, max, onChange, symbol = '€' }: Props) {
  const [trackWidth, setTrackWidth] = useState(0);
  const trackWidthRef = useRef(0);
  const currentValRef = useRef(value);
  
  currentValRef.current = value;

  const getBoundedValue = (v: number) => Math.max(min, Math.min(max, v));

  const startValRef = useRef(value);

  const updateValueFromGesture = (dx: number, startVal: number) => {
    if (trackWidthRef.current === 0) return;
    const range = max - min;
    const valueDelta = (dx / trackWidthRef.current) * range;
    const newVal = Math.round(getBoundedValue(startVal + valueDelta));
    onChange(newVal);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        startValRef.current = currentValRef.current;
      },
      onPanResponderMove: (_, gestureState) => {
        updateValueFromGesture(gestureState.dx, startValRef.current);
      },
      onPanResponderRelease: () => {},
    })
  ).current;

  const handleLayout = (e: LayoutChangeEvent) => {
    setTrackWidth(e.nativeEvent.layout.width);
    trackWidthRef.current = e.nativeEvent.layout.width;
  };

  const percent = trackWidth ? (value - min) / (max - min) : 0;
  const thumbLeft = percent * trackWidth;

  return (
    <View style={styles.container}>
      <View style={styles.trackContainer} onLayout={handleLayout}>
        <View style={styles.trackBackground} />
        <View 
          style={[styles.thumb, { transform: [{ translateX: thumbLeft - 20 }] }]} 
          {...panResponder.panHandlers}
        >
          <View style={styles.thumbInner}>
            <Text style={styles.thumbText}>{symbol}</Text>
          </View>
        </View>
      </View>
      <Text style={styles.maxText}>{symbol}{max}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 50,
  },
  trackContainer: {
    flex: 1,
    height: 50,
    justifyContent: 'center',
    position: 'relative',
    marginRight: 16,
  },
  trackBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E5E5EA',
  },
  thumb: {
    position: 'absolute',
    left: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(234, 196, 53, 0.25)', // Faded yellow glow
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EAC435', // Solid yellow
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  maxText: {
    color: '#999',
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
  }
});
