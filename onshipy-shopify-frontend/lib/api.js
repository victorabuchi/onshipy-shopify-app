import { getSessionToken } from '@shopify/app-bridge-utils';
import { useAppBridge } from '@shopify/app-bridge-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// For use inside React components with App Bridge
export const useApi = () => {
  let app;
  try {
    app = useAppBridge();
  } catch {
    app = null;
  }

  const request = async (path, options = {}) => {
    let headers = { 'Content-Type': 'application/json', ...options.headers };

    if (app) {
      try {
        const token = await getSessionToken(app);
        headers['Authorization'] = `Bearer ${token}`;
      } catch {}
    }

    const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
    return res;
  };

  return { request };
};

// For use outside React (plain fetch with shop param)
export const apiRequest = async (path, options = {}, token = null) => {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  return res;
};

export default API_BASE;