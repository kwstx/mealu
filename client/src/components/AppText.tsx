import React from 'react';
import { Text, TextProps, PixelRatio } from 'react-native';

export function AppText(props: TextProps) {
  // Use platform font-scale multiplier for custom logic if needed, 
  // but allowFontScaling=true automatically respects PixelRatio.getFontScale()
  // We cap maxFontSizeMultiplier so layouts remain readable when the user has enlarged system fonts.
  return (
    <Text
      {...props}
      allowFontScaling={true}
      maxFontSizeMultiplier={2} // Ensures it remains readable without breaking layouts entirely
    />
  );
}
