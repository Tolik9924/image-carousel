import { useState, useEffect } from 'react';
import { Carousel } from './components/Carousel/Carousel';
import './App.css';

interface PicsumImage {
  id: string;
  author: string;
  width: number;
  height: number;
  url: string;
  download_url: string;
}

function buildImageUrl(id: string): string {
  return `https://picsum.photos/id/${id}/900/600`;
}

export default function App() {
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    fetch('https://picsum.photos/v2/list?page=1&limit=15', {
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<PicsumImage[]>;
      })
      .then((data) => {
        setImages(data.map((item) => buildImageUrl(item.id)));
        setLoading(false);
      })
      .catch((err) => {
        if ((err as Error).name === 'AbortError') return;
        setError('Failed to load images. Please try again.');
        setLoading(false);
      });

    return () => controller.abort();
  }, []);

  return (
    <main className="app">
      <header className="app__header">
        <h1 className="app__title">Image Carousel</h1>
        <p className="app__subtitle">
          Click images to select &middot; Use arrow keys or drag to navigate
        </p>
      </header>

      <section className="app__carousel-section">
        {loading && (
          <div className="app__state">
            <div className="app__spinner" aria-label="Loading images" />
            <p>Loading images…</p>
          </div>
        )}
        {error && (
          <div className="app__state app__state--error">
            <p>{error}</p>
          </div>
        )}
        {!loading && !error && <Carousel images={images} />}
      </section>
    </main>
  );
}
