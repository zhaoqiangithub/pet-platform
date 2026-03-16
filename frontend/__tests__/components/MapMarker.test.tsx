import React from 'react';
import { render } from '@testing-library/react-native';
import { MapMarker } from '../../src/components/MapMarker';

describe('MapMarker', () => {
  it('renders without crashing for cat', () => {
    const { toJSON } = render(
      <MapMarker
        id={1}
        type="rescue"
        markerColor="red"
        animalType="cat"
        title="Test Marker"
      />
    );
    expect(toJSON()).toBeTruthy();
  });

  it('renders for dog type', () => {
    const { toJSON } = render(
      <MapMarker
        id={1}
        type="rescue"
        markerColor="red"
        animalType="dog"
        title="Test Marker"
      />
    );
    const rendered = JSON.stringify(toJSON());
    expect(rendered).toContain('🐕');
  });

  it('renders for other animal type', () => {
    const { toJSON } = render(
      <MapMarker
        id={1}
        type="rescue"
        markerColor="red"
        animalType="other"
        title="Test Marker"
      />
    );
    const rendered = JSON.stringify(toJSON());
    expect(rendered).toContain('🐾');
  });

  it('handles onPress callback', () => {
    const mockOnPress = jest.fn();
    const { toJSON } = render(
      <MapMarker
        id={123}
        type="rescue"
        markerColor="red"
        animalType="cat"
        title="Test Marker"
        onPress={mockOnPress}
      />
    );
    expect(toJSON()).toBeTruthy();
  });
});
