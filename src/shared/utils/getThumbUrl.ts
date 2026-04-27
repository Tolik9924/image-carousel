export const getThumbUrl = (url: string): string => {
  const match = url.match(/\/id\/(\d+)\//);
  if (match) return `https://picsum.photos/id/${match[1]}/160/120`;
  return url;
};
