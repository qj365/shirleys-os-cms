import { Image, Skeleton } from 'antd';
import type { ImageProps } from 'rc-image';
import { useState } from 'react';
import styles from './AppImage.module.scss';

const AppImage = ({ ...imageProps }: ImageProps) => {
  const [error, setError] = useState(false);

  return (
    <div className={styles.appImage}>
      {error ? (
        <Skeleton.Image className="!h-full !w-full" />
      ) : (
        <Image
          className="!h-full !w-full object-cover object-center"
          placeholder={<Skeleton.Image active className="!h-full !w-full" />}
          onError={() => setError(true)}
          {...imageProps}
        />
      )}
    </div>
  );
};

export default AppImage;
