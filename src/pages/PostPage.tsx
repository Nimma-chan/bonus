import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { endpoints } from '../api/endpoints';
import { Loader } from '../components/Loader';
import { ErrorMessage } from '../components/ErrorMessage';
import { EmptyState } from '../components/EmptyState';
import { AuthorBadge } from '../components/AuthorBadge';
import { CommentList } from '../components/CommentList';
import { CommentForm } from '../components/CommentForm';
import type { Post, Comment } from '../types';

/**
 * TODO (задача 4): соберите страницу поста.
 *
 * 1. Загрузите пост: useFetch<Post>(endpoints.post(postId)).
 * 2. Загрузите комментарии: useFetch<Comment[]>(endpoints.postComments(postId)).
 * 3. Обработайте состояния поста:
 *    - загрузка -- Loader;
 *    - статус 404 -- сообщение «Пост не найден» и ссылка на /posts
 *      (проверьте на адресе /posts/9999);
 *    - любая другая ошибка -- ErrorMessage с кнопкой «Повторить».
 * 4. Покажите заголовок и текст поста, под ними -- <AuthorBadge userId={post.userId} />.
 * 5. Покажите комментарии через CommentList (со своими состояниями загрузки и ошибки).
 * 6. Под списком -- CommentForm. Новый комментарий храните в локальном state
 *    и выводите вместе с загруженными.
 *
 * Подсказка: jsonplaceholder не сохраняет данные и всегда возвращает id: 501.
 * Чтобы key не повторялся, перед добавлением замените id, например на Date.now().
 */
export default function PostPage() {
  const { postId = '' } = useParams();

  
  const {
    data: post,
    isLoading: postLoading,
    error: postError,
    status: postStatus,
    refetch: refetchPost,
  } = useFetch<Post>(endpoints.post(postId))

  const {
    data: fetchedComments,
    isLoading: commentsLoading,
    error: commentsError,
    refetch: refetchComments,
  } = useFetch<Comment[]>(endpoints.postComments(postId));

  const [newComments, setNewComments] = useState<Comment[]>([]);

  const allComments: Comment[] = [...(fetchedComments ?? []), ...newComments]
  if (postStatus === 404) {
    return (
      <section>
        <Link to="/posts" className="back-link">
          ← К списку постов
        </Link>
        <EmptyState text="Пост не найден" />
      </section>
    );
  }

  if (postLoading) return <Loader />;

  if (postError) {
    return (
      <section>
        <Link to="/posts" className="back-link">
          ← К списку постов
        </Link>
        <ErrorMessage message={postError} onRetry={refetchPost} />
      </section>
    );
  }

  if (!post) return null;

  return (
    <section>
      <Link to="/posts" className="back-link">
        ← К списку постов
      </Link>

      <h1>{post.title}</h1>
      <AuthorBadge userId={post.userId} />
      <p>{post.body}</p>
      <h2>Комментарии</h2>


      {commentsLoading && <Loader />}

    {!commentsLoading && commentsError && (
        <ErrorMessage message={commentsError} onRetry={refetchComments} />
      )}
      {!commentsLoading && !commentsError && allComments.length === 0 && (
        <EmptyState text="Комментариев пока нет" />
      )}
      {!commentsLoading && !commentsError && allComments.length > 0 && (
        <CommentList comments={allComments} />
      )}

      <CommentForm
        postId={post.id}
        onCreated={comment => setNewComments(prev => [...prev, comment])}
      />
    </section>
  );
}