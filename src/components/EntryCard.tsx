import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, ViewStyle} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Colors, Spacing, BorderRadius, Typography, Shadows} from '../theme';

interface EntryCardProps {
  documentNo: string;
  postingDate: string;
  description: string;
  accountNo: string;
  category: string;
  totalEmission: number;
  status: 'submitted' | 'draft' | 'failed';
  onPress: () => void;
  style?: ViewStyle;
}

const EntryCard: React.FC<EntryCardProps> = ({
  documentNo,
  postingDate,
  description,
  accountNo,
  category,
  totalEmission,
  status,
  onPress,
  style,
}) => {
  const statusConfig = {
    submitted: {bg: Colors.successLight, text: Colors.success, label: 'Submitted'},
    draft: {bg: Colors.warningLight, text: Colors.warning, label: 'Draft'},
    failed: {bg: Colors.errorLight, text: Colors.error, label: 'Failed'},
  };

  const {bg, text, label} = statusConfig[status];

  return (
    <TouchableOpacity
      style={[styles.card, style]}
      onPress={onPress}
      activeOpacity={0.7}>
      <View style={styles.header}>
        <View>
          <Text style={styles.docNo}>{documentNo}</Text>
          <Text style={styles.date}>{postingDate}</Text>
        </View>
        <View style={styles.emissionContainer}>
          <Text style={styles.emissionValue}>{totalEmission.toFixed(2)}</Text>
          <Text style={styles.emissionUnit}>tCO₂e</Text>
        </View>
      </View>
      <Text style={styles.description} numberOfLines={1}>
        {description || 'No description'}
      </Text>
      <View style={styles.footer}>
        <Text style={styles.account}>{accountNo} — {category}</Text>
        <View style={[styles.badge, {backgroundColor: bg}]}>
          <Text style={[styles.badgeText, {color: text}]}>{label}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadows.card,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  docNo: {
    ...Typography.h4,
  },
  date: {
    ...Typography.caption,
    marginTop: 2,
  },
  emissionContainer: {
    alignItems: 'flex-end',
  },
  emissionValue: {
    ...Typography.h4,
    color: Colors.primary,
  },
  emissionUnit: {
    ...Typography.caption,
  },
  description: {
    ...Typography.bodySmall,
    marginBottom: Spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  account: {
    ...Typography.caption,
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  badgeText: {
    ...Typography.caption,
    fontWeight: '600',
  },
});

export default EntryCard;
