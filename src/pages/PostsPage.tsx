import { useState } from 'react';
import { Pagination } from '../components/Pagination';
import { PostCard } from '../components/PostCard';
import { Loader } from '../components/Loader';
import { ErrorMessage } from '../components/ErrorMessage';
import { EmptyState } from '../components/EmptyState';
import { useFetch } from '../hooks/useFetch';
import { useDebounce } from '../hooks/useDebounce';
import { endpoints } from '../api/endpoints';
import type { Post } from '../types';

const POSTS_PER_PAGE = 10;

export default function PostsPage() {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);

  // TODO (задача 3.1): отложите query через useDebounce с задержкой 500 мс.
  const debouncedQuery = useDebounce(query, 500);

  // TODO (задача 3.2): загрузите посты через useFetch<Post[]>.
  //   URL возьмите из endpoints.posts({ page, query: debouncedQuery }).
  const url = endpoints.posts({ page, query: debouncedQuery });
  const { data, isLoading, error, refetch } = useFetch<Post[]>(url);

  // TODO (задача 3.3): вместо заглушки ниже используйте данные из хука.
  const posts: Post[] = data ?? [];

  function handleQueryChange(value: string) {
    setQuery(value);
// TODO (задача 3.4): при новом поиске возвращайте пользователя на первую страницу.
  }

  {/*
        TODO (задача 3.5): добавьте отображение состояний:
        - пока пользователь печатает (query !== debouncedQuery) -- «Печатаете...»;
        - загрузка -- компонент Loader;
        - ошибка -- ErrorMessage с кнопкой «Повторить» (refetch из useFetch);
        - пустой результат -- EmptyState «Ничего не найдено».
      */}
  const isTyping = query !== debouncedQuery;

       {/*
        TODO (задача 3.6): hasNext -- есть ли следующая страница.
        Если постов пришло меньше POSTS_PER_PAGE, следующей страницы нет.
        isDisabled -- блокируйте кнопки во время загрузки.
      */}
  const hasNext = posts.length === POSTS_PER_PAGE;

  return (
    <section>
      <h1>Посты</h1>

      <input
        className="input"
        value={query}
        onChange={e => handleQueryChange(e.target.value)}
        placeholder="Поиск по заголовку и тексту"
      />

      {/*
        TODO (задача 3.5): добавьте отображение состояний:
        - пока пользователь печатает (query !== debouncedQuery) -- «Печатаете...»;
        - загрузка -- компонент Loader;
        - ошибка -- ErrorMessage с кнопкой «Повторить» (refetch из useFetch);
        - пустой результат -- EmptyState «Ничего не найдено».
      */}
      {isTyping && <p>Печатаете...</p>}

      {isLoading && <Loader />}

      {!isLoading && error && (
        <ErrorMessage message={error} onRetry={refetch} />
      )}

      {!isLoading && !error && posts.length === 0 && (
        <EmptyState text="Ничего не найдено" />
      )}

      {!isLoading && !error && posts.length > 0 && (
        <ul className="list">
          {posts.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </ul>
      )}

      {/*
        TODO (задача 3.6): hasNext -- есть ли следующая страница.
        Если постов пришло меньше POSTS_PER_PAGE, следующей страницы нет.
        isDisabled -- блокируйте кнопки во время загрузки.
      */}
      {!error && (
        <Pagination
          page={page}
          hasNext={hasNext}
          isDisabled={isLoading}
          onChange={setPage}
        />
      )}
    </section>
  );
}