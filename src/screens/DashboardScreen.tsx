import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Colors, Spacing, BorderRadius, Typography, Shadows, Layout} from '../theme';
import {getJournalEntries, getCategories} from '../services/bcService';
import {SustainabilityJournalEntry, SustainabilityCategory} from '../types';
import {useNavigation} from '@react-navigation/native';

const DashboardScreen: React.FC = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [entries, setEntries] = useState<SustainabilityJournalEntry[]>([]);
  const [categories, setCategories] = useState<SustainabilityCategory[]>([]);

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const [entriesData, categoriesData] = await Promise.all([
        getJournalEntries(),
        getCategories(),
      ]);
      setEntries(entriesData);
      setCategories(categoriesData);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to load dashboard data';
      setError(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const totalEntries = entries.length;
  const thisMonthEntries = entries.filter(e => {
    const entryDate = new Date(e.postingDate);
    const now = new Date();
    return (
      entryDate.getMonth() === now.getMonth() &&
      entryDate.getFullYear() === now.getFullYear()
    );
  }).length;
  const totalEmissions = entries.reduce(
    (sum, e) => sum + (e.emissionCO2 || 0) + (e.emissionCH4 || 0) + (e.emissionN2O || 0),
    0,
  );

  const scopeCounts = {
    'Scope 1': entries.filter(e => {
      const cat = categories.find(c => c.code === e.accountCategory);
      return cat?.emissionScope === 'Scope 1';
    }).length,
    'Scope 2': entries.filter(e => {
      const cat = categories.find(c => c.code === e.accountCategory);
      return cat?.emissionScope === 'Scope 2';
    }).length,
    'Scope 3': entries.filter(e => {
      const cat = categories.find(c => c.code === e.accountCategory);
      return cat?.emissionScope === 'Scope 3';
    }).length,
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.centered}>
        <Icon name="alert-circle-outline" size={48} color={Colors.error} />
        <Text style={styles.errorTitle}>Something went wrong</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadData}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
          />
        }>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>🌱 Green</Text>
          <Text style={styles.headerSubtitle}>Sustainability Dashboard</Text>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, {borderLeftColor: Colors.primary}]}>
            <Icon name="file-document-multiple" size={24} color={Colors.primary} />
            <Text style={styles.statValue}>{totalEntries}</Text>
            <Text style={styles.statLabel}>Total Entries</Text>
          </View>
          <View style={[styles.statCard, {borderLeftColor: Colors.info}]}>
            <Icon name="calendar-month" size={24} color={Colors.info} />
            <Text style={styles.statValue}>{thisMonthEntries}</Text>
            <Text style={styles.statLabel}>This Month</Text>
          </View>
          <View style={[styles.statCard, {borderLeftColor: Colors.warning}]}>
            <Icon name="molecule-co2" size={24} color={Colors.warning} />
            <Text style={styles.statValue}>{totalEmissions.toFixed(1)}</Text>
            <Text style={styles.statLabel}>Total Emissions</Text>
          </View>
          <View style={[styles.statCard, {borderLeftColor: Colors.success}]}>
            <Icon name="content-save-outline" size={24} color={Colors.success} />
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Drafts</Text>
          </View>
        </View>

        {/* Scope Cards */}
        <Text style={styles.sectionTitle}>Emission Scopes</Text>
        <TouchableOpacity
          style={[styles.scopeCard, {backgroundColor: Colors.scope1Light}]}
          activeOpacity={0.7}>
          <View style={styles.scopeHeader}>
            <View style={[styles.scopeIconBg, {backgroundColor: Colors.scope1}]}>
              <Icon name="fire" size={24} color={Colors.textInverse} />
            </View>
            <View style={styles.scopeInfo}>
              <Text style={styles.scopeTitle}>Scope 1</Text>
              <Text style={styles.scopeDescription}>Direct Emissions</Text>
            </View>
            <View style={styles.scopeCount}>
              <Text style={[styles.scopeCountText, {color: Colors.scope1}]}>
                {scopeCounts['Scope 1']}
              </Text>
              <Text style={styles.scopeCountLabel}>entries</Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.scopeCard, {backgroundColor: Colors.scope2Light}]}
          activeOpacity={0.7}>
          <View style={styles.scopeHeader}>
            <View style={[styles.scopeIconBg, {backgroundColor: Colors.scope2}]}>
              <Icon name="flash" size={24} color={Colors.textInverse} />
            </View>
            <View style={styles.scopeInfo}>
              <Text style={styles.scopeTitle}>Scope 2</Text>
              <Text style={styles.scopeDescription}>Indirect Emissions</Text>
            </View>
            <View style={styles.scopeCount}>
              <Text style={[styles.scopeCountText, {color: Colors.scope2}]}>
                {scopeCounts['Scope 2']}
              </Text>
              <Text style={styles.scopeCountLabel}>entries</Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.scopeCard, {backgroundColor: Colors.scope3Light}]}
          activeOpacity={0.7}>
          <View style={styles.scopeHeader}>
            <View style={[styles.scopeIconBg, {backgroundColor: Colors.scope3}]}>
              <Icon name="truck" size={24} color={Colors.textInverse} />
            </View>
            <View style={styles.scopeInfo}>
              <Text style={styles.scopeTitle}>Scope 3</Text>
              <Text style={styles.scopeDescription}>Value Chain Emissions</Text>
            </View>
            <View style={styles.scopeCount}>
              <Text style={[styles.scopeCountText, {color: Colors.scope3}]}>
                {scopeCounts['Scope 3']}
              </Text>
              <Text style={styles.scopeCountLabel}>entries</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickActionButton}
            activeOpacity={0.7}
            onPress={() => (navigation as any).navigate('UploadTab')}>
            <Icon name="cloud-upload" size={28} color={Colors.primary} />
            <Text style={styles.quickActionText}>Upload Bill</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickActionButton}
            activeOpacity={0.7}
            onPress={() => (navigation as any).navigate('ManualEntryTab')}>
            <Icon name="pencil-plus" size={28} color={Colors.primary} />
            <Text style={styles.quickActionText}>New Entry</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickActionButton}
            activeOpacity={0.7}
            onPress={() => (navigation as any).navigate('HistoryTab')}>
            <Icon name="history" size={28} color={Colors.primary} />
            <Text style={styles.quickActionText}>View History</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: Spacing.xxl,
  },
  loadingText: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
  },
  errorTitle: {
    ...Typography.h3,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  errorMessage: {
    ...Typography.bodySmall,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  retryText: {
    ...Typography.button,
    color: Colors.textOnPrimary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Layout.screenPadding,
    paddingBottom: Spacing.huge,
  },
  header: {
    marginBottom: Spacing.xxl,
  },
  greeting: {
    ...Typography.h1,
    color: Colors.primary,
  },
  headerSubtitle: {
    ...Typography.bodySmall,
    marginTop: Spacing.xs,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.xxl,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderLeftWidth: 4,
    ...Shadows.card,
  },
  statValue: {
    ...Typography.h2,
    marginTop: Spacing.sm,
  },
  statLabel: {
    ...Typography.caption,
    marginTop: Spacing.xs,
  },
  sectionTitle: {
    ...Typography.h3,
    marginBottom: Spacing.lg,
  },
  scopeCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  scopeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scopeIconBg: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scopeInfo: {
    flex: 1,
    marginLeft: Spacing.lg,
  },
  scopeTitle: {
    ...Typography.h4,
  },
  scopeDescription: {
    ...Typography.bodySmall,
    marginTop: 2,
  },
  scopeCount: {
    alignItems: 'center',
  },
  scopeCountText: {
    ...Typography.h2,
  },
  scopeCountLabel: {
    ...Typography.caption,
  },
  quickActions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    ...Shadows.card,
  },
  quickActionText: {
    ...Typography.bodySmall,
    color: Colors.primary,
    marginTop: Spacing.sm,
    fontWeight: '600',
  },
});

export default DashboardScreen;
