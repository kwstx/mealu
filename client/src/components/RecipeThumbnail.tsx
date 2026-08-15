import React from 'react';
import { PixelRatio, StyleSheet, View, StyleProp, ImageStyle } from 'react-native';
import FastImage, { ResizeMode } from 'react-native-fast-image';

interface RecipeThumbnailProps {
  url: string;
  width: number;
  height: number;
  style?: StyleProp<ImageStyle>;
  resizeMode?: ResizeMode;
}

/**
 * Image assets for recipe thumbnails are loaded through react-native-fast-image 
 * with disk and memory caching; all images are requested at the exact pixel density 
 * of the device to avoid runtime scaling.
 */
export const RecipeThumbnail: React.FC<RecipeThumbnailProps> = ({
  url,
  width,
  height,
  style,
  resizeMode = FastImage.resizeMode.cover,
}) => {
  // Get the device's exact pixel density
  const pixelDensity = PixelRatio.get();
  
  // Calculate the exact physical pixels needed to prevent runtime upscaling/downscaling
  const exactWidth = Math.round(width * pixelDensity);
  const exactHeight = Math.round(height * pixelDensity);
  
  // Append exact pixel dimensions and density to the image URL.
  // This assumes your image CDN (e.g. Cloudinary, Imgix, Cloudflare) supports these parameters.
  // Adjust the query parameters if your backend uses a different format (like /w_300/ in the path).
  const separator = url.includes('?') ? '&' : '?';
  const optimizedUrl = `${url}${separator}w=${exactWidth}&h=${exactHeight}&dpr=${pixelDensity}`;

  return (
    <View style={[{ width, height, overflow: 'hidden' }, style]}>
      <FastImage
        style={[StyleSheet.absoluteFill]}
        source={{
          uri: optimizedUrl,
          // FastImage.cacheControl.immutable caches the image aggressively
          // on both memory and disk, updating only if the URL changes.
          cache: FastImage.cacheControl.immutable,
        }}
        resizeMode={resizeMode}
      />
    </View>
  );
};
