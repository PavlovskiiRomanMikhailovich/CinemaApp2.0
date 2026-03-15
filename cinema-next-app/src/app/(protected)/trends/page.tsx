import type { Metadata } from 'next';
import TrendsFeed from 'components/TrendsFeed/TrendsFeed';

export const metadata: Metadata = {
  title: 'Тренды | Cinema App',
  description: 'Вертикальная лента трейлеров',
};

const TrendsPage = () => {
  return <TrendsFeed />;
};

export default TrendsPage;
