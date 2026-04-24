<!-- Logo -->
<p align="center">
  <img src="https://alletec.com/wp-content/uploads/2023/01/alletec-logo.png" alt="Alletec Logo" width="200" />
</p>

<h1 align="center">🌱 Green</h1>

<p align="center">
  <strong>Sustainability Emissions Tracking App</strong><br />
  Built with React Native • Microsoft Business Central • Azure AI Document Intelligence
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React%20Native-0.80+-61DAFB?logo=react" />
  <img src="https://img.shields.io/badge/TypeScript-5.0+-3178C6?logo=typescript" />
  <img src="https://img.shields.io/badge/Business%20Central-SaaS-0078D4?logo=microsoft" />
  <img src="https://img.shields.io/badge/Azure%20AI-Document%20Intelligence-0089D6?logo=microsoft-azure" />
  <img src="https://img.shields.io/badge/Platform-iOS%20%7C%20Android-lightgrey" />
</p>

---

## 📋 Overview

**Green** is a mobile app designed for office staff and finance teams to track carbon emissions. Users upload utility bills, the app extracts data using Azure AI Document Intelligence, and submits sustainability journal entries to Microsoft Business Central's Sustainability module.

### Key Features

- **Bill Upload & AI Extraction** — Photograph or upload utility bills; Azure Document Intelligence extracts vendor, date, amount, and units automatically
- **Manual Entry** — Create sustainability journal entries with category/subcategory/account selection from Business Central
- **Dashboard** — Overview of emission statistics across Scope 1, 2, and 3 with drill-down navigation
- **History & Search** — View submitted entries and local drafts with powerful filtering
- **SharePoint Integration** — Uploaded documents are stored in a structured SharePoint folder hierarchy
- **Push Notifications** — Firebase Cloud Messaging for alerts and reminders
- **Offline Drafts** — Save entries locally and submit when ready

---

## 🏗️ Tech Stack & Architecture

| Layer | Technology |
|---|---|
| **Mobile Framework** | React Native 0.80+ with TypeScript |
| **Navigation** | React Navigation 7 (Bottom Tabs + Native Stack) |
| **HTTP Client** | Axios with OAuth2 interceptors |
| **ERP Backend** | Microsoft Business Central (Sustainability Module) |
| **AI Extraction** | Azure AI Document Intelligence (Custom Model) |
| **Document Storage** | SharePoint via Microsoft Graph API |
| **Push Notifications** | Firebase Cloud Messaging |
| **Local Storage** | @react-native-async-storage/async-storage |
| **File Handling** | react-native-blob-util + @react-native-documents/picker |

### Architecture Overview

```
┌─────────────────────────────────────────────────┐
│                  React Native App                │
│  ┌───────────┐ ┌───────────┐ ┌───────────────┐  │
│  │ Dashboard  │ │  Upload   │ │ Manual Entry  │  │
│  │  Screen    │ │  Screen   │ │   Screen      │  │
│  └─────┬─────┘ └─────┬─────┘ └──────┬────────┘  │
│        │             │               │           │
│  ┌─────▼─────────────▼───────────────▼────────┐  │
│  │        Centralized API Service Layer        │  │
│  │  ┌──────────┐ ┌──────────┐ ┌────────────┐  │  │
│  │  │ BC Auth  │ │ Graph API│ │  Azure DI  │  │  │
│  │  │ (OAuth2) │ │ (OAuth2) │ │  (API Key) │  │  │
│  │  └────┬─────┘ └────┬─────┘ └─────┬──────┘  │  │
│  └───────┼────────────┼─────────────┼──────────┘  │
└──────────┼────────────┼─────────────┼─────────────┘
           │            │             │
     ┌─────▼─────┐ ┌────▼─────┐ ┌────▼──────────────┐
     │ Business  │ │SharePoint│ │ Azure Document    │
     │ Central   │ │ (Graph)  │ │ Intelligence      │
     └───────────┘ └──────────┘ └───────────────────┘
```

### Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── FormFields.tsx
│   ├── ModalPicker.tsx
│   ├── LoadingOverlay.tsx
│   ├── StatCard.tsx
│   ├── EmptyState.tsx
│   ├── SectionHeader.tsx
│   └── ActionButton.tsx
├── config/
│   ├── appConfig.ts          # Real config (gitignored)
│   └── appConfig.example.ts  # Template for developers
├── navigation/
│   └── AppNavigator.tsx
├── screens/
│   ├── LoginScreen.tsx
│   ├── DashboardScreen.tsx
│   ├── UploadScreen.tsx
│   ├── ManualEntryScreen.tsx
│   ├── HistoryScreen.tsx
│   └── SettingsScreen.tsx
├── services/
│   ├── bcService.ts          # Business Central API
│   ├── sharepointService.ts  # SharePoint Graph API
│   ├── adiService.ts         # Azure Document Intelligence
│   └── authService.ts        # OAuth2 token management
├── theme/
│   └── index.ts              # Colors, spacing, typography
├── types/
│   └── index.ts              # TypeScript interfaces
└── utils/
    └── index.ts              # Helper functions
```

---

## 🔧 Prerequisites Setup

### 1. Business Central Setup

#### Enable the Sustainability Module

1. Open Business Central and navigate to **Assisted Setup**
2. Search for **"Sustainability Setup"** and run the wizard
3. Enable the sustainability module and configure:
   - Chart of Sustainability Accounts
   - Sustainability Categories and Subcategories
   - ESG Locations
4. Ensure sustainability journal entries can be created manually to verify the setup

#### Publish Custom APIs

The app requires custom API pages published in Business Central. You need to publish API pages for:

| API Endpoint | BC Object | Purpose |
|---|---|---|
| `sustainabilityCategories` | API Page | Fetch emission categories |
| `sustainabilitySubcategories` | API Page | Fetch subcategories |
| `sustainabilityAccounts` | API Page | Fetch chart of accounts |
| `sustainabilityJournalEntries` | API Page | CRUD journal entries |
| `esgLocations` | API Page | Fetch ESG locations |
| `vendors` | API Page | Fetch vendor list |

Publish these under:
- **API Publisher:** `alletec`
- **API Group:** `sustainability`
- **API Version:** `v2.0`

Resulting endpoint pattern:
```
https://api.businesscentral.dynamics.com/v2.0/{tenantId}/{environment}/api/alletec/sustainability/v2.0/companies({companyId})/{endpoint}
```

#### Register an Entra ID (Azure AD) App

1. Go to [Azure Portal → App Registrations](https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps/ApplicationsListBlade)
2. Click **New registration**
3. Name: `Green-Sustainability-App`
4. Supported account types: **Single tenant**
5. After creation, note the **Application (client) ID** and **Directory (tenant) ID**
6. Go to **Certificates & secrets** → **New client secret** → Copy the value
7. Go to **API permissions** → **Add a permission**:
   - Select **Dynamics 365 Business Central**
   - Choose **Application permissions**
   - Add: `API.ReadWrite.All`, `Automation.ReadWrite.All`
8. Click **Grant admin consent**

---

### 2. Azure Document Intelligence Setup

#### Create the ADI Resource

1. Go to [Azure Portal](https://portal.azure.com)
2. Create a new **Document Intelligence** resource (formerly Form Recognizer)
3. Choose a pricing tier (F0 free tier works for development)
4. After deployment, go to **Keys and Endpoint**
5. Copy **Endpoint** and **Key 1**

#### Train a Custom Extraction Model

1. Go to [Document Intelligence Studio](https://formrecognizer.appliedai.azure.com/studio)
2. Select **Custom extraction model**
3. Create a new project and connect to your Azure resource
4. Upload 5+ sample utility bills (electricity, gas, water)
5. Label the following fields on each document:
   - `billDate` — The billing date
   - `vendorName` — Utility company name
   - `amount` — Total amount or consumption value
   - `units` — Unit of measurement (kWh, therms, gallons, etc.)
   - `accountNumber` — Account/customer number (optional)
6. Train the model
7. Note the **Model ID** (e.g., `sustainability-electricitybills`)

---

### 3. SharePoint Setup

#### Create a SharePoint Site

1. Go to [SharePoint Admin Center](https://admin.microsoft.com/sharepoint)
2. Create a new **Team Site** named "Sustainability"
3. Note the site URL: `yourtenant.sharepoint.com/sites/Sustainability`

#### Register an Entra ID App for Graph API

1. Register a new app (or reuse the BC app if permissions allow)
2. Add **API permissions**:
   - Microsoft Graph → Application → `Sites.ReadWrite.All`
   - Microsoft Graph → Application → `Files.ReadWrite.All`
3. Grant admin consent
4. Note the Client ID and Client Secret

#### Folder Structure Convention

The app creates the following folder hierarchy automatically:

```
Sustainability Documents/
├── 2025/
│   ├── Scope 1 - Direct Emissions/
│   │   ├── Natural Gas/
│   │   │   └── Heating Account/
│   │   │       ├── invoice-jan-2025.pdf
│   │   │       └── invoice-feb-2025.pdf
│   │   └── Fleet Fuel/
│   ├── Scope 2 - Indirect Emissions/
│   │   ├── Electricity/
│   │   │   └── Main Office/
│   │   └── District Heating/
│   └── Scope 3 - Value Chain/
│       └── Business Travel/
├── 2026/
│   └── ...
```

---

### 4. Firebase Setup (Optional — Push Notifications)

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project or select an existing one
3. Add an **Android app** and download `google-services.json`
4. Add an **iOS app** and download `GoogleService-Info.plist`
5. Enable **Cloud Messaging** in the Firebase project settings
6. Note the **FCM Server Key** from Project Settings → Cloud Messaging

Place the Firebase config files:
- Android: `android/app/google-services.json`
- iOS: `ios/Green/GoogleService-Info.plist`

---

## 🚀 Local Development Setup

### Prerequisites

- **Node.js** 18+ and npm/yarn
- **React Native CLI** (`npx react-native`)
- **Xcode** 15+ (for iOS) with CocoaPods
- **Android Studio** with Android SDK 34+
- **Java** 17+
- **Git**

### Installation

```bash
# Clone the repository
git clone https://github.com/Alletec-Github/Green.git
cd Green

