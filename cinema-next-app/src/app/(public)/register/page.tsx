'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { observer } from 'mobx-react-lite';
import Input from 'components/Input/Input';
import Button from 'components/Button/Button';
import Text from 'components/Text/Text';
import { useAuthStore } from 'providers/StoreProvider';
import styles from './RegisterPage.module.scss';

const RegisterPage = observer(() => {
  const router = useRouter();
  const authStore = useAuthStore();
  
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setPasswordError('Пароли не совпадают');
      return;
    }
    setPasswordError('');

    try {
      await authStore.register(username, email, password);
      router.push('/');
      router.refresh();
    } catch (err) {
      console.error('Registration error:', err);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <Text tag="h1" color="primary" className={styles.title}>
          Регистрация
        </Text>

        {authStore.error && (
          <div className={styles.error}>
            {authStore.error}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <Input
            label="Имя пользователя"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Введите имя"
            required
            size="md"
          />

          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@mail.com"
            required
            size="md"
          />

          <Input
            label="Пароль"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Минимум 6 символов"
            required
            size="md"
          />

          <Input
            label="Подтверждение пароля"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Повторите пароль"
            required
            size="md"
            error={passwordError}
          />

          <Button 
            type="submit" 
            variant="filled" 
            disabled={authStore.loading}
            className={styles.button}
          >
            {authStore.loading ? 'Регистрация...' : 'Зарегистрироваться'}
          </Button>
        </form>

        <div className={styles.footer}>
          <Text color="secondary">Уже есть аккаунт?</Text>
          <Link href="/login" className={styles.link}>
            Войти
          </Link>
        </div>
      </div>
    </div>
  );
});

export default RegisterPage;
