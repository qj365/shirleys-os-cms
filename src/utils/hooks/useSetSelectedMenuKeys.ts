import { useAppInfoStore } from '@/lib/stores/appInfoStore';
import { useEffect } from 'react';

type UseSetSelectedMenuKeysProps = {
  selectedMenuKeys: string[];
};

const useSetSelectedMenuKeys = ({
  selectedMenuKeys,
}: UseSetSelectedMenuKeysProps) => {
  const { setSelectedMenuKeys } = useAppInfoStore();

  useEffect(() => {
    setSelectedMenuKeys(selectedMenuKeys);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};

export default useSetSelectedMenuKeys;
