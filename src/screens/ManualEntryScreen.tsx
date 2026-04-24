import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import {Colors, Spacing, BorderRadius, Typography, Shadows, Layout} from '../theme';
import {
  getCategories,
  getSubcategories,
  getAccounts,
  createJournalEntry,
} from '../services/bcService';
import {
  SustainabilityCategory,
  SustainabilitySubcategory,
  SustainabilityAccount,
  CalculationType,
  CreateJournalEntryPayload,
} from '../types';

const CALC_TYPES = [
  {key: CalculationType.FuelOrElectricity, label: 'Fuel/Electricity', icon: 'flash'},
  {key: CalculationType.Distance, label: 'Distance', icon: 'map-marker-distance'},
  {key: CalculationType.Installation, label: 'Installation', icon: 'office-building'},
  {key: CalculationType.Custom, label: 'Custom', icon: 'tune'},
];

const ManualEntryScreen: React.FC = () => {
  // Form state
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [calcType, setCalcType] = useState<CalculationType>(CalculationType.FuelOrElectricity);
  const [quantity, setQuantity] = useState('');
  const [unitOfMeasure, setUnitOfMeasure] = useState('');
  const [postingDate, setPostingDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [description, setDescription] = useState('');
  const [documentNo, setDocumentNo] = useState('');

  // Data state
  const [categories, setCategories] = useState<SustainabilityCategory[]>([]);
  const [subcategories, setSubcategories] = useState<SustainabilitySubcategory[]>([]);
  const [accounts, setAccounts] = useState<SustainabilityAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Picker modals
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showSubcategoryPicker, setShowSubcategoryPicker] = useState(false);
  const [showAccountPicker, setShowAccountPicker] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const [cats, accts] = await Promise.all([
        getCategories(),
        getAccounts(),
      ]);
      setCategories(cats);
      setAccounts(accts.filter(a => a.directPosting));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load data';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (selectedCategory) {
      getSubcategories(selectedCategory)
        .then(setSubcategories)
        .catch(() => setSubcategories([]));
      setSelectedSubcategory('');
    }
  }, [selectedCategory]);

  const handleSubmit = async () => {
    if (!selectedAccount || !quantity) {
      Alert.alert('Validation', 'Please fill in all required fields');
      return;
    }

    setSubmitting(true);

    try {
      const entry: CreateJournalEntryPayload = {
        postingDate: postingDate.toISOString().split('T')[0],
        documentNo: documentNo || `GRN-${Date.now()}`,
        accountNo: selectedAccount,
        description,
        unitOfMeasure,
      };

      const qty = parseFloat(quantity);
      switch (calcType) {
        case CalculationType.FuelOrElectricity:
          entry.fuelOrElectricity = qty;
          break;
        case CalculationType.Distance:
          entry.distance = qty;
          break;
        case CalculationType.Installation:
          entry.installation = qty;
          break;
        case CalculationType.Custom:
          entry.customAmount = qty;
          break;
      }

      await createJournalEntry(entry);
      Alert.alert('Success', 'Journal entry created successfully', [
        {
          text: 'Create Another',
          onPress: () => {
            setQuantity('');
            setDescription('');
            setDocumentNo('');
          },
        },
        {text: 'Done'},
      ]);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Submission failed';
      Alert.alert('Error', message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centered} edges={['bottom']}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading form data...</Text>
      </SafeAreaView>
    );
  }

  const selectedCategoryObj = categories.find(c => c.code === selectedCategory);
  const selectedSubcategoryObj = subcategories.find(
    c => c.code === selectedSubcategory,
  );
  const selectedAccountObj = accounts.find(a => a.no === selectedAccount);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        {/* Category */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Category *</Text>
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setShowCategoryPicker(!showCategoryPicker)}>
            <Text
              style={
                selectedCategory ? styles.pickerValue : styles.pickerPlaceholder
              }>
              {selectedCategoryObj
                ? `${selectedCategoryObj.code} — ${selectedCategoryObj.description}`
                : 'Select category'}
            </Text>
            <Icon name="chevron-down" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
          {showCategoryPicker && (
            <View style={styles.pickerDropdown}>
              {categories.map(cat => (
                <TouchableOpacity
                  key={cat.code}
                  style={[
                    styles.pickerOption,
                    selectedCategory === cat.code && styles.pickerOptionSelected,
                  ]}
                  onPress={() => {
                    setSelectedCategory(cat.code);
                    setShowCategoryPicker(false);
                  }}>
                  <Text style={styles.pickerOptionText}>
                    {cat.code} — {cat.description}
                  </Text>
                  <Text style={styles.pickerOptionScope}>{cat.emissionScope}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Subcategory */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Subcategory</Text>
          <TouchableOpacity
            style={[styles.pickerButton, !selectedCategory && styles.pickerDisabled]}
            onPress={() =>
              selectedCategory && setShowSubcategoryPicker(!showSubcategoryPicker)
            }
            disabled={!selectedCategory}>
            <Text
              style={
                selectedSubcategory
                  ? styles.pickerValue
                  : styles.pickerPlaceholder
              }>
              {selectedSubcategoryObj
                ? `${selectedSubcategoryObj.code} — ${selectedSubcategoryObj.description}`
                : 'Select subcategory'}
            </Text>
            <Icon name="chevron-down" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
          {showSubcategoryPicker && (
            <View style={styles.pickerDropdown}>
              {subcategories.map(sub => (
                <TouchableOpacity
                  key={sub.code}
                  style={[
                    styles.pickerOption,
                    selectedSubcategory === sub.code &&
                      styles.pickerOptionSelected,
                  ]}
                  onPress={() => {
                    setSelectedSubcategory(sub.code);
                    setShowSubcategoryPicker(false);
                  }}>
                  <Text style={styles.pickerOptionText}>
                    {sub.code} — {sub.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Account */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Account *</Text>
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setShowAccountPicker(!showAccountPicker)}>
            <Text
              style={
                selectedAccount ? styles.pickerValue : styles.pickerPlaceholder
              }>
              {selectedAccountObj
                ? `${selectedAccountObj.no} — ${selectedAccountObj.name}`
                : 'Select account'}
            </Text>
            <Icon name="chevron-down" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
          {showAccountPicker && (
            <View style={styles.pickerDropdown}>
              {accounts.map(acct => (
                <TouchableOpacity
                  key={acct.no}
                  style={[
                    styles.pickerOption,
                    selectedAccount === acct.no && styles.pickerOptionSelected,
                  ]}
                  onPress={() => {
                    setSelectedAccount(acct.no);
                    setShowAccountPicker(false);
                  }}>
                  <Text style={styles.pickerOptionText}>
                    {acct.no} — {acct.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Calculation Type */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Calculation Type</Text>
          <View style={styles.calcTypeRow}>
            {CALC_TYPES.map(ct => (
              <TouchableOpacity
                key={ct.key}
                style={[
                  styles.calcTypeButton,
                  calcType === ct.key && styles.calcTypeSelected,
                ]}
                onPress={() => setCalcType(ct.key)}>
                <Icon
                  name={ct.icon}
                  size={20}
                  color={calcType === ct.key ? Colors.primary : Colors.textSecondary}
                />
                <Text
                  style={[
                    styles.calcTypeLabel,
                    calcType === ct.key && styles.calcTypeLabelSelected,
                  ]}>
                  {ct.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Quantity */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Quantity *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter quantity"
            placeholderTextColor={Colors.placeholder}
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="decimal-pad"
          />
        </View>

        {/* Unit of Measure */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Unit of Measure</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., kWh, therms, miles"
            placeholderTextColor={Colors.placeholder}
            value={unitOfMeasure}
            onChangeText={setUnitOfMeasure}
          />
        </View>

        {/* Date */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Posting Date *</Text>
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setShowDatePicker(true)}>
            <Text style={styles.pickerValue}>
              {postingDate.toLocaleDateString()}
            </Text>
            <Icon name="calendar" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={postingDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, date) => {
                setShowDatePicker(Platform.OS === 'ios');
                if (date) {setPostingDate(date);}
              }}
            />
          )}
        </View>

        {/* Document No */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Document No.</Text>
          <TextInput
            style={styles.input}
            placeholder="Auto-generated if empty"
            placeholderTextColor={Colors.placeholder}
            value={documentNo}
            onChangeText={setDocumentNo}
          />
        </View>

        {/* Description */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Enter description"
            placeholderTextColor={Colors.placeholder}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitButton, submitting && styles.submitDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
          activeOpacity={0.8}>
          {submitting ? (
            <ActivityIndicator color={Colors.textOnPrimary} />
          ) : (
            <>
              <Icon name="send" size={20} color={Colors.textOnPrimary} />
              <Text style={styles.submitText}>Submit Entry</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.draftButton} activeOpacity={0.7}>
          <Icon name="content-save-outline" size={20} color={Colors.primary} />
          <Text style={styles.draftText}>Save as Draft</Text>
        </TouchableOpacity>
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
  },
  loadingText: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
  },
  scrollContent: {
    padding: Layout.screenPadding,
    paddingBottom: Spacing.huge,
  },
  fieldContainer: {
    marginBottom: Spacing.lg,
  },
  fieldLabel: {
    ...Typography.label,
    marginBottom: Spacing.sm,
  },
  input: {
    height: Layout.inputHeight,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    fontSize: 15,
    color: Colors.text,
    backgroundColor: Colors.surface,
  },
  textArea: {
    height: 80,
    paddingTop: Spacing.md,
  },
  pickerButton: {
    height: Layout.inputHeight,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
  },
  pickerDisabled: {
    opacity: 0.5,
  },
  pickerValue: {
    ...Typography.body,
    flex: 1,
  },
  pickerPlaceholder: {
    ...Typography.body,
    color: Colors.placeholder,
    flex: 1,
  },
  pickerDropdown: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: Spacing.xs,
    maxHeight: 200,
    ...Shadows.card,
  },
  pickerOption: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  pickerOptionSelected: {
    backgroundColor: Colors.primaryFaded,
  },
  pickerOptionText: {
    ...Typography.body,
  },
  pickerOptionScope: {
    ...Typography.caption,
    marginTop: 2,
  },
  calcTypeRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  calcTypeButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  calcTypeSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryFaded,
  },
  calcTypeLabel: {
    ...Typography.caption,
    marginTop: Spacing.xs,
    color: Colors.textSecondary,
  },
  calcTypeLabelSelected: {
    color: Colors.primary,
    fontWeight: '600',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    height: Layout.buttonHeight,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
    marginTop: Spacing.lg,
    ...Shadows.button,
  },
  submitDisabled: {
    opacity: 0.7,
  },
  submitText: {
    ...Typography.button,
    color: Colors.textOnPrimary,
  },
  draftButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: Layout.buttonHeight,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
    marginTop: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  draftText: {
    ...Typography.button,
    color: Colors.primary,
  },
});

export default ManualEntryScreen;
