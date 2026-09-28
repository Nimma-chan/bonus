import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { endpoints } from '../api/endpoints';
import { ErrorMessage } from '../components/ErrorMessage';
import { Loader } from '../components/Loader';
import { useFetch } from '../hooks/useFetch';
import type { Photo } from '../types';
import { simulateHeavyRender } from '../utils/simulateHeavyRender';

// ЗАДАЧА 6. Страница работает, но тормозит.
// Найдите проблемы производительности и исправьте их.
// Логику и внешний вид страницы менять не нужно.

const ALBUM_IDS = Array.from({ length: 100 }, (_, i) => i + 1);

type PhotoRowProps = {
  photo: Photo;
  isFavorite: boolean;
  onToggleFavorite: (id: number) => void;
}
//////////////////
const PhotoRow = memo(function PhotoRow({
  photo,
  isFavorite,
  onToggleFavorite,
}: PhotoRowProps) {
  simulateHeavyRender();

  return (
    <div className="photo-row">
      <span className="photo-row__id">#{photo.id}</span>
      <span className="photo-row__title">{photo.title}</span>
    <span className="muted">Альбом {photo.albumId}</span>
      <button type="button" className="button" onClick={() => onToggleFavorite(photo.id)}>
        {isFavorite ? 'Убрать' : 'В избранное'}
      </button>
    </div>
  )
});

export default function PhotosPage() {
  const { data: photos, isLoading, error, refetch } = useFetch<Photo[]>(endpoints.photos);

  const [query, setQuery] = useState('');
  const [albumId, setAlbumId] = useState('all');
const [sortOrder, setSortOrder]= useState<'asc' | 'desc'>('asc');
const [favorites, setFavorites] = useState<Set<number>>(() => new Set());
  const [secondsOnPage, setSecondsOnPage] = useState(0);

  useEffect(() => {
    const timer = setInterval(()  => setSecondsOnPage(s => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  
  const visiblePhotos = useMemo(() => {
    const list = photos ?? [];
    const q = query.toLowerCase();
    const album = albumId === 'all' ? null : Number(albumId);

    const filtered = list.filter(
       photo =>
        (album === null || photo.albumId === album) &&
        photo.title.toLowerCase().includes(q)
    )

    return [...filtered].sort((a, b) =>
      sortOrder === 'asc'
        ? a.title.localeCompare(b.title)
        : b.title.localeCompare(a.title)
    );
  }, [photos, query, albumId, sortOrder])
  const handleToggleFavorite = useCallback((id: number) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
      next.delete(id);
      }
       else {
        next.add(id);
      }
      return next;
    })
  }, [])
  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: visiblePhotos.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 56,
    overscan: 5,
  });

  if (isLoading) return <Loader text="Загружаем медиатеку..." />;
  if (error) return <ErrorMessage message={error} onRetry={refetch} />;

  return (
    <section>
      <h1>Медиатека</h1>
      <p className="muted">Вы на странице {secondsOnPage} с</p>

      <div className="toolbar">
        <input
          className="input"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Поиск по названию"
        />
        <select className="input" value={albumId} onChange={e => setAlbumId(e.target.value)}>
          <option value="all">Все альбомы</option>
          {ALBUM_IDS.map(id => (
            <option key={id} value={id}>
              Альбом {id}
            </option>
          ))}
        </select>
        <select
          className="input"
          value={sortOrder}
          onChange={e => setSortOrder(e.target.value as 'asc' | 'desc')}>
          <option value="asc">А–Я</option>
          <option value="desc">Я–А</option>
        </select>
      </div>

      <p>
        Показано: {visiblePhotos.length} из {photos?.length ?? 0}. В избранном: {favorites.size}
      </p>
      <div ref={parentRef} className="photo-list">
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualizer.getVirtualItems().map(virtualItem => {
            const photo = visiblePhotos[virtualItem.index];
            return (
              <div
                key={virtualItem.key}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              >
                <PhotoRow
                  photo={photo}
                  isFavorite={favorites.has(photo.id)}
                  onToggleFavorite={handleToggleFavorite}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}