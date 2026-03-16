import React from 'react';
import { render } from '@testing-library/react-native';
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
  healthStatus: { vaccinated: true, dewormed: true, neutered: false },
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
  it('renders without crashing', () => {
    const { toJSON } = render(<AdoptionCard adoption={mockAdoption} />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders adoption info', () => {
    const { toJSON } = render(<AdoptionCard adoption={mockAdoption} />);
    const rendered = JSON.stringify(toJSON());
    expect(rendered).toContain('小白');
    expect(rendered).toContain('中华田园猫');
  });

  it('renders available status', () => {
    const { toJSON } = render(<AdoptionCard adoption={mockAdoption} />);
    const rendered = JSON.stringify(toJSON());
    expect(rendered).toContain('待领养');
  });

  it('renders adopted status', () => {
    const adoptedAdoption: Adoption = {
      ...mockAdoption,
      adoptionStatus: 'adopted',
    };
    const { toJSON } = render(<AdoptionCard adoption={adoptedAdoption} />);
    const rendered = JSON.stringify(toJSON());
    expect(rendered).toContain('已领养');
  });
});
