import * as React from 'react';
import styles from './Text.module.scss' 
import classNames from 'classnames';
import { isTruthy } from 'utils/dataFromat';

export type TextProps = {
  className?: string;
  view?: 'title' | 'button' | 'p-20' | 'p-18' | 'p-16' | 'p-14';
  tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div' | 'p' | 'span';
  weight?: 'normal' | 'medium' | 'bold';
  children: React.ReactNode;
  color?: 'primary' | 'secondary' | 'accent';
  maxLines?: number;
};

const Text: React.FC<TextProps> = ({
  className,
  view,
  tag,
  weight,
  children,
  color,
  maxLines,
}) => {
  const Component: React.ElementType = tag || 'div';
  
  const classes = [
    classNames(
      styles.text,
      {
        [styles[`text--${view}`]]: view,
        [styles[`text--${weight}`]]: weight,
        [styles[`text--${color}`]]: color,
        [styles['text--clamp']]: maxLines
      }, className)
  ].filter(isTruthy).join(' ');

  const style = maxLines
    ? { WebkitLineClamp: maxLines }
    : undefined;

  return (
    <Component className={classes} style={style}>
      {children}
    </Component>
  );
};

export default Text;
