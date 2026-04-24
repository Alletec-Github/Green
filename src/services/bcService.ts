import axios, {AxiosInstance} from 'axios';
import {AppConfig} from '../config/appConfig';
import {getClientCredentialsToken} from './authService';
import {
  SustainabilityCategory,
  SustainabilitySubcategory,
  SustainabilityAccount,
  SustainabilityJournalEntry,
  CreateJournalEntryPayload,
  ESGLocation,
  Vendor,
  ODataResponse,
} from '../types';

const BC_SCOPE = 'https://api.businesscentral.dynamics.com/.default';

const {businessCentral: config} = AppConfig;

/**
 * Get the base URL for custom API endpoints.
 * Pattern: {apiBaseUrl}/api/{publisher}/{group}/{version}/companies({companyId})
 */
function getApiBase(): string {
  const base = config.apiBaseUrl.replace(/\/$/, '');
  return `${base}/api/${config.apiPublisher}/${config.apiGroup}/${config.apiVersion}`;
}

/**
 * Create an authenticated axios instance for Business Central.
 */
async function getClient(): Promise<AxiosInstance> {
  const token = await getClientCredentialsToken(
    config.tenantId,
    config.clientId,
    config.clientSecret,
    BC_SCOPE,
  );

  const client = axios.create({
    baseURL: getApiBase(),
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

  if (__DEV__) {
    client.interceptors.request.use(req => {
      console.log(`[BC] ${req.method?.toUpperCase()} ${req.url}`);
      return req;
    });
    client.interceptors.response.use(
      res => {
        console.log(`[BC] ${res.status} ${res.config.url}`);
        return res;
      },
      err => {
        console.error(`[BC] Error:`, err.response?.data || err.message);
        return Promise.reject(err);
      },
    );
  }

  return client;
}

/**
 * Build the company-scoped URL segment.
 * If companyId is set, use it. Otherwise we query by companyName.
 */
async function getCompanySegment(client: AxiosInstance): Promise<string> {
  if (config.companyId) {
    return `companies(${config.companyId})`;
  }

  // Look up company by name
  const res = await client.get<ODataResponse<{id: string; name: string}>>(
    `/companies?$filter=name eq '${encodeURIComponent(config.companyName)}'`,
  );

  if (res.data.value.length === 0) {
    throw new Error(`Company "${config.companyName}" not found in Business Central`);
  }

  const companyId = res.data.value[0].id;
  // Cache for future calls
  config.companyId = companyId;
  return `companies(${companyId})`;
}

// ─── Public API Methods ──────────────────────────────────────────────────────

export async function getCategories(): Promise<SustainabilityCategory[]> {
  const client = await getClient();
  const company = await getCompanySegment(client);
  const res = await client.get<ODataResponse<SustainabilityCategory>>(
    `/${company}/sustainabilityCategories`,
  );
  return res.data.value;
}

export async function getSubcategories(
  categoryCode?: string,
): Promise<SustainabilitySubcategory[]> {
  const client = await getClient();
  const company = await getCompanySegment(client);
  let url = `/${company}/sustainabilitySubcategories`;
  if (categoryCode) {
    url += `?$filter=categoryCode eq '${categoryCode}'`;
  }
  const res = await client.get<ODataResponse<SustainabilitySubcategory>>(url);
  return res.data.value;
}

export async function getAccounts(): Promise<SustainabilityAccount[]> {
  const client = await getClient();
  const company = await getCompanySegment(client);
  const res = await client.get<ODataResponse<SustainabilityAccount>>(
    `/${company}/sustainabilityAccounts`,
  );
  return res.data.value;
}

export interface JournalEntryFilters {
  top?: number;
  skip?: number;
  filter?: string;
  orderBy?: string;
}

export async function getJournalEntries(
  filters?: JournalEntryFilters,
): Promise<SustainabilityJournalEntry[]> {
  const client = await getClient();
  const company = await getCompanySegment(client);
  let url = `/${company}/sustainabilityJournalEntries`;

  const params: string[] = [];
  if (filters?.top) {
    params.push(`$top=${filters.top}`);
  }
  if (filters?.skip) {
    params.push(`$skip=${filters.skip}`);
  }
  if (filters?.filter) {
    params.push(`$filter=${filters.filter}`);
  }
  if (filters?.orderBy) {
    params.push(`$orderby=${filters.orderBy}`);
  }
  if (params.length > 0) {
    url += `?${params.join('&')}`;
  }

  const res = await client.get<ODataResponse<SustainabilityJournalEntry>>(url);
  return res.data.value;
}

export async function createJournalEntry(
  entry: CreateJournalEntryPayload,
): Promise<SustainabilityJournalEntry> {
  const client = await getClient();
  const company = await getCompanySegment(client);
  const res = await client.post<SustainabilityJournalEntry>(
    `/${company}/sustainabilityJournalEntries`,
    entry,
  );
  return res.data;
}

export async function deleteJournalEntry(systemId: string): Promise<void> {
  const client = await getClient();
  const company = await getCompanySegment(client);
  await client.delete(
    `/${company}/sustainabilityJournalEntries(${systemId})`,
  );
}

export async function getESGLocations(): Promise<ESGLocation[]> {
  const client = await getClient();
  const company = await getCompanySegment(client);
  const res = await client.get<ODataResponse<ESGLocation>>(
    `/${company}/esgLocations`,
  );
  return res.data.value;
}

export async function getVendors(): Promise<Vendor[]> {
  const client = await getClient();
  const company = await getCompanySegment(client);
  const res = await client.get<ODataResponse<Vendor>>(
    `/${company}/vendors`,
  );
  return res.data.value;
}