# Install dependencies
npm install

# iOS only: Install CocoaPods
cd ios && pod install && cd ..

# Copy config template and fill in your values
cp src/config/appConfig.example.ts src/config/appConfig.ts
# Edit src/config/appConfig.ts with your actual API keys and endpoints
```

### Configuration

Open `src/config/appConfig.ts` and fill in all the required values:

```typescript
export const AppConfig = {
  businessCentral: {
    tenantId: 'your-tenant-id',
    clientId: 'your-client-id',
    clientSecret: 'your-client-secret',
    environmentName: 'Production',
    apiBaseUrl: 'https://api.businesscentral.dynamics.com/v2.0/...',
    companyId: 'your-company-id',
    apiPublisher: 'alletec',
    apiGroup: 'sustainability',
  },
  azureDocIntelligence: {
    endpoint: 'https://your-resource.cognitiveservices.azure.com/',
    apiKey: 'your-api-key',
    modelId: 'your-model-id',
  },
  sharePoint: {
    tenantId: 'your-sp-tenant-id',
    clientId: 'your-sp-client-id',
    clientSecret: 'your-sp-client-secret',
    siteUrl: 'alletec.sharepoint.com:/sites/Sustainability',
  },
  // ... see appConfig.example.ts for full structure
};
```

### Running the App

```bash
# Start Metro bundler
npx react-native start

# Run on iOS
npx react-native run-ios

# Run on Android
npx react-native run-android
```

---

## 📱 Screenshots

> Screenshots will be added after the initial release.

| Login | Dashboard | Upload | Manual Entry | History |
|---|---|---|---|---|
| *Coming soon* | *Coming soon* | *Coming soon* | *Coming soon* | *Coming soon* |

---

## 🤝 Contributing

1. Create a feature branch from `main`
2. Follow the existing code style and TypeScript conventions
3. Ensure all services use the centralized API layer (no hardcoded secrets)
4. Open a PR with a clear description

---

## 📄 License

Proprietary — Alletec Solutions. All rights reserved.
