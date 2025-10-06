import { Skeleton } from 'antd';
import { fillArrayWithNumber } from '@/utils/dataTypes/array';

type AnimatedSkeletonLoaderProps = {
  rows?: number;
};

const AnimatedSkeletonLoader = ({ rows = 5 }: AnimatedSkeletonLoaderProps) => {
  return (
    <div className="flex flex-col gap-y-4 pb-4">
      {fillArrayWithNumber(rows).map(item => (
        <Skeleton active key={item} />
      ))}
    </div>
  );
};

export default AnimatedSkeletonLoader;
