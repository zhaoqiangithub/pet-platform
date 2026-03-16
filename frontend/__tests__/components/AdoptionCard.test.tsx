import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { AdoptionCard } from '../../src/components/AdoptionCard';
import type { Adoption } from '../../src/types/rescue';

const mockAdoption: Adoption = {
  id: 1,
  userId: 100,
  name: '小白',
  animalType: 'cat',
  breed: '中华田园猫',
  age: 'adult',
  gender: 'male',
  size: 'small',
  personality: '活泼可爱，喜欢玩耍',
  healthStatus: {
    vaccinated: true,
    dewormed: true,
    neutered: false,
  },
  requirements: '有爱心，能负责它的生活',
  story: '救助的流浪猫',
  images: ['https://example.com/cat.jpg'],
  contactPhone: '13800138000',
  contactWechat: 'wx123456',
  adoptionStatus: 'available',
  reviewStatus: 'approved',
  createTime: '2024-01-15T10:00:00Z',
  updateTime: '2024-01-15T10:00:00Z',
};

describe('AdoptionCard', () => {
  it('renders adoption information correctly', () => {
    const { getByText } = render(<AdoptionCard adoption={mockAdoption} />);

    expect(getByText('小白')).toBeTruthy();
    expect(getByText('中华田园猫')).toBeTruthy();
    expect(getByText('活泼可爱，喜欢玩耍')).toBeTruthy();
  });

  it('displays available status badge', () => {
    const { getByText } = render(<AdoptionCard adoption={mockAdoption} />);

    expect(getByText('待领养')).toBeTruthy();
  });

  it('displays adopted status badge', () => {
    const adoptedAdoption: Adoption = {
      ...mockAdoption,
      adoptionStatus: 'adopted',
    };

    const { getByText } = render(<AdoptionCard adoption={adoptedAdoption} />);

    expect(getByText('已领养')).toBeTruthy();
  });

  it('calls onPress with correct id when pressed', () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(
      <AdoptionCard adoption={mockAdoption} onPress={mockOnPress} />
    );

    fireEvent.press(getByText('小白'));

    expect(mockOnPress).toHaveBeenCalledWith(1);
  });

  it('renders placeholder when no images', () => {
    const adoptionWithoutImage: Adoption = {
      ...mockAdoption,
      images: [],
    };

    const { getByText } = render(<AdoptionCard adoption={adoptionWithoutImage} />);

    expect(getByText('🐾')).toBeTruthy();
  });

  it('displays health status tags', () => {
    const { getByText } = render(<AdoptionCard adoption={mockAdoption} />);

    expect(getByText('已疫苗')).toBeTruthy();
    expect(getByText('已驱虫')).toBeTruthy();
  });

  it('displays breed when name is not provided', () => {
    const adoptionWithoutName: Adoption = {
      ...mockAdoption,
      name: undefined,
    };

    const { getByText } = render(<AdoptionCard adoption={adoptionWithoutName} />);

    expect(getByText('中华田园猫')).toBeTruthy();
  });

  it('displays gender tag correctly', () => {
    const femaleAdoption: Adoption = {
      ...mockAdoption,
      gender: 'female',
    };

    const { getByText } = render(<AdoptionCard adoption={femaleAdoption} />);

    expect(getByText('妹妹')).toBeTruthy();
  });
});
