import { API_URL } from '@/config/api';

export const getThumbUrl = (url: string): string => {
  const match = url.match(/\/id\/(\d+)\//);
  if (match) return `${API_URL}/id/${match[1]}/160/120`;
  return url;
};
