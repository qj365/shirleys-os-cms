import { useState } from 'react';

export const DEFAULT_PAGE_INDEX = 1;
export const DEFAULT_PAGE_SIZE = 10;

export default function useHandlePagination() {
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [pageIndex, setPageIndex] = useState(DEFAULT_PAGE_INDEX);

  const handleChangePageSize = (size: number) => {
    if (size === pageSize) return;

    setPageIndex(DEFAULT_PAGE_INDEX);
    setPageSize(size);
  };

  const handleChangePageIndex = (index: number) => {
    if (index === pageIndex) return;

    setPageIndex(index);
  };

  return { pageSize, pageIndex, handleChangePageSize, handleChangePageIndex };
}
