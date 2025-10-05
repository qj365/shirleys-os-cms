import type { TableProps } from 'antd';
import { Table } from 'antd';
import clsx from 'clsx';
import AppPaperBox from 'components/AppPaperBox';
import { useMemo } from 'react';
import useQueryHandle from 'utils/hooks/useQueryHandle';
import style from './AppTable.module.scss';

type AppTableProps = TableProps & {
  totalCount?: number;
  mode?: 'page' | 'simple';
};

const AppTable = ({
  totalCount,
  mode = 'page',
  ...tableProps
}: AppTableProps) => {
  const {
    handleChangePageSize,
    handleChangePageIndex,
    pagination: { pageSize, pageIndex },
  } = useQueryHandle();

  const tableScrollWidth = useMemo(() => {
    return tableProps?.columns?.reduce(
      (acc, cur) => acc + ((cur.width as number) ?? 0),
      0
    );
  }, [tableProps.columns]);

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
        {...tableProps}
      />
    </AppPaperBox>
  );
};

export default AppTable;
