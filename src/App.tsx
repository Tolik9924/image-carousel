import { Carousel } from './components/Carousel/Carousel';
import { CarouselSkeleton } from './components/Carousel/CarouselSkeleton';
import { usePicsumImages } from './hooks/usePicsumImages';
import './App.css';

export default function App() {
  const { images, loading, error } = usePicsumImages();

  return (
    <main className="app">
      <header className="app__header">
        <h1 className="app__title">Image Carousel</h1>
        <p className="app__subtitle">
          Click images to select &middot; Use arrow keys or drag to navigate
        </p>
      </header>

      <section className="app__carousel-section">
        {loading && <CarouselSkeleton />}
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
