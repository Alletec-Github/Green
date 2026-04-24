import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Colors, Spacing, BorderRadius, Typography, Shadows, Layout} from '../theme';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';

interface ActionButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  icon?: string;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  icon,
  loading = false,
  disabled = false,
  style,
}) => {
  const buttonStyles = getButtonStyles(variant);
  const textStyles = getTextStyles(variant);

  return (
    <TouchableOpacity
      style={[
        styles.button,
        buttonStyles,
        (disabled || loading) && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}>
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' || variant === 'ghost' ? Colors.primary : Colors.textOnPrimary}
        />
      ) : (
        <>
          {icon && (
            <Icon
              name={icon}
              size={20}
              color={textStyles.color as string}
              style={styles.icon}
            />
          )}
          <Text style={[styles.text, textStyles]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

function getButtonStyles(variant: ButtonVariant): ViewStyle {
  switch (variant) {
    case 'primary':
      return {backgroundColor: Colors.primary, ...Shadows.button};
    case 'secondary':
      return {backgroundColor: Colors.secondary};
    case 'outline':
      return {backgroundColor: 'transparent', borderWidth: 1, borderColor: Colors.primary};
    case 'danger':
      return {backgroundColor: 'transparent', borderWidth: 1, borderColor: Colors.error};
    case 'ghost':
      return {backgroundColor: 'transparent'};
  }
}

function getTextStyles(variant: ButtonVariant): TextStyle {
  switch (variant) {
    case 'primary':
    case 'secondary':
      return {color: Colors.textOnPrimary};
    case 'outline':
    case 'ghost':
      return {color: Colors.primary};
    case 'danger':
      return {color: Colors.error};
  }
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: Layout.buttonHeight,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.xxl,
  },
  disabled: {
    opacity: 0.6,
  },
  icon: {
    marginRight: Spacing.sm,
  },
  text: {
    ...Typography.button,
  },
});

export default ActionButton;
