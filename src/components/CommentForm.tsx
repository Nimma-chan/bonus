import { useState, type FormEvent } from 'react';
import { useMutation } from '../hooks/useMutation';
import { endpoints } from '../api/endpoints';
import type { Comment } from '../types';

type CommentFormProps = {
  postId: number;
  onCreated: (comment: Comment) => void;
};

export function CommentForm({ postId, onCreated }: CommentFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [body, setBody] = useState('');

  // TODO (задача 5.1): подключите useMutation<Comment> для POST-запроса
  // на endpoints.comments. Уберите заглушки ниже и возьмите значения из хука.
  const { execute, isLoading, error } = useMutation<Comment>(endpoints.comments, {
    method: 'POST',
  });

  const isValid = name.trim() !== '' && email.trim() !== '' && body.trim() !== '';

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // TODO (задача 5.2):
    // 1. отправьте { postId, name, email, body } через execute;
    // 2. если сервер вернул комментарий -- передайте его в onCreated
    //    и очистите поля формы;
    // 3. если вернулся null -- поля не очищайте, ошибку покажет разметка ниже.
    const created=await execute({ postId, name, email, body });

    if (created) {
      onCreated({ ...created, id: Date.now() });
      setName('')
      setEmail('');
       setBody('') 
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <h3>Новый комментарий</h3>
      <input
        className="input"
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Тема"
      />
      <input
        className="input"
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Email"
      />
      <textarea
        className="input"
        rows={3}
        value={body}
        onChange={e => setBody(e.target.value)}
        placeholder="Текст комментария"
      />
      <button type="submit" className="button" disabled={!isValid || isLoading}>
        {isLoading ? 'Отправка...' : 'Отправить'}
      </button>
      {error && <p className="error-text">{error}</p>}
    </form>
  );
}