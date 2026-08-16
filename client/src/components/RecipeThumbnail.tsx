import React from 'react';
import { PixelRatio, StyleSheet, View, StyleProp, ImageStyle, Image, Platform } from 'react-native';

const FastImage = Platform.OS === 'web' ? null : require('react-native-fast-image').default;

interface RecipeThumbnailProps {
  url: string;
  width: number;
  height: number;
  style?: StyleProp<ImageStyle>;
  resizeMode?: any;
}

export const RecipeThumbnail: React.FC<RecipeThumbnailProps> = ({
  url,
  width,
  height,
  style,
  resizeMode,
}) => {
  const pixelDensity = PixelRatio.get();
  const exactWidth = Math.round(width * pixelDensity);
  const exactHeight = Math.round(height * pixelDensity);
  const separator = url.includes('?') ? '&' : '?';
  const optimizedUrl = `${url}${separator}w=${exactWidth}&h=${exactHeight}&dpr=${pixelDensity}`;

  const resolvedResizeMode = resizeMode || (Platform.OS === 'web' ? 'cover' : FastImage.resizeMode.cover);

  return (
    <View style={[{ width, height, overflow: 'hidden' }, style]}>
      {Platform.OS === 'web' ? (
        <Image
          style={[StyleSheet.absoluteFill]}
          source={{ uri: optimizedUrl }}
          resizeMode={resolvedResizeMode as any}
        />
      ) : (
        <FastImage
          style={[StyleSheet.absoluteFill]}
          source={{ uri: optimizedUrl, cache: FastImage.cacheControl.immutable }}
          resizeMode={resolvedResizeMode}
        />
      )}
    </View>
  );
};
