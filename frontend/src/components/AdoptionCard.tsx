import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { STATUS_COLORS, THEME_COLORS } from '../constants/colors';
import type { Adoption, AdoptionStatus } from '../types/rescue';

interface AdoptionCardProps {
  adoption: Adoption;
  onPress?: (id: number) => void;
}

const STATUS_LABELS: Record<AdoptionStatus, string> = {
  available: '待领养',
  pending: '待审核',
  adopted: '已领养',
  closed: '已结束',
};

const AGE_LABELS: Record<string, string> = {
  young: '幼年',
  adult: '成年',
  senior: '老年',
};

const GENDER_LABELS: Record<string, string> = {
  male: '弟弟',
  female: '妹妹',
};

export const AdoptionCard: React.FC<AdoptionCardProps> = ({ adoption, onPress }) => {
  const statusColor = STATUS_COLORS[adoption.adoptionStatus] || '#6B7280';

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress?.(adoption.id)}
      activeOpacity={0.8}
    >
      {/* 图片区域 */}
      <View style={styles.imageContainer}>
        {adoption.images && adoption.images.length > 0 ? (
          <Image
            source={{ uri: adoption.images[0] }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderEmoji}>🐾</Text>
          </View>
        )}
        <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
          <Text style={styles.statusText}>
            {STATUS_LABELS[adoption.adoptionStatus]}
          </Text>
        </View>
      </View>

      {/* 内容区域 */}
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>
            {adoption.name || adoption.breed}
          </Text>
          <Text style={styles.time}>
            {new Date(adoption.createTime).toLocaleDateString()}
          </Text>
        </View>

        <View style={styles.tags}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{adoption.breed}</Text>
          </View>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{AGE_LABELS[adoption.age]}</Text>
          </View>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{GENDER_LABELS[adoption.gender]}</Text>
          </View>
        </View>

        {adoption.personality && (
          <Text style={styles.personality} numberOfLines={2}>
            {adoption.personality}
          </Text>
        )}

        {/* 健康状况标签 */}
        {adoption.healthStatus && (
          <View style={styles.healthTags}>
            {adoption.healthStatus.vaccinated && (
              <View style={[styles.healthTag, styles.healthTagGreen]}>
                <Text style={styles.healthTagText}>已疫苗</Text>
              </View>
            )}
            {adoption.healthStatus.dewormed && (
              <View style={[styles.healthTag, styles.healthTagGreen]}>
                <Text style={styles.healthTagText}>已驱虫</Text>
              </View>
            )}
            {adoption.healthStatus.neutered && (
              <View style={[styles.healthTag, styles.healthTagGreen]}>
                <Text style={styles.healthTagText}>已绝育</Text>
              </View>
            )}
          </View>
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
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  time: {
    fontSize: 12,
    color: '#6B7280',
  },
  tags: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  tag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 6,
  },
  tagText: {
    fontSize: 12,
    color: '#4B5563',
  },
  personality: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
    marginBottom: 8,
  },
  healthTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  healthTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 6,
    marginTop: 4,
  },
  healthTagGreen: {
    backgroundColor: '#D1FAE5',
  },
  healthTagText: {
    fontSize: 11,
    color: '#059669',
  },
});
