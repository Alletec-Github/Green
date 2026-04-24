import React from 'react';
import {View, Text, ActivityIndicator, StyleSheet, Modal} from 'react-native';
import {Colors, Typography, Spacing} from '../theme';

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible,
  message = 'Loading...',
}) => {
  if (!visible) {
    return null;
  }

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.message}>{message}</Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.xxxl,
    alignItems: 'center',
    minWidth: 160,
  },
  message: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: Spacing.lg,
  },
});

export default LoadingOverlay;
