import React from 'react';
import Text from 'components/Text/Text.tsx';
import Badge from 'components/Badge/Badge.tsx';
import style from './Card.module.scss';
import classNames from 'classnames';

export type CardProps = {
    /** Дополнительный classname */
    className?: string,
    /** URL изображения */
    image: string;
    /** Слот над заголовком */
    captionSlot?: React.ReactNode;
    /** Заголовок карточки */
    title: React.ReactNode;
    /** Описание карточки */
    subtitle: React.ReactNode;
    /** Содержимое карточки (футер/боковая часть), может быть пустым */
    contentSlot?: React.ReactNode;
    /** Клик на карточку */
    onClick?: React.MouseEventHandler;
    /** Слот для действия */
    actionSlot?: React.ReactNode;
    /** Рейтинг фильма (для плашки) */
    rating?: number;  // ← добавляем
    /** Длительность фильма (для плашки) */
    duration?: number; // ← добавляем
};

const Card: React.FC<CardProps> = ({
  className,
  image,
  captionSlot,
  title,
  subtitle,
  contentSlot,
  onClick,
  actionSlot,
  rating,
  duration,
}) => {
  return (
    <div
      className={classNames(style.card, className)}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className={style["card__imageWrapper"]}>
        <img className={style["card__image"]} src={image} alt="" />
        <div className={style["card__badges"]}>
          {rating && <Badge type="rating" value={rating.toFixed(1)} />}
          {duration && <Badge type="duration" value={duration} />}
        </div>
      </div>

      <div className={style["card__body"]}>
        {captionSlot && (
          <Text className={style["card__caption"]} weight="medium" view="p-14" color="primary">
            {captionSlot}
          </Text>
        )}

        <Text className={style["card__title"]} weight="medium" view="p-20" color="primary" maxLines={1}>
          {title}
        </Text>

        <Text className={style["card__subtitle"]} weight="normal" view="p-16" color="secondary" maxLines={2}>
          {subtitle}
        </Text>
      </div>
      {(actionSlot) && (
        <div className={style["card__footer"]}>
          {actionSlot && (
            <div
              className={style["card__action"]}
              onClick={(e) => e.stopPropagation()}
            >
              {actionSlot}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Card;