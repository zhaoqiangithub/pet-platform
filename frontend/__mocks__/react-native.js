const React = require('react');

const View = ({ children, style, testID, ...props }) =>
  React.createElement('div', { style, testID, ...props }, children);

const Text = ({ children, style, numberOfLines, ...props }) =>
  React.createElement('span', { style, ...props }, children);

const Image = ({ source, style, resizeMode, ...props }) =>
  React.createElement('img', { src: source?.uri, style, ...props });

const TouchableOpacity = ({ children, onPress, style, activeOpacity, disabled, testID, ...props }) =>
  React.createElement(
    'button',
    {
      onClick: disabled ? undefined : onPress,
      style,
      disabled,
      'data-testid': testID,
      ...props
    },
    children
  );

const TextInput = ({ placeholder, value, onChangeText, multiline, numberOfLines, style, ...props }) =>
  React.createElement('textarea', {
    placeholder,
    value,
    onChange: (e) => onChangeText?.(e.target.value),
    multiline,
    rows: numberOfLines,
    style,
    ...props
  });

const ActivityIndicator = ({ color, size, ...props }) =>
  React.createElement('div', { className: 'activity-indicator', ...props }, 'Loading...');

const ScrollView = ({ children, horizontal, showsHorizontalScrollIndicator, style, ...props }) =>
  React.createElement(
    'div',
    {
      style: {
        overflowX: horizontal ? 'auto' : 'visible',
        ...style
      },
      ...props
    },
    children
  );

const Alert = {
  alert: jest.fn(),
};

const Platform = {
  OS: 'web',
  select: (obj) => obj.web || obj.default,
};

const StyleSheet = {
  create: (styles) => styles,
  flatten: (style) => style,
};

const Dimensions = {
  get: () => ({ width: 375, height: 812 }),
};

const useWindowDimensions = () => Dimensions.get();

module.exports = {
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
  Alert,
  Platform,
  StyleSheet,
  Dimensions,
  useWindowDimensions,
};
