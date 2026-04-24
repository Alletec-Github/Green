import React, {useState} from 'react';
import {
  View,
  Text,
  Modal,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Colors, Spacing, BorderRadius, Typography} from '../theme';

interface ModalPickerOption {
  label: string;
  value: string;
  description?: string;
}

interface ModalPickerProps {
  visible: boolean;
  title: string;
  options: ModalPickerOption[];
  selectedValue?: string;
  onSelect: (value: string) => void;
  onClose: () => void;
  searchable?: boolean;
}

const ModalPicker: React.FC<ModalPickerProps> = ({
  visible,
  title,
  options,
  selectedValue,
  onSelect,
  onClose,
  searchable = true,
}) => {
  const [search, setSearch] = useState('');

  const filtered = search
    ? options.filter(
        o =>
          o.label.toLowerCase().includes(search.toLowerCase()) ||
          o.description?.toLowerCase().includes(search.toLowerCase()),
      )
    : options;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <TouchableOpacity onPress={onClose}>
            <Icon name="close" size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>

        {searchable && (
          <View style={styles.searchContainer}>
            <Icon name="magnify" size={20} color={Colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search..."
              placeholderTextColor={Colors.placeholder}
              value={search}
              onChangeText={setSearch}
              autoFocus={false}
            />
          </View>
        )}

        <FlatList
          data={filtered}
          keyExtractor={item => item.value}
          renderItem={({item}) => (
            <TouchableOpacity
              style={[
                styles.option,
                selectedValue === item.value && styles.optionSelected,
              ]}
              onPress={() => {
                onSelect(item.value);
                onClose();
                setSearch('');
              }}>
              <View style={styles.optionContent}>
                <Text style={styles.optionLabel}>{item.label}</Text>
                {item.description && (
                  <Text style={styles.optionDescription}>{item.description}</Text>
                )}
              </View>
              {selectedValue === item.value && (
                <Icon name="check" size={20} color={Colors.primary} />
              )}
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No results found</Text>
            </View>
          }
        />
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    ...Typography.h3,
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
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    backgroundColor: Colors.surface,
  },
  optionSelected: {
    backgroundColor: Colors.primaryFaded,
  },
  optionContent: {
    flex: 1,
  },
  optionLabel: {
    ...Typography.body,
  },
  optionDescription: {
    ...Typography.caption,
    marginTop: 2,
  },
  emptyContainer: {
    padding: Spacing.xxl,
    alignItems: 'center',
  },
  emptyText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
});

export default ModalPicker;
