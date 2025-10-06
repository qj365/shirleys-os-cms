import AppPaperBox from '@/components/AppPaperBox';
import useQueryHandle from '@/utils/hooks/useQueryHandle';
import type { TableProps } from 'antd';
import { Table } from 'antd';
import type { ColumnGroupType, ColumnType } from 'antd/es/table';
import clsx from 'clsx';
import { useMemo } from 'react';
import style from './AppTable.module.scss';

interface AppTableProps<T> extends TableProps<T> {
  columns: (ColumnType<T> | ColumnGroupType<T>)[];
  totalCount?: number;
  mode?: 'page' | 'simple';
}

export const AppTable = <T,>({
  columns,
  totalCount,
  mode = 'page',
  ...tableProps
}: AppTableProps<T>) => {
  const {
    handleChangePageSize,
    handleChangePageIndex,
    pagination: { pageSize, pageIndex },
  } = useQueryHandle();

  const tableScrollWidth = useMemo(() => {
    return columns?.reduce((acc, cur) => acc + ((cur.width as number) ?? 0), 0);
  }, [columns]);

  return (
    <AppPaperBox
      className={clsx(
        'rounded-2xl',
        mode === 'simple' && 'rounded-none !shadow-none'
      )}
    >
      <Table
        className={clsx(
          style.customTable,
          mode === 'simple' && style.simpleTable,
          tableProps.rowSelection && style.rowSelectionTable
        )}
        pagination={{
          total: totalCount ?? 0,
          current: pageIndex,
          pageSize,
          showSizeChanger: true,
          hideOnSinglePage: true,
          onChange: (p, ps) => {
            handleChangePageIndex(p);
            handleChangePageSize(ps);
          },
          ...tableProps.pagination,
        }}
        scroll={{ x: tableScrollWidth }}
        columns={columns}
        {...tableProps}
      />
    </AppPaperBox>
  );
};

export default AppTable;
