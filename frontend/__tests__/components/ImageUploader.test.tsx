import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ImageUploader } from '../../src/components/ImageUploader';
import * as ImagePicker from 'expo-image-picker';

// Mock expo-image-picker
jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(),
  requestCameraPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
  MediaTypeOptions: {
    Images: 'Images',
  },
}));

describe('ImageUploader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with initial images', () => {
    const images = ['https://example.com/image1.jpg'];
    const onChange = jest.fn();

    const { getByText } = render(
      <ImageUploader images={images} onChange={onChange} />
    );

    expect(getByText('1/9')).toBeTruthy();
  });

  it('displays add buttons when under max count', () => {
    const images: string[] = [];
    const onChange = jest.fn();

    const { getByText } = render(
      <ImageUploader images={images} onChange={onChange} />
    );

    expect(getByText('相册')).toBeTruthy();
    expect(getByText('拍照')).toBeTruthy();
  });

  it('hides add buttons when at max count', () => {
    const images = Array(9).fill('https://example.com/image.jpg');
    const onChange = jest.fn();

    const { queryByText } = render(
      <ImageUploader images={images} onChange={onChange} maxCount={9} />
    );

    expect(queryByText('相册')).toBeNull();
    expect(queryByText('拍照')).toBeNull();
  });

  it('calls onChange when removing an image', () => {
    const images = ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'];
    const onChange = jest.fn();

    const { getByText } = render(
      <ImageUploader images={images} onChange={onChange} />
    );

    // Find and press the remove button (there's one for each image)
    const removeButtons = document?.querySelectorAll('[style*="backgroundColor"]');
    // The remove button has a specific position, let's use getAllByText instead
    const removeButton = getByText('✕');

    fireEvent.press(removeButton);

    expect(onChange).toHaveBeenCalled();
  });

  it('shows hint when below min count', () => {
    const images: string[] = [];
    const onChange = jest.fn();

    const { getByText } = render(
      <ImageUploader images={images} onChange={onChange} minCount={1} />
    );

    expect(getByText('请至少上传1张图片')).toBeTruthy();
  });

  it('picks image from library when permission granted', async () => {
    const images: string[] = [];
    const onChange = jest.fn();

    (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
      granted: true,
    });
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'https://example.com/new-image.jpg' }],
    });

    const { getByText } = render(
      <ImageUploader images={images} onChange={onChange} />
    );

    await fireEvent.press(getByText('相册'));

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith(['https://example.com/new-image.jpg']);
    });
  });

  it('takes photo when permission granted', async () => {
    const images: string[] = [];
    const onChange = jest.fn();

    (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({
      granted: true,
    });
    (ImagePicker.launchCameraAsync as jest.Mock).mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'https://example.com/photo.jpg' }],
    });

    const { getByText } = render(
      <ImageUploader images={images} onChange={onChange} />
    );

    await fireEvent.press(getByText('拍照'));

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith(['https://example.com/photo.jpg']);
    });
  });

  it('respects custom maxCount', () => {
    const images = Array(3).fill('https://example.com/image.jpg');
    const onChange = jest.fn();

    const { getByText } = render(
      <ImageUploader images={images} onChange={onChange} maxCount={3} />
    );

    expect(getByText('3/3')).toBeTruthy();
    expect(getByText('相册')).toBeNull();
  });
});
