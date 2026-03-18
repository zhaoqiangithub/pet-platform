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
import { useAdoptionPublish } from '../hooks/useAdoptionPublish';
import { ImageUploader } from '../components/ImageUploader';
import { THEME_COLORS } from '../constants/colors';
import type { Age, Gender, Size, HealthStatus as HealthStatusType } from '../types/rescue';

interface PublishAdoptionScreenProps {
  navigation?: any;
}

const AGES: { value: Age; label: string }[] = [
  { value: 'young', label: '幼年' },
  { value: 'adult', label: '成年' },
  { value: 'senior', label: '老年' },
];

const GENDERS: { value: Gender; label: string }[] = [
  { value: 'male', label: '弟弟' },
  { value: 'female', label: '妹妹' },
];

const SIZES: { value: Size; label: string }[] = [
  { value: 'small', label: '小型' },
  { value: 'medium', label: '中型' },
  { value: 'large', label: '大型' },
];

export const PublishAdoptionScreen: React.FC<PublishAdoptionScreenProps> = ({
  navigation,
}) => {
  const { publish, loading } = useAdoptionPublish();

  const [name, setName] = useState<string>('');
  const [breed, setBreed] = useState<string>('');
  const [age, setAge] = useState<Age | null>(null);
  const [gender, setGender] = useState<Gender | null>(null);
  const [size, setSize] = useState<Size | null>(null);
  const [personality, setPersonality] = useState<string>('');
  const [requirements, setRequirements] = useState<string>('');
  const [story, setStory] = useState<string>('');
  const [contactPhone, setContactPhone] = useState<string>('');
  const [contactWechat, setContactWechat] = useState<string>('');
  const [images, setImages] = useState<string[]>([]);

  // 健康状况
  const [vaccinated, setVaccinated] = useState(false);
  const [dewormed, setDewormed] = useState(false);
  const [neutered, setNeutered] = useState(false);

  const handleSubmit = async () => {
    // 验证必填字段
    if (!breed) {
      Alert.alert('提示', '请填写品种');
      return;
    }
    if (!age) {
      Alert.alert('提示', '请选择年龄');
      return;
    }
    if (!gender) {
      Alert.alert('提示', '请选择性别');
      return;
    }
    if (!personality) {
      Alert.alert('提示', '请描述性格');
      return;
    }
    if (!requirements) {
      Alert.alert('提示', '请填写领养要求');
      return;
    }
    if (images.length === 0) {
      Alert.alert('提示', '请至少上传一张照片');
      return;
    }

    try {
      await publish({
        name,
        breed,
        age,
        gender,
        size: size || undefined,
        personality,
        healthStatus: {
          vaccinated,
          dewormed,
          neutered,
        },
        requirements,
        story,
        images,
        contactPhone,
        contactWechat,
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
        {/* 照片上传 */}
        <ImageUploader images={images} onChange={setImages} minCount={1} maxCount={9} />

        {/* 名字 */}
        <View style={styles.field}>
          <Text style={styles.label}>名字</Text>
        </View>
        <TextInput
          style={styles.input}
          placeholder="给它起个名字吧"
          value={name}
          onChangeText={setName}
        />

        {/* 品种 */}
        <View style={styles.field}>
          <Text style={styles.required}>* </Text>
          <Text style={styles.label}>品种</Text>
        </View>
        <TextInput
          style={styles.input}
          placeholder="如：中华田园猫、柯基、柴犬"
          value={breed}
          onChangeText={setBreed}
        />

        {/* 年龄 */}
        <View style={styles.field}>
          <Text style={styles.required}>* </Text>
          <Text style={styles.label}>年龄</Text>
        </View>
        <View style={styles.optionGroup}>
          {AGES.map((item) => (
            <TouchableOpacity
              key={item.value}
              style={[
                styles.optionButton,
                age === item.value && styles.optionButtonActive,
              ]}
              onPress={() => setAge(item.value)}
            >
              <Text
                style={[
                  styles.optionText,
                  age === item.value && styles.optionTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 性别 */}
        <View style={styles.field}>
          <Text style={styles.required}>* </Text>
          <Text style={styles.label}>性别</Text>
        </View>
        <View style={styles.optionGroup}>
          {GENDERS.map((item) => (
            <TouchableOpacity
              key={item.value}
              style={[
                styles.optionButton,
                gender === item.value && styles.optionButtonActive,
              ]}
              onPress={() => setGender(item.value)}
            >
              <Text
                style={[
                  styles.optionText,
                  gender === item.value && styles.optionTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 体型 */}
        <View style={styles.field}>
          <Text style={styles.label}>体型</Text>
        </View>
        <View style={styles.optionGroup}>
          {SIZES.map((item) => (
            <TouchableOpacity
              key={item.value}
              style={[
                styles.optionButton,
                size === item.value && styles.optionButtonActive,
              ]}
              onPress={() => setSize(item.value)}
            >
              <Text
                style={[
                  styles.optionText,
                  size === item.value && styles.optionTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 性格 */}
        <View style={styles.field}>
          <Text style={styles.required}>* </Text>
          <Text style={styles.label}>性格描述</Text>
        </View>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="描述它的性格特点，如：温顺、活泼、黏人"
          value={personality}
          onChangeText={setPersonality}
          multiline
          numberOfLines={3}
        />

        {/* 健康状况 */}
        <View style={styles.field}>
          <Text style={styles.label}>健康状况</Text>
        </View>
        <View style={styles.checkboxGroup}>
          <TouchableOpacity
            style={styles.checkbox}
            onPress={() => setVaccinated(!vaccinated)}
          >
            <View style={[styles.checkboxBox, vaccinated && styles.checkboxBoxChecked]}>
              {vaccinated && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkboxLabel}>已接种疫苗</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.checkbox}
            onPress={() => setDewormed(!dewormed)}
          >
            <View style={[styles.checkboxBox, dewormed && styles.checkboxBoxChecked]}>
              {dewormed && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkboxLabel}>已驱虫</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.checkbox}
            onPress={() => setNeutered(!neutered)}
          >
            <View style={[styles.checkboxBox, neutered && styles.checkboxBoxChecked]}>
              {neutered && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkboxLabel}>已绝育</Text>
          </TouchableOpacity>
        </View>

        {/* 领养要求 */}
        <View style={styles.field}>
          <Text style={styles.required}>* </Text>
          <Text style={styles.label}>领养要求</Text>
        </View>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="填写对领养人的要求，如：科学喂养、定期疫苗、签订协议"
          value={requirements}
          onChangeText={setRequirements}
          multiline
          numberOfLines={3}
        />

        {/* 救助故事 */}
        <View style={styles.field}>
          <Text style={styles.label}>救助故事</Text>
        </View>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="分享它的故事，让更多人了解"
          value={story}
          onChangeText={setStory}
          multiline
          numberOfLines={4}
        />

        {/* 联系方式 */}
        <View style={styles.field}>
          <Text style={styles.label}>联系方式</Text>
        </View>
        <TextInput
          style={styles.input}
          placeholder="手机号（选填）"
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
    minHeight: 80,
    textAlignVertical: 'top',
  },
  checkboxGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
    marginBottom: 8,
  },
  checkboxBox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxBoxChecked: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#4B5563',
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
