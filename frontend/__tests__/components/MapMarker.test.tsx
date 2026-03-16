import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { MapMarker } from '../../src/components/MapMarker';

describe('MapMarker', () => {
  it('renders marker with correct emoji for cat', () => {
    const { getByText } = render(
      <MapMarker
        id={1}
        type="rescue"
        markerColor="red"
        animalType="cat"
        title="Test Marker"
      />
    );

    expect(getByText('🐱')).toBeTruthy();
  });

  it('renders marker with correct emoji for dog', () => {
    const { getByText } = render(
      <MapMarker
        id={1}
        type="rescue"
        markerColor="red"
        animalType="dog"
        title="Test Marker"
      />
    );

    expect(getByText('🐕')).toBeTruthy();
  });

  it('renders marker with default emoji for other animal type', () => {
    const { getByText } = render(
      <MapMarker
        id={1}
        type="rescue"
        markerColor="red"
        animalType="other"
        title="Test Marker"
      />
    );

    expect(getByText('🐾')).toBeTruthy();
  });

  it('renders marker with default emoji when no animal type', () => {
    const { getByText } = render(
      <MapMarker
        id={1}
        type="rescue"
        markerColor="green"
        title="Test Marker"
      />
    );

    expect(getByText('🐾')).toBeTruthy();
  });

  it('calls onPress with correct id when pressed', () => {
    const mockOnPress = jest.fn();

    const { getByText } = render(
      <MapMarker
        id={123}
        type="rescue"
        markerColor="red"
        animalType="cat"
        title="Test Marker"
        onPress={mockOnPress}
      />
    );

    fireEvent.press(getByText('🐱'));

    expect(mockOnPress).toHaveBeenCalledWith(123);
  });

  it('renders correctly for adoption type', () => {
    const { getByText } = render(
      <MapMarker
        id={1}
        type="adoption"
        markerColor="green"
        animalType="dog"
        title="Adoption Marker"
      />
    );

    expect(getByText('🐕')).toBeTruthy();
  });

  it('works without onPress callback', () => {
    const { getByText } = render(
      <MapMarker
        id={1}
        type="rescue"
        markerColor="red"
        animalType="cat"
        title="Test Marker"
      />
    );

    // Should not throw when pressed without onPress
    expect(() => fireEvent.press(getByText('🐱'))).not.toThrow();
  });
});
