// 地图标记颜色常量

export const MARKER_COLORS = {
  red: '#EF4444',     // 紧急救助
  yellow: '#F59E0B',  // 需要救助
  green: '#10B981',   // 待领养
  blue: '#3B82F6',    // 已领养/已完成
  gray: '#6B7280',    // 已结束
} as const;

// 状态颜色
export const STATUS_COLORS = {
  // 救助状态
  rescuePending: '#F59E0B',
  rescuing: '#EF4444',
  rescued: '#3B82F6',
  medical: '#EF4444',
  rescueAdopted: '#10B981',
  closed: '#6B7280',

  // 领养状态
  available: '#10B981',
  adoptionPending: '#F59E0B',
  adopted: '#3B82F6',

  // 审核状态
  approved: '#10B981',
  rejected: '#EF4440',
} as const;

// 动物类型颜色
export const ANIMAL_TYPE_COLORS = {
  cat: '#F59E0B',
  dog: '#3B82F6',
  other: '#8B5CF6',
} as const;

// 通用主题色
export const THEME_COLORS = {
  primary: '#FF6B6B',
  secondary: '#4ECDC4',
  background: '#F9FAFB',
  surface: '#FFFFFF',
  text: '#111827',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  error: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
} as const;
