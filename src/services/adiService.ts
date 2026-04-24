import axios from 'axios';
import {AppConfig} from '../config/appConfig';
import {ExtractionResult} from '../types';

const {azureDocIntelligence: config} = AppConfig;

const ADI_API_VERSION = '2023-07-31';

/**
 * Submit a document (base64-encoded or URL) to Azure Document Intelligence for analysis.
 * Returns the operation-location URL for polling results.
 */
export async function analyzeDocument(
  fileBase64: string,
): Promise<string> {
  const url = `${config.endpoint}formrecognizer/documentModels/${config.modelId}:analyze?api-version=${ADI_API_VERSION}`;

  const response = await axios.post(
    url,
    {base64Source: fileBase64},
    {
      headers: {
        'Ocp-Apim-Subscription-Key': config.apiKey,
        'Content-Type': 'application/json',
      },
    },
  );

  const operationLocation = response.headers['operation-location'];
  if (!operationLocation) {
    throw new Error('No operation-location header in ADI response');
  }

  return operationLocation;
}

/**
 * Submit a document from a URL to Azure Document Intelligence.
 */
export async function analyzeDocumentFromUrl(
  fileUrl: string,
): Promise<string> {
  const url = `${config.endpoint}formrecognizer/documentModels/${config.modelId}:analyze?api-version=${ADI_API_VERSION}`;

  const response = await axios.post(
    url,
    {urlSource: fileUrl},
    {
      headers: {
        'Ocp-Apim-Subscription-Key': config.apiKey,
        'Content-Type': 'application/json',
      },
    },
  );

  const operationLocation = response.headers['operation-location'];
  if (!operationLocation) {
    throw new Error('No operation-location header in ADI response');
  }

  return operationLocation;
}

interface ADIAnalyzeResult {
  status: 'notStarted' | 'running' | 'succeeded' | 'failed';
  analyzeResult?: {
    documents?: Array<{
      fields: Record<
        string,
        {
          type: string;
          content?: string;
          value?: string | number;
          confidence: number;
        }
      >;
    }>;
  };
}

/**
 * Poll for analysis results until complete.
 * Returns the parsed extraction result.
 */
export async function getAnalysisResult(
  operationUrl: string,
  maxRetries: number = 30,
  intervalMs: number = 2000,
): Promise<ExtractionResult> {
  for (let i = 0; i < maxRetries; i++) {
    const response = await axios.get<ADIAnalyzeResult>(operationUrl, {
      headers: {
        'Ocp-Apim-Subscription-Key': config.apiKey,
      },
    });

    const {status, analyzeResult} = response.data;

    if (status === 'succeeded' && analyzeResult) {
      return parseExtractionResult(analyzeResult);
    }

    if (status === 'failed') {
      throw new Error('Document analysis failed');
    }

    // Wait before next poll
    await new Promise(resolve => setTimeout(resolve, intervalMs));
  }

  throw new Error('Document analysis timed out');
}

/**
 * Parse the Azure DI analysis result into our ExtractionResult type.
 */
function parseExtractionResult(analyzeResult: {
  documents?: Array<{
    fields: Record<
      string,
      {
        type: string;
        content?: string;
        value?: string | number;
        confidence: number;
      }
    >;
  }>;
}): ExtractionResult {
  const fields = analyzeResult.documents?.[0]?.fields || {};

  const rawFields: Record<string, {value: string; confidence: number}> = {};
  for (const [key, field] of Object.entries(fields)) {
    rawFields[key] = {
      value: String(field.content || field.value || ''),
      confidence: field.confidence,
    };
  }

  return {
    billDate: getFieldValue(fields, 'billDate'),
    vendorName: getFieldValue(fields, 'vendorName'),
    amount: getNumericFieldValue(fields, 'amount'),
    units: getFieldValue(fields, 'units'),
    accountNumber: getFieldValue(fields, 'accountNumber'),
    confidence: {
      billDate: fields.billDate?.confidence ?? 0,
      vendorName: fields.vendorName?.confidence ?? 0,
      amount: fields.amount?.confidence ?? 0,
      units: fields.units?.confidence ?? 0,
    },
    rawFields,
  };
}

function getFieldValue(
  fields: Record<string, {content?: string; value?: string | number}>,
  key: string,
): string | null {
  const field = fields[key];
  if (!field) {
    return null;
  }
  return String(field.content || field.value || '') || null;
}

function getNumericFieldValue(
  fields: Record<string, {content?: string; value?: string | number}>,
  key: string,
): number | null {
  const field = fields[key];
  if (!field) {
    return null;
  }
  const value = field.value ?? field.content;
  if (value === undefined || value === null) {
    return null;
  }
  const num = typeof value === 'number' ? value : parseFloat(String(value));
  return isNaN(num) ? null : num;
}
