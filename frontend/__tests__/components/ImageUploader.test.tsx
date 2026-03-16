import React from 'react';
import { render } from '@testing-library/react-native';
import { ImageUploader } from '../../src/components/ImageUploader';

describe('ImageUploader', () => {
  it('renders without crashing', () => {
    const onChange = jest.fn();
    const { toJSON } = render(
      <ImageUploader images={[]} onChange={onChange} />
    );
    expect(toJSON()).toBeTruthy();
  });

  it('renders with initial images', () => {
    const images = ['https://example.com/image1.jpg'];
    const onChange = jest.fn();
    const { toJSON } = render(
      <ImageUploader images={images} onChange={onChange} />
    );
    expect(toJSON()).toBeTruthy();
  });

  it('renders with multiple images', () => {
    const images = [
      'https://example.com/image1.jpg',
      'https://example.com/image2.jpg',
    ];
    const onChange = jest.fn();
    const { toJSON } = render(
      <ImageUploader images={images} onChange={onChange} />
    );
    expect(toJSON()).toBeTruthy();
  });
});
