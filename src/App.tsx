import { lazy, Suspense, type ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Loader } from './components/Loader';

// TODO (задача 7): сейчас код всех страниц попадает в один бандл.
// Переведите импорты страниц на React.lazy и добавьте Suspense с fallback.

const PostsPage = lazy(() => import('./pages/PostsPage'));
const PostPage = lazy(() => import('./pages/PostPage'))
const UsersPage = lazy(() => import('./pages/UsersPage'))
const PhotosPage = lazy(() => import('./pages/PhotosPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

function withSuspense(node: ReactNode, text = 'Загружаем страницу...') {
  return <Suspense fallback={<Loader text={text} />}>{node}</Suspense>;
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/posts" replace />} />
        <Route path="/posts" element={withSuspense(<PostsPage />, 'Загружаем посты...')} />
        <Route path="/posts/:postId" element={withSuspense(<PostPage />, 'Загружаем пост...')} />
        <Route path="/users" element={withSuspense(<UsersPage />, 'Загружаем авторов...')} />
        <Route path="/photos" element={withSuspense(<PhotosPage />, 'Загружаем медиатеку...')} />
        <Route path="*" element={withSuspense(<NotFoundPage />)} />
      </Route>
    </Routes>
  );
}