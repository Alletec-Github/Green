import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {pick} from '@react-native-documents/picker';
import ReactNativeBlobUtil from 'react-native-blob-util';
import {Colors, Spacing, BorderRadius, Typography, Shadows, Layout} from '../theme';
import {analyzeDocument, getAnalysisResult} from '../services/adiService';
import {ExtractionResult} from '../types';

type UploadStep = 'select' | 'uploading' | 'analyzing' | 'results';

const UploadScreen: React.FC = () => {
  const [step, setStep] = useState<UploadStep>('select');
  const [fileName, setFileName] = useState('');
  const [fileUri, setFileUri] = useState('');
  const [extractionResult, setExtractionResult] = useState<ExtractionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePickFile = useCallback(async () => {
    try {
      const [result] = await pick({
        type: ['application/pdf', 'image/jpeg', 'image/png'],
      });

      if (!result) {return;}

      setFileName(result.name || 'document');
      setFileUri(result.uri);
      setStep('uploading');
      setError(null);

      // Read file as base64
      const base64 = await ReactNativeBlobUtil.fs.readFile(result.uri, 'base64');

      setStep('analyzing');

      // Submit to Azure DI
      const operationUrl = await analyzeDocument(base64);

      // Poll for results
      const extraction = await getAnalysisResult(operationUrl);

      setExtractionResult(extraction);
      setStep('results');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Upload failed';
      setError(message);
      setStep('select');
    }
  }, []);

  const handleReset = () => {
    setStep('select');
    setFileName('');
    setFileUri('');
    setExtractionResult(null);
    setError(null);
  };

  const renderConfidenceBadge = (confidence: number) => {
    const color =
      confidence >= 0.9
        ? Colors.success
        : confidence >= 0.7
        ? Colors.warning
        : Colors.error;
    return (
      <View style={[styles.confidenceBadge, {backgroundColor: color + '20'}]}>
        <Text style={[styles.confidenceText, {color}]}>
          {(confidence * 100).toFixed(0)}%
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {step === 'select' && (
          <View style={styles.selectContainer}>
            <View style={styles.uploadArea}>
              <Icon name="cloud-upload-outline" size={64} color={Colors.primary} />
              <Text style={styles.uploadTitle}>Upload a Bill</Text>
              <Text style={styles.uploadDescription}>
                Select a PDF or image of a utility bill to automatically extract
                emission data using AI
              </Text>
              <TouchableOpacity
                style={styles.selectButton}
                onPress={handlePickFile}
                activeOpacity={0.8}>
                <Icon name="file-plus" size={20} color={Colors.textOnPrimary} />
                <Text style={styles.selectButtonText}>Select File</Text>
              </TouchableOpacity>
              <Text style={styles.supportedFormats}>
                Supported: PDF, JPEG, PNG
              </Text>
            </View>

            {error && (
              <View style={styles.errorCard}>
                <Icon name="alert-circle" size={20} color={Colors.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
          </View>
        )}

        {(step === 'uploading' || step === 'analyzing') && (
          <View style={styles.progressContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.progressTitle}>
              {step === 'uploading' ? 'Uploading Document...' : 'Analyzing with AI...'}
            </Text>
            <Text style={styles.progressDescription}>
              {step === 'uploading'
                ? `Sending ${fileName} to Azure Document Intelligence`
                : 'Extracting bill date, vendor, amount, and units'}
            </Text>

            <View style={styles.progressSteps}>
              <View style={styles.progressStep}>
                <Icon
                  name="check-circle"
                  size={20}
                  color={Colors.success}
                />
                <Text style={styles.progressStepText}>File selected</Text>
              </View>
              <View style={styles.progressStep}>
                <Icon
                  name={step === 'uploading' ? 'loading' : 'check-circle'}
                  size={20}
                  color={step === 'uploading' ? Colors.primary : Colors.success}
                />
                <Text style={styles.progressStepText}>Upload to ADI</Text>
              </View>
              <View style={styles.progressStep}>
                <Icon
                  name={step === 'analyzing' ? 'loading' : 'circle-outline'}
                  size={20}
                  color={step === 'analyzing' ? Colors.primary : Colors.disabled}
                />
                <Text style={styles.progressStepText}>AI extraction</Text>
              </View>
            </View>
          </View>
        )}

        {step === 'results' && extractionResult && (
          <View style={styles.resultsContainer}>
            <View style={styles.successHeader}>
              <Icon name="check-circle" size={48} color={Colors.success} />
              <Text style={styles.successTitle}>Extraction Complete</Text>
              <Text style={styles.successDescription}>
                Review the extracted fields below
              </Text>
            </View>

            <View style={styles.resultCard}>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Bill Date</Text>
                <Text style={styles.resultValue}>
                  {extractionResult.billDate || 'Not found'}
                </Text>
                {renderConfidenceBadge(extractionResult.confidence.billDate)}
              </View>

              <View style={styles.divider} />

              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Vendor</Text>
                <Text style={styles.resultValue}>
                  {extractionResult.vendorName || 'Not found'}
                </Text>
                {renderConfidenceBadge(extractionResult.confidence.vendorName)}
              </View>

              <View style={styles.divider} />

              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Amount</Text>
                <Text style={styles.resultValue}>
                  {extractionResult.amount?.toString() || 'Not found'}
                </Text>
                {renderConfidenceBadge(extractionResult.confidence.amount)}
              </View>

              <View style={styles.divider} />

              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Units</Text>
                <Text style={styles.resultValue}>
                  {extractionResult.units || 'Not found'}
                </Text>
                {renderConfidenceBadge(extractionResult.confidence.units)}
              </View>
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.createEntryButton}
                onPress={() =>
                  Alert.alert(
                    'Create Entry',
                    'This will navigate to the manual entry form with pre-populated values.',
                  )
                }
                activeOpacity={0.8}>
                <Icon name="pencil-plus" size={20} color={Colors.textOnPrimary} />
                <Text style={styles.createEntryText}>Create Entry</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.resetButton}
                onPress={handleReset}
                activeOpacity={0.8}>
                <Text style={styles.resetButtonText}>Upload Another</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
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
    flexGrow: 1,
    padding: Layout.screenPadding,
  },
  selectContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  uploadArea: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xxxl,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.primaryLight,
    borderStyle: 'dashed',
  },
  uploadTitle: {
    ...Typography.h2,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  uploadDescription: {
    ...Typography.bodySmall,
    textAlign: 'center',
    marginBottom: Spacing.xxl,
    lineHeight: 20,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
    ...Shadows.button,
  },
  selectButtonText: {
    ...Typography.button,
    color: Colors.textOnPrimary,
  },
  supportedFormats: {
    ...Typography.caption,
    marginTop: Spacing.lg,
  },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.errorLight,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginTop: Spacing.lg,
    gap: Spacing.sm,
  },
  errorText: {
    ...Typography.bodySmall,
    color: Colors.error,
    flex: 1,
  },
  progressContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xxl,
  },
  progressTitle: {
    ...Typography.h3,
    marginTop: Spacing.xxl,
    marginBottom: Spacing.sm,
  },
  progressDescription: {
    ...Typography.bodySmall,
    textAlign: 'center',
    marginBottom: Spacing.xxxl,
  },
  progressSteps: {
    gap: Spacing.lg,
  },
  progressStep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  progressStepText: {
    ...Typography.body,
  },
  resultsContainer: {
    flex: 1,
  },
  successHeader: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  successTitle: {
    ...Typography.h2,
    color: Colors.success,
    marginTop: Spacing.md,
  },
  successDescription: {
    ...Typography.bodySmall,
    marginTop: Spacing.xs,
  },
  resultCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadows.card,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  resultLabel: {
    ...Typography.label,
    width: 80,
  },
  resultValue: {
    ...Typography.body,
    flex: 1,
    fontWeight: '600',
  },
  confidenceBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  confidenceText: {
    fontSize: 11,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
  },
  actionButtons: {
    marginTop: Spacing.xxl,
    gap: Spacing.md,
  },
  createEntryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
    ...Shadows.button,
  },
  createEntryText: {
    ...Typography.button,
    color: Colors.textOnPrimary,
  },
  resetButton: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  resetButtonText: {
    ...Typography.button,
    color: Colors.primary,
  },
});

export default UploadScreen;
