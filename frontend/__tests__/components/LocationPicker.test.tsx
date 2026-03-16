import React from 'react';
import { render } from '@testing-library/react-native';
import { LocationPicker } from '../../src/components/LocationPicker';

describe('LocationPicker', () => {
  it('renders without crashing', () => {
    const onLocationChange = jest.fn();
    const { toJSON } = render(
      <LocationPicker onLocationChange={onLocationChange} />
    );
    expect(toJSON()).toBeTruthy();
  });

  it('renders with initial location', () => {
    const onLocationChange = jest.fn();
    const { toJSON } = render(
      <LocationPicker
        latitude={39.9042}
        longitude={116.4074}
        address="北京市朝阳区"
        onLocationChange={onLocationChange}
      />
    );
    expect(toJSON()).toBeTruthy();
  });

  it('renders location info', () => {
    const onLocationChange = jest.fn();
    const { toJSON } = render(
      <LocationPicker
        latitude={39.9042}
        longitude={116.4074}
        address="北京市朝阳区"
        onLocationChange={onLocationChange}
      />
    );
    const rendered = JSON.stringify(toJSON());
    expect(rendered).toContain('39.9042');
    expect(rendered).toContain('116.4074');
  });
});
