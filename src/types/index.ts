// ─── Business Central Entities ───────────────────────────────────────────────

export interface SustainabilityCategory {
  code: string;
  description: string;
  emissionScope: 'Scope 1' | 'Scope 2' | 'Scope 3';
  co2: boolean;
  ch4: boolean;
  n2o: boolean;
  waterIntensity: boolean;
  dischargedIntoWater: boolean;
  wasteIntensity: boolean;
}

export interface SustainabilitySubcategory {
  code: string;
  description: string;
  categoryCode: string;
  emissionFactorCO2: number;
  emissionFactorCH4: number;
  emissionFactorN2O: number;
  renewableEnergy: boolean;
}

export interface SustainabilityAccount {
  no: string;
  name: string;
  category: string;
  subcategory: string;
  accountType: 'Posting' | 'Heading' | 'Total' | 'Begin-Total' | 'End-Total';
  directPosting: boolean;
  totaling: string;
}

export interface SustainabilityJournalEntry {
  systemId?: string;
  journalTemplateName: string;
  journalBatchName: string;
  lineNo: number;
  postingDate: string;
  documentNo: string;
  accountNo: string;
  accountCategory: string;
  accountSubcategory: string;
  description: string;
  unitOfMeasure: string;
  fuelOrElectricity: number;
  distance: number;
  installation: number;
  customAmount: number;
  emissionCO2: number;
  emissionCH4: number;
  emissionN2O: number;
  countryRegionCode: string;
  responsibilityCenter: string;
}

export interface CreateJournalEntryPayload {
  journalTemplateName?: string;
  journalBatchName?: string;
  postingDate: string;
  documentNo: string;
  accountNo: string;
  description: string;
  unitOfMeasure?: string;
  fuelOrElectricity?: number;
  distance?: number;
  installation?: number;
  customAmount?: number;
  countryRegionCode?: string;
  responsibilityCenter?: string;
}

export interface ESGLocation {
  code: string;
  name: string;
  description: string;
  countryRegionCode: string;
}

export interface Vendor {
  no: string;
  name: string;
  address: string;
  city: string;
  contact: string;
  phoneNo: string;
  postCode: string;
  countryRegionCode: string;
}

// ─── App Types ───────────────────────────────────────────────────────────────

export enum CalculationType {
  FuelOrElectricity = 'Fuel/Electricity',
  Distance = 'Distance',
  Installation = 'Installation',
  Custom = 'Custom',
}

export enum DraftStatus {
  Draft = 'draft',
  Submitted = 'submitted',
  Failed = 'failed',
}

export interface DraftEntry {
  localId: string;
  postingDate: string;
  documentNo: string;
  accountNo: string;
  accountCategory: string;
  accountSubcategory: string;
  description: string;
  unitOfMeasure: string;
  calculationType: CalculationType;
  quantity: number;
  countryRegionCode: string;
  responsibilityCenter: string;
  attachmentUri?: string;
  attachmentName?: string;
  status: DraftStatus;
  createdAt: string;
  updatedAt: string;
  errorMessage?: string;
}

export interface FilterState {
  dateFrom: string | null;
  dateTo: string | null;
  scope: 'Scope 1' | 'Scope 2' | 'Scope 3' | null;
  categoryCode: string | null;
  calculationType: CalculationType | null;
  status: DraftStatus | 'all';
  searchQuery: string;
}

export interface UserProfile {
  email: string;
  name: string;
  lastLogin: string;
  preferences: {
    notificationsEnabled: boolean;
    defaultScope: string | null;
    defaultDateRange: number; // days
  };
}

export interface ExtractionResult {
  billDate: string | null;
  vendorName: string | null;
  amount: number | null;
  units: string | null;
  accountNumber: string | null;
  confidence: {
    billDate: number;
    vendorName: number;
    amount: number;
    units: number;
  };
  rawFields: Record<string, {value: string; confidence: number}>;
}

// ─── API Types ───────────────────────────────────────────────────────────────

export interface TokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  expiresAt: number; // computed: Date.now() + expires_in * 1000
}

export interface ApiError {
  code: string;
  message: string;
  details?: string;
}

export interface ODataResponse<T> {
  '@odata.context'?: string;
  '@odata.count'?: number;
  value: T[];
}

// ─── Navigation Types ────────────────────────────────────────────────────────

export type RootStackParamList = {
  Login: undefined;
  Main: undefined;
};

export type MainTabParamList = {
  DashboardTab: undefined;
  UploadTab: undefined;
  ManualEntryTab: undefined;
  HistoryTab: undefined;
  SettingsTab: undefined;
};

export type DashboardStackParamList = {
  Dashboard: undefined;
  ScopeDetail: {scope: 'Scope 1' | 'Scope 2' | 'Scope 3'; title: string};
  EntryDetail: {entry: SustainabilityJournalEntry};
};

export type UploadStackParamList = {
  Upload: undefined;
  UploadResult: {extractionResult: ExtractionResult; fileUri: string; fileName: string};
};

export type ManualEntryStackParamList = {
  ManualEntry: {entry?: SustainabilityJournalEntry; draft?: DraftEntry};
};

export type HistoryStackParamList = {
  History: undefined;
  EntryDetail: {entry: SustainabilityJournalEntry};
};
