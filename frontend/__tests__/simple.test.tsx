import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { View, Text } from 'react-native';

// 简单的测试组件
const TestComponent = () => (
  <View>
    <Text>Hello World</Text>
  </View>
);

describe('基础测试', () => {
  it('renders correctly', () => {
    render(<TestComponent />);
    expect(screen.getByText('Hello World')).toBeTruthy();
  });

  it('passes simple test', () => {
    expect(1 + 1).toBe(2);
  });
});
