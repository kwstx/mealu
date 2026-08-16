import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, NativeSyntheticEvent, NativeScrollEvent, FlatList } from 'react-native';

export function WheelPicker({
  data,
  selectedValue,
  onValueChange,
  itemHeight = 44,
}: {
  data: { label: string; value: string | number }[];
  selectedValue: string | number;
  onValueChange: (value: string | number) => void;
  itemHeight?: number;
}) {
  const flatListRef = useRef<FlatList>(null);
  
  // Find initial index
  const getIndex = () => Math.max(0, data.findIndex(d => d.value === selectedValue));
  const [activeIndex, setActiveIndex] = useState(getIndex());

  // Add empty items for padding so the first/last item can be centered
  const paddedData = [
    { label: '', value: 'pad-start-1' },
    { label: '', value: 'pad-start-2' },
    ...data,
    { label: '', value: 'pad-end-1' },
    { label: '', value: 'pad-end-2' },
  ];

  // Sync state if selectedValue changes externally
  useEffect(() => {
    const idx = getIndex();
    if (idx !== activeIndex) {
      setActiveIndex(idx);
      // Timeout needed to ensure layout is ready
      setTimeout(() => {
        flatListRef.current?.scrollToOffset({ offset: idx * itemHeight, animated: true });
      }, 100);
    }
  }, [selectedValue, data.length]);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    const index = Math.round(y / itemHeight);
    if (index >= 0 && index < data.length) {
      setActiveIndex(index);
    }
  };

  const handleScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    const index = Math.round(y / itemHeight);
    if (index >= 0 && index < data.length) {
      setActiveIndex(index);
      onValueChange(data[index].value);
    }
  };

  return (
    <View style={{ height: itemHeight * 5, width: '100%', position: 'relative' }}>
      <View 
        style={[styles.highlight, { height: itemHeight, top: itemHeight * 2 }]} 
        pointerEvents="none" 
      />
      <FlatList
        ref={flatListRef}
        data={paddedData}
        keyExtractor={item => String(item.value)}
        showsVerticalScrollIndicator={false}
        snapToInterval={itemHeight}
        decelerationRate="fast"
        extraData={activeIndex}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onMomentumScrollEnd={handleScrollEnd}
        onScrollEndDrag={handleScrollEnd}
        getItemLayout={(_, index) => ({ length: itemHeight, offset: itemHeight * index, index })}
        initialScrollIndex={activeIndex}
        renderItem={({ item, index }) => {
          const isSelected = index === activeIndex + 2; // +2 for padding offset
          return (
            <View style={{ height: itemHeight, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={[styles.itemText, isSelected && styles.itemTextSelected]}>
                {item.label}
              </Text>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  highlight: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.04)',
    borderRadius: 8,
    zIndex: 0,
  },
  itemText: {
    fontSize: 20,
    fontFamily: 'Inter_400Regular',
    color: '#B0B0B0', // Faded text matching image
  },
  itemTextSelected: {
    fontSize: 22,
    fontFamily: 'Inter_500Medium',
    color: '#000',
  },
});
