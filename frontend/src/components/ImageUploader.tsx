import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { THEME_COLORS } from '../constants/colors';

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  minCount?: number;
  maxCount?: number;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  images,
  onChange,
  minCount = 1,
  maxCount = 9,
}) => {
  const pickImage = async () => {
    if (images.length >= maxCount) {
      Alert.alert('提示', `最多上传${maxCount}张图片`);
      return;
    }

    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('权限不足', '需要访问相册权限才能上传图片');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      onChange([...images, result.assets[0].uri]);
    }
  };

  const takePhoto = async () => {
    if (images.length >= maxCount) {
      Alert.alert('提示', `最多上传${maxCount}张图片`);
      return;
    }

    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('权限不足', '需要访问相机权限才能拍照');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      onChange([...images, result.assets[0].uri]);
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    onChange(newImages);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>照片</Text>
        <Text style={styles.count}>
          {images.length}/{maxCount}
        </Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.imageList}>
          {images.map((uri, index) => (
            <View key={index} style={styles.imageWrapper}>
              <Image source={{ uri }} style={styles.image} />
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeImage(index)}
              >
                <Text style={styles.removeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}

          {images.length < maxCount && (
            <View style={styles.addButtons}>
              <TouchableOpacity style={styles.addButton} onPress={pickImage}>
                <Text style={styles.addButtonIcon}>🖼️</Text>
                <Text style={styles.addButtonText}>相册</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.addButton} onPress={takePhoto}>
                <Text style={styles.addButtonIcon}>📷</Text>
                <Text style={styles.addButtonText}>拍照</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {images.length < minCount && (
        <Text style={styles.hint}>请至少上传{minCount}张图片</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  count: {
    fontSize: 12,
    color: '#6B7280',
  },
  imageList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  imageWrapper: {
    position: 'relative',
    marginRight: 8,
    marginBottom: 8,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  addButtons: {
    flexDirection: 'row',
  },
  addButton: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  addButtonIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  addButtonText: {
    fontSize: 12,
    color: '#6B7280',
  },
  hint: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
});
