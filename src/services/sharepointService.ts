import axios, {AxiosInstance} from 'axios';
import {AppConfig} from '../config/appConfig';
import {getClientCredentialsToken} from './authService';

const GRAPH_SCOPE = 'https://graph.microsoft.com/.default';
const GRAPH_BASE = 'https://graph.microsoft.com/v1.0';

const {sharePoint: config} = AppConfig;

/**
 * Create an authenticated axios instance for Microsoft Graph API.
 */
async function getClient(): Promise<AxiosInstance> {
  const token = await getClientCredentialsToken(
    config.tenantId,
    config.clientId,
    config.clientSecret,
    GRAPH_SCOPE,
  );

  const client = axios.create({
    baseURL: GRAPH_BASE,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (__DEV__) {
    client.interceptors.request.use(req => {
      console.log(`[SP] ${req.method?.toUpperCase()} ${req.url}`);
      return req;
    });
  }

  return client;
}

/**
 * Get the SharePoint site ID from the site URL.
 * Caches the result in config.siteId.
 */
async function getSiteId(): Promise<string> {
  if (config.siteId) {
    return config.siteId;
  }

  const client = await getClient();
  const res = await client.get(`/sites/${config.siteUrl}`);
  config.siteId = res.data.id;
  return config.siteId;
}

/**
 * Get the default document library drive ID for the site.
 * Caches the result in config.driveId.
 */
async function getDriveId(): Promise<string> {
  if (config.driveId) {
    return config.driveId;
  }

  const client = await getClient();
  const siteId = await getSiteId();
  const res = await client.get(`/sites/${siteId}/drive`);
  config.driveId = res.data.id;
  return config.driveId;
}

/**
 * Create a folder at the specified path if it doesn't already exist.
 */
export async function createFolder(
  parentPath: string,
  folderName: string,
): Promise<string> {
  const client = await getClient();
  const driveId = await getDriveId();

  const encodedPath = parentPath === '/' ? 'root' : `root:/${parentPath}:`;

  try {
    const res = await client.post(
      `/drives/${driveId}/items/${encodedPath}/children`,
      {
        name: folderName,
        folder: {},
        '@microsoft.graph.conflictBehavior': 'fail',
      },
    );
    return res.data.id;
  } catch (error: unknown) {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 409
    ) {
      // Folder already exists — get its ID
      const fullPath = parentPath === '/' ? folderName : `${parentPath}/${folderName}`;
      const res = await client.get(
        `/drives/${driveId}/root:/${fullPath}`,
      );
      return res.data.id;
    }
    throw error;
  }
}

/**
 * Ensure the full folder hierarchy exists:
 * Sustainability Documents/{year}/{category}/{subcategory}/{account}
 */
export async function ensureFolderStructure(
  year: string,
  category: string,
  subcategory: string,
  account: string,
): Promise<string> {
  await createFolder('/', 'Sustainability Documents');
  await createFolder('Sustainability Documents', year);
  await createFolder(`Sustainability Documents/${year}`, category);
  await createFolder(
    `Sustainability Documents/${year}/${category}`,
    subcategory,
  );
  const folderId = await createFolder(
    `Sustainability Documents/${year}/${category}/${subcategory}`,
    account,
  );
  return folderId;
}

/**
 * Upload a file to a specific folder in SharePoint.
 */
export async function uploadFile(
  folderPath: string,
  fileName: string,
  fileContent: ArrayBuffer | string,
): Promise<{id: string; webUrl: string}> {
  const client = await getClient();
  const driveId = await getDriveId();

  const encodedPath =
    folderPath === '/' ? 'root' : `root:/${folderPath}:`;

  const res = await client.put(
    `/drives/${driveId}/items/${encodedPath}:/${fileName}:/content`,
    fileContent,
    {
      headers: {
        'Content-Type': 'application/octet-stream',
      },
    },
  );

  return {
    id: res.data.id,
    webUrl: res.data.webUrl,
  };
}

/**
 * Upload a document to the structured folder hierarchy and return the URL.
 */
export async function uploadDocumentToStructuredFolder(
  year: string,
  category: string,
  subcategory: string,
  account: string,
  fileName: string,
  fileContent: ArrayBuffer | string,
): Promise<{id: string; webUrl: string}> {
  await ensureFolderStructure(year, category, subcategory, account);

  const folderPath = `Sustainability Documents/${year}/${category}/${subcategory}/${account}`;
  return uploadFile(folderPath, fileName, fileContent);
}
