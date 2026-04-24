import React from 'react';
import {View, Text, StyleSheet, ViewStyle} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Colors, Spacing, BorderRadius, Typography, Shadows} from '../theme';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  iconColor?: string;
  accentColor?: string;
  trend?: {value: number; isPositive: boolean};
  style?: ViewStyle;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  iconColor = Colors.primary,
  accentColor = Colors.primary,
  trend,
  style,
}) => {
  return (
    <View style={[styles.card, {borderLeftColor: accentColor}, style]}>
      <Icon name={icon} size={24} color={iconColor} />
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.title}>{title}</Text>
      {trend && (
        <View style={styles.trendContainer}>
          <Icon
            name={trend.isPositive ? 'trending-up' : 'trending-down'}
            size={14}
            color={trend.isPositive ? Colors.success : Colors.error}
          />
          <Text
            style={[
              styles.trendText,
              {color: trend.isPositive ? Colors.success : Colors.error},
            ]}>
            {trend.value}%
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderLeftWidth: 4,
    ...Shadows.card,
  },
  value: {
    ...Typography.h2,
    marginTop: Spacing.sm,
  },
  title: {
    ...Typography.caption,
    marginTop: Spacing.xs,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
    gap: 4,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default StatCard;
