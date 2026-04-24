import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, ViewStyle} from 'react-native';
import {Colors, Spacing, Typography} from '../theme';

interface SectionHeaderProps {
  title: string;
  actionText?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  actionText,
  onAction,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>{title}</Text>
      {actionText && onAction && (
        <TouchableOpacity onPress={onAction} activeOpacity={0.7}>
          <Text style={styles.actionText}>{actionText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    ...Typography.h3,
  },
  actionText: {
    ...Typography.buttonSmall,
    color: Colors.primary,
  },
});

export default SectionHeader;
