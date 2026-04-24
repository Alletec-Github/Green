import axios from 'axios';
import {TokenResponse} from '../types';

interface TokenCache {
  token: string;
  expiresAt: number;
}

const tokenCache: Map<string, TokenCache> = new Map();

/**
 * Acquire an OAuth2 token using client credentials flow.
 * Caches tokens and refreshes before expiry (with 5-minute buffer).
 */
export async function getClientCredentialsToken(
  tenantId: string,
  clientId: string,
  clientSecret: string,
  scope: string,
): Promise<string> {
  const cacheKey = `${tenantId}:${clientId}:${scope}`;
  const cached = tokenCache.get(cacheKey);

  // Return cached token if still valid (5 min buffer)
  if (cached && cached.expiresAt > Date.now() + 5 * 60 * 1000) {
    return cached.token;
  }

  const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;

  const params = new URLSearchParams();
  params.append('grant_type', 'client_credentials');
  params.append('client_id', clientId);
  params.append('client_secret', clientSecret);
  params.append('scope', scope);

  const response = await axios.post<TokenResponse>(tokenUrl, params.toString(), {
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
  });

  const {access_token, expires_in} = response.data;

  tokenCache.set(cacheKey, {
    token: access_token,
    expiresAt: Date.now() + expires_in * 1000,
  });

  return access_token;
}

/**
 * Clear all cached tokens (useful on logout).
 */
export function clearTokenCache(): void {
  tokenCache.clear();
}
