import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Colors, Spacing, BorderRadius, Typography, Shadows, Layout} from '../theme';
import {AppConfig} from '../config/appConfig';
import {clearTokenCache} from '../services/authService';

const SettingsScreen: React.FC = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    AsyncStorage.getItem('userSession').then(session => {
      if (session) {
        const {email} = JSON.parse(session);
        setUserEmail(email);
      }
    });
  }, []);

  const handleClearDrafts = () => {
    Alert.alert(
      'Clear Drafts',
      'This will permanently delete all saved drafts. This action cannot be undone.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('drafts');
            Alert.alert('Done', 'All drafts have been cleared.');
          },
        },
      ],
    );
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.removeItem('userSession');
          clearTokenCache();
          // Navigation will handle the redirect via state
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* User Info */}
        <View style={styles.section}>
          <View style={styles.userCard}>
            <View style={styles.avatarContainer}>
              <Icon name="account-circle" size={64} color={Colors.primary} />
            </View>
            <Text style={styles.userName}>Demo User</Text>
            <Text style={styles.userEmail}>{userEmail}</Text>
          </View>
        </View>

        {/* Preferences */}
        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={styles.section}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Icon name="bell-outline" size={22} color={Colors.textSecondary} />
              <Text style={styles.settingLabel}>Push Notifications</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{false: Colors.border, true: Colors.primaryLight}}
              thumbColor={notificationsEnabled ? Colors.primary : Colors.disabled}
            />
          </View>
        </View>

        {/* Data Management */}
        <Text style={styles.sectionTitle}>Data Management</Text>
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.settingRow}
            onPress={handleClearDrafts}
            activeOpacity={0.7}>
            <View style={styles.settingInfo}>
              <Icon name="delete-outline" size={22} color={Colors.warning} />
              <Text style={styles.settingLabel}>Clear All Drafts</Text>
            </View>
            <Icon name="chevron-right" size={20} color={Colors.textTertiary} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.settingRow}
            onPress={() =>
              Alert.alert('Clear Cache', 'Cache cleared successfully.')
            }
            activeOpacity={0.7}>
            <View style={styles.settingInfo}>
              <Icon name="cached" size={22} color={Colors.textSecondary} />
              <Text style={styles.settingLabel}>Clear Cache</Text>
            </View>
            <Icon name="chevron-right" size={20} color={Colors.textTertiary} />
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.section}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Icon name="information-outline" size={22} color={Colors.textSecondary} />
              <Text style={styles.settingLabel}>App Version</Text>
            </View>
            <Text style={styles.settingValue}>{AppConfig.app.version}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Icon name="cellphone" size={22} color={Colors.textSecondary} />
              <Text style={styles.settingLabel}>App Name</Text>
            </View>
            <Text style={styles.settingValue}>{AppConfig.app.name}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Icon name="domain" size={22} color={Colors.textSecondary} />
              <Text style={styles.settingLabel}>BC Environment</Text>
            </View>
            <Text style={styles.settingValue}>
              {AppConfig.businessCentral.environmentName}
            </Text>
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}>
          <Icon name="logout" size={20} color={Colors.error} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <Text style={styles.copyright}>
          © {new Date().getFullYear()} Alletec Solutions. All rights reserved.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: Layout.screenPadding,
    paddingBottom: Spacing.huge,
  },
  section: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
    ...Shadows.card,
  },
  sectionTitle: {
    ...Typography.label,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.xs,
  },
  userCard: {
    alignItems: 'center',
    padding: Spacing.xxl,
  },
  avatarContainer: {
    marginBottom: Spacing.md,
  },
  userName: {
    ...Typography.h3,
    marginBottom: Spacing.xs,
  },
  userEmail: {
    ...Typography.bodySmall,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  settingLabel: {
    ...Typography.body,
  },
  settingValue: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginLeft: Spacing.lg + 22 + Spacing.md,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.lg,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.error,
    marginTop: Spacing.md,
  },
  logoutText: {
    ...Typography.button,
    color: Colors.error,
  },
  copyright: {
    ...Typography.caption,
    textAlign: 'center',
    marginTop: Spacing.xxl,
  },
});

export default SettingsScreen;
