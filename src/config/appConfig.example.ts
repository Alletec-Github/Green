/**
 * App Configuration Template
 *
 * Copy this file to appConfig.ts and fill in your actual values:
 *   cp src/config/appConfig.example.ts src/config/appConfig.ts
 *
 * IMPORTANT: appConfig.ts is gitignored — never commit real secrets!
 */

export const AppConfig = {
  // ─── Business Central ───────────────────────────────────────────────
  businessCentral: {
    tenantId: 'YOUR_BC_TENANT_ID',
    clientId: 'YOUR_BC_CLIENT_ID',
    clientSecret: 'YOUR_BC_CLIENT_SECRET',
    environmentName: 'Production',
    apiBaseUrl:
      'https://api.businesscentral.dynamics.com/v2.0/YOUR_TENANT_ID/Production',
    companyId: 'YOUR_COMPANY_ID',
    companyName: 'YOUR_COMPANY_NAME',
    apiPublisher: 'alletec',
    apiGroup: 'sustainability',
    apiVersion: 'v2.0',
  },

  // ─── Azure Document Intelligence ───────────────────────────────────
  azureDocIntelligence: {
    endpoint: 'https://YOUR_RESOURCE.cognitiveservices.azure.com/',
    apiKey: 'YOUR_ADI_API_KEY',
    modelId: 'sustainability-electricitybills',
  },

  // ─── SharePoint (Graph API) ────────────────────────────────────────
  sharePoint: {
    tenantId: 'YOUR_SP_TENANT_ID',
    clientId: 'YOUR_SP_CLIENT_ID',
    clientSecret: 'YOUR_SP_CLIENT_SECRET',
    siteUrl: 'yourtenant.sharepoint.com:/sites/Sustainability',
    siteId: '',
    driveId: '',
  },

  // ─── Firebase ──────────────────────────────────────────────────────
  firebase: {
    enabled: false,
    projectId: '',
    fcmServerKey: '',
  },

  // ─── App Settings ─────────────────────────────────────────────────
  app: {
    name: 'Green',
    version: '1.0.0',
    primaryColor: '#0078D4',
    demoEmail: 'demo@alletec.com',
    demoPassword: 'Green@123',
  },
};

export type AppConfigType = typeof AppConfig;
