import AppPaperBox from '@/components/AppPaperBox';
import type { TableProps } from 'antd';
import { Table } from 'antd';
import type { ColumnGroupType, ColumnType } from 'antd/es/table';
import clsx from 'clsx';
import { useMemo } from 'react';
import style from './AppTable.module.scss';

interface AppTableProps<T> extends TableProps<T> {
  columns: (ColumnType<T> | ColumnGroupType<T>)[];
  mode?: 'page' | 'simple';
}

export const AppTable = <T,>({
  columns,
  mode = 'page',
  ...tableProps
}: AppTableProps<T>) => {
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
          showSizeChanger: true,
          hideOnSinglePage: true,
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
