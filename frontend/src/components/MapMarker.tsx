import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MARKER_COLORS, ANIMAL_TYPE_COLORS } from '../constants/colors';
import type { MarkerColor, AnimalType } from '../types/rescue';

interface MapMarkerProps {
  id: number;
  type: 'rescue' | 'adoption';
  markerColor: MarkerColor;
  animalType?: AnimalType;
  title: string;
  onPress?: (id: number) => void;
}

export const MapMarker: React.FC<MapMarkerProps> = ({
  id,
  type,
  markerColor,
  animalType,
  title,
  onPress,
}) => {
  const color = MARKER_COLORS[markerColor] || MARKER_COLORS.gray;
  const animalEmoji = animalType === 'cat' ? '🐱' : animalType === 'dog' ? '🐕' : '🐾';

  const handlePress = () => {
    onPress?.(id);
  };

  return (
    <TouchableOpacity
      style={[styles.marker, { backgroundColor: color }]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <Text style={styles.emoji}>{animalEmoji}</Text>
      <View style={styles.markerTail} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  marker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  emoji: {
    fontSize: 16,
  },
  markerTail: {
    position: 'absolute',
    bottom: -6,
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#fff',
  },
});
