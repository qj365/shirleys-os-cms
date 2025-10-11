import AppPageHeader from '@/components/AppPageHeader/AppPageHeader';
import AppPaperBox from '@/components/AppPaperBox';
import AppTable from '@/components/AppTable';
import AppTableActionMenu from '@/components/AppTableActionMenu';
import {
  _36_Enums_ProductStatus,
  api,
  type GetProductsResponse,
} from '@/lib/api/admin';
import type { NumberedPagingResponse_GetProductsResponse_Array_ } from '@/lib/api/customer';
import { getPath } from '@/routers/router-paths';
import { formatDisplayedNumber } from '@/utils/dataTypes/number';
import {
  formatDisplayCurrency,
  toastErrorMessage,
} from '@/utils/dataTypes/string';
import useDebounceSearch from '@/utils/hooks/useDebounceSearch';
import useHandleDeleteRecord from '@/utils/hooks/useHandleDeleteRecord';
import useHandlePagination from '@/utils/hooks/useHandlePagination';
import type { TPageInfo } from '@/utils/types';
import {
  Avatar,
  Button,
  Input,
  message,
  Tabs,
  Tag,
  Tooltip,
  type TabsProps,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ProductList({ pageTitle }: TPageInfo) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  const [tabActiveKey, setTabActiveKey] = useState<string>('ALL');

  const { onDeleteRecord } = useHandleDeleteRecord({
    isDeleting,
  });

  const { searchKeyword, debounceSearchFn } = useDebounceSearch();

  const { pageSize, pageIndex, handleChangePageSize, handleChangePageIndex } =
    useHandlePagination();

  const [getProductsResponse, setGetProductsResponse] =
    useState<NumberedPagingResponse_GetProductsResponse_Array_ | null>(null);

  const handleGetProducts = useCallback(async () => {
    try {
      setIsLoading(true);

      const response = await api.product.getProducts({
        pageSize,
        page: pageIndex,
        ...(searchKeyword && {
          keyword: searchKeyword,
        }),
      });
      setGetProductsResponse(response);
    } catch (err) {
      toastErrorMessage(err);
    } finally {
      setIsLoading(false);
    }
  }, [pageIndex, pageSize, searchKeyword]);

  const countProductsByStatus = (status: string) => {
    if (status === 'ALL') return getProductsResponse?.data?.length || 0;

    return (
      getProductsResponse?.data?.filter(item => item?.status === status)
        ?.length || 0
    );
  };

  const items: TabsProps['items'] = [
    {
      key: 'ALL',
      label: `All (${countProductsByStatus('ALL')})`,
    },
    {
      key: _36_Enums_ProductStatus.ACTIVE.toString(),
      label: `Active (${countProductsByStatus(_36_Enums_ProductStatus.ACTIVE)})`,
    },
    {
      key: _36_Enums_ProductStatus.INACTIVE.toString(),
      label: `Inactive (${countProductsByStatus(_36_Enums_ProductStatus.INACTIVE)})`,
    },
  ];

  const renderDropdownItems = (item: GetProductsResponse) => {
    return [
      {
        key: '1',
        label: <span>Edit Product</span>,
      },

      {
        key: '2',
        label: <span>Duplicate Product</span>,
        onClick: () => {
          navigate(
            getPath('productDetailPage', 'create', `duplicateId=${item.id}`)
          );
        },
      },

      {
        key: '3',
        label: (
          <span className="cursor-pointer text-error">Delete Product</span>
        ),
        onClick: () => {
          const onConfirmDelete = async () => {
            try {
              setIsDeleting(true);

              await api.product.deleteProduct({
                id: item?.id,
              });
              void message.success('Deleted successfully');
              handleGetProducts();
            } catch (e) {
              toastErrorMessage(e);
            } finally {
              setIsDeleting(false);
            }
          };

          onDeleteRecord(item.name, () => onConfirmDelete());
        },
      },
    ];
  };

  const tableColumns: ColumnsType<GetProductsResponse> = [
    {
      title: 'Product',
      width: 400,
      dataIndex: 'name',
      render: (_, record) => {
        return (
          <div className="flex items-center justify-start gap-2">
            <Avatar
              src={record.image}
              shape="square"
              size={48}
              className="shrink-0"
            />
            <div>
              <Tooltip
                placement="bottomLeft"
                title={record.name}
                className="block max-w-100 overflow-hidden text-ellipsis whitespace-nowrap"
              >
                {record.name}
              </Tooltip>

              <div className="text-sm font-semibold">
                SKU: <span className="text-primary">{record.sku}</span>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      title: 'Price',
      width: 200,
      dataIndex: 'prices',
      render: prices => {
        const { min, max } = prices || {};
        if (!max || min === max)
          return (
            <span className="font-semibold text-primary">
              {formatDisplayCurrency(min)}
            </span>
          );

        return (
          <span className="font-semibold text-primary">{`${formatDisplayCurrency(min)} - ${formatDisplayCurrency(max)}`}</span>
        );
      },
    },

    {
      title: 'Stock',
      width: 200,
      dataIndex: 'stock',
      render: stock => {
        const { min, max } = stock || {};
        if (!max || min === max)
          return <span>{formatDisplayedNumber(min)}</span>;

        return (
          <span>{`${formatDisplayedNumber(min)} - ${formatDisplayedNumber(max)}`}</span>
        );
      },
    },

    {
      title: 'Status',
      width: 200,
      dataIndex: 'status',
      render: (status: string) => {
        return (
          <Tag
            color={
              status === _36_Enums_ProductStatus.ACTIVE ? 'green' : 'default'
            }
            className="flex min-w-20 shrink-0 items-center justify-center"
          >
            {status}
          </Tag>
        );
      },
    },

    {
      title: 'Category',
      width: 200,
      dataIndex: ['category', 'name'],
    },
    {
      key: 'actions',
      title: 'Actions',
      width: 100,
      fixed: 'right',
      align: 'center',
      render: (record: GetProductsResponse) => {
        return (
          <div className="h-full w-full" onClick={e => e.stopPropagation()}>
            <AppTableActionMenu items={renderDropdownItems(record)} />
          </div>
        );
      },
    },
  ];

  const handleRowClick = (record: GetProductsResponse) => {
    navigate(getPath('productDetailPage', record?.id?.toString()));
  };

  useEffect(() => {
    handleGetProducts();
  }, [handleGetProducts]);

  return (
    <>
      <AppPageHeader title={pageTitle} />

      <div className="mb-6 flex items-center justify-between gap-x-2">
        <Input
          placeholder="Search by Product Name, SKU"
          onChange={e => debounceSearchFn(e?.target?.value)}
          allowClear
          className="max-w-70"
        />
        <Button
          type="primary"
          onClick={() => navigate(getPath('productDetailPage', 'create'))}
        >
          Create Product
        </Button>
      </div>

      <AppPaperBox className="p-4">
        <Tabs
          activeKey={tabActiveKey}
          items={items}
          onChange={setTabActiveKey}
          className="[&_.ant-tabs-tab]:!min-w-25 [&_.ant-tabs-tab]:!text-base"
        />
        <AppTable
          rowKey={record => record.id}
          dataSource={(getProductsResponse?.data || []).filter(item => {
            if (tabActiveKey === 'ALL') return true;

            return item.status === tabActiveKey;
          })}
          columns={tableColumns}
          loading={isLoading}
          mode="simple"
          pagination={{
            total: getProductsResponse?.total || 0,
            current: pageIndex,
            pageSize,
            onChange: (p, ps) => {
              handleChangePageIndex(p);
              handleChangePageSize(ps);
            },
          }}
          onRow={record => ({
            onClick: () => handleRowClick(record),
            className: 'cursor-pointer',
          })}
        />
      </AppPaperBox>
    </>
  );
}
