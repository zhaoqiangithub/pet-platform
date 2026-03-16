import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useRescuePublish } from '../hooks/useRescuePublish';
import { ImageUploader } from '../components/ImageUploader';
import { LocationPicker } from '../components/LocationPicker';
import { THEME_COLORS } from '../constants/colors';
import type { AnimalType, RescueHealthStatus } from '../types/rescue';

interface PublishRescueScreenProps {
  navigation?: any;
}

const ANIMAL_TYPES: { value: AnimalType; label: string; emoji: string }[] = [
  { value: 'cat', label: '猫', emoji: '🐱' },
  { value: 'dog', label: '狗', emoji: '🐕' },
  { value: 'other', label: '其他', emoji: '🐾' },
];

const HEALTH_STATUSES: { value: RescueHealthStatus; label: string; emoji: string }[] = [
  { value: 'healthy', label: '健康', emoji: '💚' },
  { value: 'injured', label: '受伤', emoji: '🤕' },
  { value: 'sick', label: '生病', emoji: '🤒' },
];

export const PublishRescueScreen: React.FC<PublishRescueScreenProps> = ({
  navigation,
}) => {
  const { publish, loading } = useRescuePublish();

  const [animalType, setAnimalType] = useState<AnimalType | null>(null);
  const [healthStatus, setHealthStatus] = useState<RescueHealthStatus | null>(null);
  const [locationLat, setLocationLat] = useState<number | undefined>();
  const [locationLng, setLocationLng] = useState<number | undefined>();
  const [address, setAddress] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [breed, setBreed] = useState<string>('');
  const [age, setAge] = useState<string>('');
  const [contactPhone, setContactPhone] = useState<string>('');
  const [contactWechat, setContactWechat] = useState<string>('');
  const [images, setImages] = useState<string[]>([]);

  const handleLocationChange = (lat: number, lng: number, addr?: string) => {
    setLocationLat(lat);
    setLocationLng(lng);
    setAddress(addr || '');
  };

  const handleSubmit = async () => {
    // 验证必填字段
    if (!animalType) {
      Alert.alert('提示', '请选择动物类型');
      return;
    }
    if (!healthStatus) {
      Alert.alert('提示', '请选择健康状态');
      return;
    }
    if (!locationLat || !locationLng) {
      Alert.alert('提示', '请获取位置信息');
      return;
    }
    if (!contactPhone) {
      Alert.alert('提示', '请填写联系方式');
      return;
    }
    if (images.length === 0) {
      Alert.alert('提示', '请至少上传一张照片');
      return;
    }

    try {
      await publish({
        animalType,
        healthStatus,
        locationLat,
        locationLng,
        address,
        description,
        breed,
        age,
        contactPhone,
        contactWechat,
        images,
      });
      Alert.alert('成功', '发布成功，请等待审核', [
        { text: '确定', onPress: () => navigation?.goBack() },
      ]);
    } catch (error) {
      Alert.alert('发布失败', '请稍后重试');
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.form}>
        {/* 动物类型 */}
        <View style={styles.field}>
          <Text style={styles.required}>* </Text>
          <Text style={styles.label}>动物类型</Text>
        </View>
        <View style={styles.optionGroup}>
          {ANIMAL_TYPES.map((item) => (
            <TouchableOpacity
              key={item.value}
              style={[
                styles.optionButton,
                animalType === item.value && styles.optionButtonActive,
              ]}
              onPress={() => setAnimalType(item.value)}
            >
              <Text style={styles.optionEmoji}>{item.emoji}</Text>
              <Text
                style={[
                  styles.optionText,
                  animalType === item.value && styles.optionTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 健康状态 */}
        <View style={styles.field}>
          <Text style={styles.required}>* </Text>
          <Text style={styles.label}>健康状态</Text>
        </View>
        <View style={styles.optionGroup}>
          {HEALTH_STATUSES.map((item) => (
            <TouchableOpacity
              key={item.value}
              style={[
                styles.optionButton,
                healthStatus === item.value && styles.optionButtonActive,
              ]}
              onPress={() => setHealthStatus(item.value)}
            >
              <Text style={styles.optionEmoji}>{item.emoji}</Text>
              <Text
                style={[
                  styles.optionText,
                  healthStatus === item.value && styles.optionTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 位置 */}
        <LocationPicker
          latitude={locationLat}
          longitude={locationLng}
          address={address}
          onLocationChange={handleLocationChange}
        />

        {/* 照片上传 */}
        <ImageUploader images={images} onChange={setImages} minCount={1} maxCount={9} />

        {/* 联系方式 */}
        <View style={styles.field}>
          <Text style={styles.required}>* </Text>
          <Text style={styles.label}>联系方式</Text>
        </View>
        <TextInput
          style={styles.input}
          placeholder="手机号"
          value={contactPhone}
          onChangeText={setContactPhone}
          keyboardType="phone-pad"
        />
        <TextInput
          style={styles.input}
          placeholder="微信号（选填）"
          value={contactWechat}
          onChangeText={setContactWechat}
        />

        {/* 选填信息 */}
        <View style={styles.optionalSection}>
          <Text style={styles.optionalTitle}>选填信息</Text>

          <View style={styles.field}>
            <Text style={styles.label}>品种</Text>
          </View>
          <TextInput
            style={styles.input}
            placeholder="如：中华田园猫、泰迪"
            value={breed}
            onChangeText={setBreed}
          />

          <View style={styles.field}>
            <Text style={styles.label}>年龄</Text>
          </View>
          <TextInput
            style={styles.input}
            placeholder="如：3个月、2岁"
            value={age}
            onChangeText={setAge}
          />

          <View style={styles.field}>
            <Text style={styles.label}>描述</Text>
          </View>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="描述动物的情况和需要什么帮助"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />
        </View>

        {/* 提交按钮 */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? '提交中...' : '提交发布'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  form: {
    padding: 16,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  required: {
    color: '#EF4444',
    fontSize: 14,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  optionGroup: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  optionButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionButtonActive: {
    borderColor: '#FF6B6B',
    backgroundColor: '#FFF5F5',
  },
  optionEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  optionText: {
    fontSize: 13,
    color: '#6B7280',
  },
  optionTextActive: {
    color: '#FF6B6B',
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  optionalSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  optionalTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
