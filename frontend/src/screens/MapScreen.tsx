import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { useMapPoints, useHeatmap } from '../hooks/useMapPoints';
import { MapMarker } from '../components/MapMarker';
import { MARKER_COLORS } from '../constants/colors';
import type { MapPoint } from '../types/rescue';

const { width, height } = Dimensions.get('window');

// 模拟地图组件（实际项目中应使用 react-native-maps）
const MockMapView: React.FC<{
  points: MapPoint[];
  onMarkerPress: (id: number, type: string) => void;
}> = ({ points, onMarkerPress }) => (
  <View style={styles.mapContainer}>
    <Text style={styles.mapPlaceholder}>🗺️ 地图区域</Text>
    <Text style={styles.mapSubPlaceholder}>
      共 {points.length} 个信息点
    </Text>
    {/* 实际项目中这里应该使用 MapView 组件 */}
  </View>
);

interface MapScreenProps {
  navigation?: any;
}

export const MapScreen: React.FC<MapScreenProps> = ({ navigation }) => {
  const [radius, setRadius] = useState(5);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<'rescue' | 'adoption' | 'all'>('all');

  // 默认位置（北京市中心）
  const [userLat, setUserLat] = useState(39.9042);
  const [userLng, setUserLng] = useState(116.4074);

  const { points, loading, refresh } = useMapPoints(
    userLat,
    userLng,
    radius,
    selectedTypes === 'all' ? 'rescue,adoption' : selectedTypes
  );

  const { heatmapPoints } = useHeatmap(userLat, userLng, radius);

  const handleMarkerPress = useCallback((id: number, type: string) => {
    if (type === 'rescue') {
      navigation?.navigate('RescueDetail', { id });
    } else {
      navigation?.navigate('AdoptionDetail', { id });
    }
  }, [navigation]);

  const handleRadiusChange = (newRadius: number) => {
    setRadius(newRadius);
  };

  const handleTypeChange = (type: 'rescue' | 'adoption' | 'all') => {
    setSelectedTypes(type);
  };

  const toggleHeatmap = () => {
    setShowHeatmap(!showHeatmap);
  };

  return (
    <View style={styles.container}>
      {/* 地图区域 */}
      <View style={styles.mapWrapper}>
        <MockMapView
          points={showHeatmap ? [] : points}
          onMarkerPress={handleMarkerPress}
        />

        {/* 加载状态 */}
        {loading && (
          <View style={styles.loadingOverlay}>
            <Text style={styles.loadingText}>加载中...</Text>
          </View>
        )}
      </View>

      {/* 筛选控制栏 */}
      <View style={styles.controlBar}>
        {/* 类型筛选 */}
        <View style={styles.typeFilter}>
          <TouchableOpacity
            style={[
              styles.typeButton,
              selectedTypes === 'all' && styles.typeButtonActive,
            ]}
            onPress={() => handleTypeChange('all')}
          >
            <Text
              style={[
                styles.typeButtonText,
                selectedTypes === 'all' && styles.typeButtonTextActive,
              ]}
            >
              全部
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.typeButton,
              selectedTypes === 'rescue' && styles.typeButtonActive,
            ]}
            onPress={() => handleTypeChange('rescue')}
          >
            <Text
              style={[
                styles.typeButtonText,
                selectedTypes === 'rescue' && styles.typeButtonTextActive,
              ]}
            >
              救助
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.typeButton,
              selectedTypes === 'adoption' && styles.typeButtonActive,
            ]}
            onPress={() => handleTypeChange('adoption')}
          >
            <Text
              style={[
                styles.typeButtonText,
                selectedTypes === 'adoption' && styles.typeButtonTextTextActive,
              ]}
            >
              领养
            </Text>
          </TouchableOpacity>
        </View>

        {/* 半径筛选 */}
        <View style={styles.radiusFilter}>
          {[1, 5, 10].map((r) => (
            <TouchableOpacity
              key={r}
              style={[
                styles.radiusButton,
                radius === r && styles.radiusButtonActive,
              ]}
              onPress={() => handleRadiusChange(r)}
            >
              <Text
                style={[
                  styles.radiusButtonText,
                  radius === r && styles.radiusButtonTextActive,
                ]}
              >
                {r}km
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 热力图切换 */}
        <TouchableOpacity
          style={[
            styles.heatmapButton,
            showHeatmap && styles.heatmapButtonActive,
          ]}
          onPress={toggleHeatmap}
        >
          <Text style={styles.heatmapButtonText}>
            {showHeatmap ? '🏠 标记' : '🔥 热力'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 图例 */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: MARKER_COLORS.red }]} />
          <Text style={styles.legendText}>紧急救助</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: MARKER_COLORS.yellow }]} />
          <Text style={styles.legendText}>需要救助</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: MARKER_COLORS.green }]} />
          <Text style={styles.legendText}>待领养</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: MARKER_COLORS.blue }]} />
          <Text style={styles.legendText}>已完成</Text>
        </View>
      </View>

      {/* 发布按钮 */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation?.navigate('PublishSelect')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  mapWrapper: {
    flex: 1,
    position: 'relative',
  },
  mapContainer: {
    flex: 1,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPlaceholder: {
    fontSize: 24,
    color: '#6B7280',
  },
  mapSubPlaceholder: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
  },
  controlBar: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  typeFilter: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  typeButtonActive: {
    backgroundColor: '#FF6B6B',
  },
  typeButtonText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  typeButtonTextActive: {
    color: '#fff',
  },
  typeButtonTextTextActive: {
    color: '#fff',
  },
  radiusFilter: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  radiusButton: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  radiusButtonActive: {
    backgroundColor: '#3B82F6',
  },
  radiusButtonText: {
    fontSize: 12,
    color: '#6B7280',
  },
  radiusButtonTextActive: {
    color: '#fff',
  },
  heatmapButton: {
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  heatmapButtonActive: {
    backgroundColor: '#10B981',
  },
  heatmapButtonText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  legend: {
    position: 'absolute',
    bottom: 100,
    left: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: '#6B7280',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  fabText: {
    fontSize: 32,
    color: '#fff',
    lineHeight: 36,
  },
});
