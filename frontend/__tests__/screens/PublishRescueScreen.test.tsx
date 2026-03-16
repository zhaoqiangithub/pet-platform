import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { PublishRescueScreen } from '../../src/screens/PublishRescueScreen';

// Mock hooks
jest.mock('../../src/hooks/useRescuePublish', () => ({
  useRescuePublish: () => ({
    publish: jest.fn().mockResolvedValue({
      id: 1,
      userId: 100,
      animalType: 'cat',
      healthStatus: 'healthy',
    }),
    loading: false,
    error: null,
  }),
}));

describe('PublishRescueScreen', () => {
  const navigation = {
    navigate: jest.fn(),
    goBack: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all form fields', () => {
    const { getByText, getByPlaceholderText } = render(
      <PublishRescueScreen navigation={navigation} />
    );

    // Should show animal type options
    expect(getByText('动物类型')).toBeTruthy();
    expect(getByText('猫')).toBeTruthy();
    expect(getByText('狗')).toBeTruthy();
    expect(getByText('其他')).toBeTruthy();

    // Should show health status options
    expect(getByText('健康状态')).toBeTruthy();
    expect(getByText('健康')).toBeTruthy();
    expect(getByText('受伤')).toBeTruthy();
    expect(getByText('生病')).toBeTruthy();

    // Should show location section
    expect(getByText('位置')).toBeTruthy();
    expect(getByText('自动获取当前位置')).toBeTruthy();

    // Should show image upload section
    expect(getByText('照片')).toBeTruthy();

    // Should show contact section
    expect(getByText('联系方式')).toBeTruthy();
    expect(getByPlaceholderText('手机号')).toBeTruthy();

    // Should show submit button
    expect(getByText('提交发布')).toBeTruthy();
  });

  it('validates animal type is required', async () => {
    const { getByText, getByPlaceholderText } = render(
      <PublishRescueScreen navigation={navigation} />
    );

    // Fill in other required fields
    const healthButton = getByText('健康');
    fireEvent.press(healthButton);

    const phoneInput = getByPlaceholderText('手机号');
    fireEvent.changeText(phoneInput, '13800138000');

    // Try to submit without animal type
    const submitButton = getByText('提交发布');
    fireEvent.press(submitButton);

    // Should show validation error
    await waitFor(() => {
      expect(getByText('请选择动物类型')).toBeTruthy();
    });
  });

  it('validates health status is required', async () => {
    const { getByText, getByPlaceholderText } = render(
      <PublishRescueScreen navigation={navigation} />
    );

    // Select animal type
    const animalButton = getByText('猫');
    fireEvent.press(animalButton);

    // Fill in phone
    const phoneInput = getByPlaceholderText('手机号');
    fireEvent.changeText(phoneInput, '13800138000');

    // Try to submit without health status
    const submitButton = getByText('提交发布');
    fireEvent.press(submitButton);

    // Should show validation error
    await waitFor(() => {
      expect(getByText('请选择健康状态')).toBeTruthy();
    });
  });

  it('validates contact is required', async () => {
    const { getByText } = render(
      <PublishRescueScreen navigation={navigation} />
    );

    // Select animal type and health status
    fireEvent.press(getByText('猫'));
    fireEvent.press(getByText('健康'));

    // Try to submit without contact
    const submitButton = getByText('提交发布');
    fireEvent.press(submitButton);

    // Should show validation error
    await waitFor(() => {
      expect(getByText('请填写联系方式')).toBeTruthy();
    });
  });

  it('shows optional fields section', () => {
    const { getByText } = render(
      <PublishRescueScreen navigation={navigation} />
    );

    // Should show optional section
    expect(getByText('选填信息')).toBeTruthy();
    expect(getByText('品种')).toBeTruthy();
    expect(getByText('年龄')).toBeTruthy();
    expect(getByText('描述')).toBeTruthy();
  });
});
