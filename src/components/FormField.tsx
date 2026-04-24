import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Colors, Spacing, BorderRadius, Typography, Layout} from '../theme';

interface FormFieldProps extends TextInputProps {
  label: string;
  error?: string;
  icon?: string;
  containerStyle?: ViewStyle;
  required?: boolean;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  icon,
  containerStyle,
  required,
  ...inputProps
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      <View style={[styles.inputWrapper, error && styles.inputError]}>
        {icon && (
          <Icon
            name={icon}
            size={20}
            color={Colors.textSecondary}
            style={styles.icon}
          />
        )}
        <TextInput
          style={[styles.input, icon && styles.inputWithIcon]}
          placeholderTextColor={Colors.placeholder}
          {...inputProps}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  label: {
    ...Typography.label,
    marginBottom: Spacing.sm,
  },
  required: {
    color: Colors.error,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: Layout.inputHeight,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
  },
  inputError: {
    borderColor: Colors.error,
  },
  icon: {
    marginLeft: Spacing.md,
  },
  input: {
    flex: 1,
    height: '100%',
    paddingHorizontal: Spacing.lg,
    fontSize: 15,
    color: Colors.text,
  },
  inputWithIcon: {
    paddingLeft: Spacing.sm,
  },
  errorText: {
    ...Typography.caption,
    color: Colors.error,
    marginTop: Spacing.xs,
  },
});

export default FormField;
