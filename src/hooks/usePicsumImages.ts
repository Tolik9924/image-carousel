import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_LIMIT, API_URL } from '@/config/api';
import { api } from '@/api';

type PicsumImage = {
  id: string;
  author: string;
  width: number;
  height: number;
  url: string;
  download_url: string;
};

const buildImageUrl = (id: string): string => {
  return `${API_URL}/id/${id}/900/600`;
};

type UsePicsumImagesReturn = {
  images: string[];
  loading: boolean;
  error: string | null;
};

export const usePicsumImages = (): UsePicsumImagesReturn => {
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchImages = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data } = await api.get<PicsumImage[]>('/v2/list', {
          params: {
            page: 1,
            limit: API_LIMIT,
          },
          signal: controller.signal,
        });

        setImages(data.map((item) => buildImageUrl(item.id)));
      } catch (err) {
        if (axios.isCancel?.(err) || (err instanceof Error && err.name === 'CanceledError')) {
          return;
        }

        setError('Failed to load images. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchImages();

    return () => {
      controller.abort();
    };
  }, []);

  return { images, loading, error };
};
