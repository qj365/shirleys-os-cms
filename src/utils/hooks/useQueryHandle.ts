import qs from 'qs';
import { useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { ObjectType } from 'utils/types';

type QueryHandleProps = {
  noPagination?: boolean;
};

export const DefaultPageIndex = 1;
export const DefaultPageSize = 10;

const useQueryHandle = <T extends ObjectType>(props?: QueryHandleProps) => {
  const { noPagination } = props || {};

  const navigate = useNavigate();
  const location = useLocation();

  const pathName = location.pathname;

  const queryParams = useMemo(
    () => qs.parse(location.search.replace('?', '')) as T,
    [location.search]
  );

  const { pageIndex, pageSize } = queryParams;

  const paginationData = useMemo(
    () => ({
      pageIndex: pageIndex ? +pageIndex : DefaultPageIndex,
      pageSize: pageSize ? +pageSize : DefaultPageSize,
    }),
    [pageIndex, pageSize]
  );

  const handleChangeFilter = useCallback(
    (values: T) => {
      const queryPayload = qs.stringify({
        ...values,
        ...(!noPagination && {
          pageIndex: DefaultPageIndex,
          pageSize: paginationData.pageSize,
        }),
      });
      navigate(`${pathName}?${queryPayload}`);
    },
    [navigate, noPagination, paginationData.pageSize, pathName]
  );

  const handleClearFilter = useCallback(() => {
    navigate(pathName);
  }, [navigate, pathName]);

  const handleChangePageIndex = useCallback(
    (index: number) => {
      if (index === paginationData.pageIndex) return;
      const queryPayload = qs.stringify({
        ...queryParams,
        pageIndex: index,
      });
      navigate(`${pathName}?${queryPayload}`);
    },
    [navigate, paginationData.pageIndex, pathName, queryParams]
  );

  const handleChangePageSize = useCallback(
    (size: number) => {
      if (size === paginationData.pageSize) return;
      const queryPayload = qs.stringify({
        ...queryParams,
        pageIndex: DefaultPageIndex,
        pageSize: size,
      });
      navigate(`${pathName}?${queryPayload}`);
    },
    [navigate, paginationData.pageSize, pathName, queryParams]
  );

  return {
    pagination: paginationData,
    queryParams,
    handleChangePageIndex,
    handleChangePageSize,
    handleChangeFilter,
    handleClearFilter,
  };
};

export default useQueryHandle;
