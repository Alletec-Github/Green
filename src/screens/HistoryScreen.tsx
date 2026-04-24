import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Colors, Spacing, BorderRadius, Typography, Shadows, Layout} from '../theme';
import {getJournalEntries, deleteJournalEntry} from '../services/bcService';
import {SustainabilityJournalEntry} from '../types';

const HistoryScreen: React.FC = () => {
  const [entries, setEntries] = useState<SustainabilityJournalEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<SustainabilityJournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<SustainabilityJournalEntry | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const data = await getJournalEntries({
        orderBy: 'postingDate desc',
      });
      setEntries(data);
      setFilteredEntries(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load entries';
      setError(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredEntries(entries);
    } else {
      const q = searchQuery.toLowerCase();
      setFilteredEntries(
        entries.filter(
          e =>
            e.description?.toLowerCase().includes(q) ||
            e.accountNo?.toLowerCase().includes(q) ||
            e.documentNo?.toLowerCase().includes(q),
        ),
      );
    }
  }, [searchQuery, entries]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const handleDelete = (entry: SustainabilityJournalEntry) => {
    Alert.alert(
      'Delete Entry',
      `Are you sure you want to delete entry "${entry.documentNo}"?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              if (entry.systemId) {
                await deleteJournalEntry(entry.systemId);
              }
              setEntries(prev =>
                prev.filter(e => e.systemId !== entry.systemId),
              );
              setShowDetail(false);
            } catch (err: unknown) {
              const message =
                err instanceof Error ? err.message : 'Delete failed';
              Alert.alert('Error', message);
            }
          },
        },
      ],
    );
  };

  const renderEntry = ({item}: {item: SustainabilityJournalEntry}) => {
    const totalEmission =
      (item.emissionCO2 || 0) + (item.emissionCH4 || 0) + (item.emissionN2O || 0);

    return (
      <TouchableOpacity
        style={styles.entryCard}
        onPress={() => {
          setSelectedEntry(item);
          setShowDetail(true);
        }}
        activeOpacity={0.7}>
        <View style={styles.entryHeader}>
          <View style={styles.entryInfo}>
            <Text style={styles.entryDocNo}>{item.documentNo}</Text>
            <Text style={styles.entryDate}>{item.postingDate}</Text>
          </View>
          <View style={styles.emissionBadge}>
            <Text style={styles.emissionValue}>{totalEmission.toFixed(2)}</Text>
            <Text style={styles.emissionUnit}>tCO₂e</Text>
          </View>
        </View>
        <Text style={styles.entryDescription} numberOfLines={1}>
          {item.description || 'No description'}
        </Text>
        <View style={styles.entryFooter}>
          <Text style={styles.entryAccount}>
            {item.accountNo} — {item.accountCategory}
          </Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>Submitted</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centered} edges={['bottom']}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading entries...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="magnify" size={20} color={Colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search entries..."
          placeholderTextColor={Colors.placeholder}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Icon name="close-circle" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        ) : null}
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={20} color={Colors.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={loadData}>
            <Text style={styles.retryLink}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <FlatList
        data={filteredEntries}
        renderItem={renderEntry}
        keyExtractor={item => item.systemId || `${item.lineNo}`}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="file-document-outline" size={64} color={Colors.disabled} />
            <Text style={styles.emptyTitle}>No entries found</Text>
            <Text style={styles.emptyDescription}>
              {searchQuery
                ? 'Try a different search term'
                : 'Start by uploading a bill or creating a manual entry'}
            </Text>
          </View>
        }
      />

      {/* Entry Detail Modal */}
      <Modal
        visible={showDetail}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowDetail(false)}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Entry Detail</Text>
            <TouchableOpacity onPress={() => setShowDetail(false)}>
              <Icon name="close" size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>

          {selectedEntry && (
            <ScrollView contentContainerStyle={styles.modalContent}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Document No.</Text>
                <Text style={styles.detailValue}>{selectedEntry.documentNo}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Posting Date</Text>
                <Text style={styles.detailValue}>{selectedEntry.postingDate}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Account</Text>
                <Text style={styles.detailValue}>{selectedEntry.accountNo}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Category</Text>
                <Text style={styles.detailValue}>{selectedEntry.accountCategory}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Subcategory</Text>
                <Text style={styles.detailValue}>
                  {selectedEntry.accountSubcategory || '—'}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Description</Text>
                <Text style={styles.detailValue}>
                  {selectedEntry.description || '—'}
                </Text>
              </View>

              <Text style={styles.sectionTitle}>Emissions</Text>
              <View style={styles.emissionsGrid}>
                <View style={styles.emissionItem}>
                  <Text style={styles.emissionLabel}>CO₂</Text>
                  <Text style={styles.emissionAmount}>
                    {selectedEntry.emissionCO2?.toFixed(4) || '0'}
                  </Text>
                </View>
                <View style={styles.emissionItem}>
                  <Text style={styles.emissionLabel}>CH₄</Text>
                  <Text style={styles.emissionAmount}>
                    {selectedEntry.emissionCH4?.toFixed(4) || '0'}
                  </Text>
                </View>
                <View style={styles.emissionItem}>
                  <Text style={styles.emissionLabel}>N₂O</Text>
                  <Text style={styles.emissionAmount}>
                    {selectedEntry.emissionN2O?.toFixed(4) || '0'}
                  </Text>
                </View>
              </View>

              <Text style={styles.sectionTitle}>Quantities</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Fuel/Electricity</Text>
                <Text style={styles.detailValue}>
                  {selectedEntry.fuelOrElectricity || '0'}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Distance</Text>
                <Text style={styles.detailValue}>
                  {selectedEntry.distance || '0'}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Installation</Text>
                <Text style={styles.detailValue}>
                  {selectedEntry.installation || '0'}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDelete(selectedEntry)}>
                <Icon name="delete" size={20} color={Colors.error} />
                <Text style={styles.deleteText}>Delete Entry</Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>
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
  },
  loadingText: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    margin: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    height: 44,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontSize: 15,
    color: Colors.text,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.errorLight,
    marginHorizontal: Spacing.lg,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  errorText: {
    ...Typography.bodySmall,
    color: Colors.error,
    flex: 1,
  },
  retryLink: {
    ...Typography.buttonSmall,
    color: Colors.primary,
  },
  listContent: {
    padding: Spacing.lg,
    paddingTop: 0,
  },
  entryCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.card,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  entryInfo: {},
  entryDocNo: {
    ...Typography.h4,
  },
  entryDate: {
    ...Typography.caption,
    marginTop: 2,
  },
  emissionBadge: {
    alignItems: 'flex-end',
  },
  emissionValue: {
    ...Typography.h4,
    color: Colors.primary,
  },
  emissionUnit: {
    ...Typography.caption,
  },
  entryDescription: {
    ...Typography.bodySmall,
    marginBottom: Spacing.sm,
  },
  entryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  entryAccount: {
    ...Typography.caption,
  },
  statusBadge: {
    backgroundColor: Colors.successLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  statusText: {
    ...Typography.caption,
    color: Colors.success,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.huge,
  },
  emptyTitle: {
    ...Typography.h3,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  emptyDescription: {
    ...Typography.bodySmall,
    textAlign: 'center',
  },
  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    ...Typography.h3,
  },
  modalContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.huge,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  detailLabel: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  detailValue: {
    ...Typography.body,
    fontWeight: '500',
    textAlign: 'right',
    flex: 1,
    marginLeft: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.h4,
    marginTop: Spacing.xxl,
    marginBottom: Spacing.md,
  },
  emissionsGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  emissionItem: {
    flex: 1,
    backgroundColor: Colors.primaryLight,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
  },
  emissionLabel: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: '600',
  },
  emissionAmount: {
    ...Typography.h4,
    color: Colors.primary,
    marginTop: Spacing.xs,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.error,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    marginTop: Spacing.xxxl,
    gap: Spacing.sm,
  },
  deleteText: {
    ...Typography.button,
    color: Colors.error,
  },
});

export default HistoryScreen;
