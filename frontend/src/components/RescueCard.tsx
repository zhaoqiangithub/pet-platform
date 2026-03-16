import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { STATUS_COLORS, THEME_COLORS } from '../constants/colors';
import type { Rescue, RescueStatus, AnimalType } from '../types/rescue';

interface RescueCardProps {
  rescue: Rescue;
  onPress?: (id: number) => void;
}

const STATUS_LABELS: Record<RescueStatus, string> = {
  pending: '待救助',
  rescuing: '救助中',
  rescued: '已救助',
  medical: '送医中',
  adopted: '已领养',
  closed: '已结束',
};

const ANIMAL_TYPE_LABELS: Record<AnimalType, string> = {
  cat: '猫',
  dog: '狗',
  other: '其他',
};

export const RescueCard: React.FC<RescueCardProps> = ({ rescue, onPress }) => {
  const statusColor = STATUS_COLORS[rescue.rescueStatus] || '#6B7280';
  const animalLabel = ANIMAL_TYPE_LABELS[rescue.animalType] || '动物';

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress?.(rescue.id)}
      activeOpacity={0.8}
    >
      {/* 图片区域 */}
      <View style={styles.imageContainer}>
        {rescue.images && rescue.images.length > 0 ? (
          <Image
            source={{ uri: rescue.images[0] }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderEmoji}>
              {rescue.animalType === 'cat' ? '🐱' : rescue.animalType === 'dog' ? '🐕' : '🐾'}
            </Text>
          </View>
        )}
        <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
          <Text style={styles.statusText}>
            {STATUS_LABELS[rescue.rescueStatus]}
          </Text>
        </View>
      </View>

      {/* 内容区域 */}
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={1}>
            {animalLabel}
          </Text>
          <Text style={styles.time}>
            {new Date(rescue.createTime).toLocaleDateString()}
          </Text>
        </View>

        {rescue.address && (
          <View style={styles.locationRow}>
            <Text style={styles.locationIcon}>📍</Text>
            <Text style={styles.location} numberOfLines={1}>
              {rescue.address}
            </Text>
          </View>
        )}

        {rescue.description && (
          <Text style={styles.description} numberOfLines={2}>
            {rescue.description}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    height: 160,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderEmoji: {
    fontSize: 48,
  },
  statusBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  time: {
    fontSize: 12,
    color: '#6B7280',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  locationIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  location: {
    flex: 1,
    fontSize: 13,
    color: '#6B7280',
  },
  description: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
  },
});
