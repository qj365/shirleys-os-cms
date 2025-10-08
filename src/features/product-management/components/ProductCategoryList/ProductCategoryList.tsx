import AppPageHeader from '@/components/AppPageHeader/AppPageHeader';
import AppTable from '@/components/AppTable';
import AppTableActionMenu from '@/components/AppTableActionMenu';
import OverlayPanelWrapper from '@/components/Overlays/OverlayPanelWrapper';
import {
  api,
  type AdminGetCategoriesResponse,
  type NumberedPagingResponse_AdminGetCategoriesResponse_Array_,
} from '@/lib/api/admin';
import { toastErrorMessage } from '@/utils/dataTypes/string';
import useDebounceSearch from '@/utils/hooks/useDebounceSearch';
import useHandleDeleteRecord from '@/utils/hooks/useHandleDeleteRecord';
import useHandlePagination from '@/utils/hooks/useHandlePagination';
import type { TPageInfo } from '@/utils/types';
import { Button, Input, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  isValidElement,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import AddEditProductCategoryPanel from './AddEditProductCategoryPanel';

export default function ProductCategoryList({ pageTitle }: TPageInfo) {
  const [isLoading, setIsLoading] = useState(true);

  const { pageSize, pageIndex, handleChangePageSize, handleChangePageIndex } =
    useHandlePagination();

  const { searchKeyword, debounceSearchFn } = useDebounceSearch();

  const [getCategoriesResponse, setGetCategoriesResponse] =
    useState<NumberedPagingResponse_AdminGetCategoriesResponse_Array_ | null>(
      null
    );
  const [isDeleting, setIsDeleting] = useState(false);

  const { onDeleteRecord } = useHandleDeleteRecord({
    isDeleting,
  });

  const handleGetCategories = useCallback(async () => {
    try {
      setIsLoading(true);

      const response = await api.admin.adminCategoryGetAll({
        pageSize,
        page: pageIndex,
        ...(searchKeyword && {
          name: searchKeyword,
        }),
      });
      setGetCategoriesResponse(response);
    } catch (err) {
      toastErrorMessage(err);
    } finally {
      setIsLoading(false);
    }
  }, [pageIndex, pageSize, searchKeyword]);

  const handleViewDetail = (
    item: AdminGetCategoriesResponse,
    label: ReactNode | string
  ) => (
    <OverlayPanelWrapper
      renderOverlayPanel={(open, setOpen) => (
        <AddEditProductCategoryPanel
          open={open}
          setOpen={setOpen}
          selectedProductCategory={item}
          onUpdateSuccess={handleGetCategories}
        />
      )}
    >
      {isValidElement(label) ? (
        label
      ) : (
        <span className="cursor-pointer">{label}</span>
      )}
    </OverlayPanelWrapper>
  );

  const renderDropdownItems = (item: AdminGetCategoriesResponse) => {
    return [
      {
        key: '1',
        label: handleViewDetail(item, 'Edit Category'),
      },

      ...(!item?._count?.products
        ? [
            {
              key: '2',
              label: (
                <span className="cursor-pointer text-error">
                  Delete Category
                </span>
              ),
              onClick: () => {
                const onConfirmDelete = async () => {
                  try {
                    setIsDeleting(true);

                    await api.admin.adminCategoryDelete({
                      id: item?.id,
                    });
                    void message.success('Deleted successfully');
                    handleGetCategories();
                  } catch (e) {
                    toastErrorMessage(e);
                  } finally {
                    setIsDeleting(false);
                  }
                };

                onDeleteRecord(item.name, () => onConfirmDelete());
              },
            },
          ]
        : []),
    ];
  };

  const tableColumns: ColumnsType<AdminGetCategoriesResponse> = [
    {
      title: 'Category Name',
      width: 250,
      dataIndex: 'name',
      render: (_, record) => handleViewDetail(record, record?.name),
    },
    {
      title: 'Number of Products',
      width: 200,
      dataIndex: '_count',
      render: values => <span>{values?.products || 0}</span>,
    },
    {
      key: 'actions',
      title: 'Actions',
      width: 150,
      fixed: 'right',
      align: 'center',
      render: (record: AdminGetCategoriesResponse) => {
        return <AppTableActionMenu items={renderDropdownItems(record)} />;
      },
    },
  ];

  useEffect(() => {
    handleGetCategories();
  }, [handleGetCategories]);

  return (
    <>
      <AppPageHeader title={pageTitle} />

      <div className="mb-6 flex items-center justify-between gap-x-2">
        <Input
          placeholder="Search by category name"
          onChange={e => debounceSearchFn(e?.target?.value)}
          allowClear
          className="max-w-70"
        />
        <OverlayPanelWrapper
          renderOverlayPanel={(open, setOpen) => (
            <AddEditProductCategoryPanel
              open={open}
              setOpen={setOpen}
              onUpdateSuccess={handleGetCategories}
            />
          )}
        >
          <Button type="primary">Create Category</Button>
        </OverlayPanelWrapper>
      </div>

      <AppTable
        rowKey={record => record.id}
        dataSource={getCategoriesResponse?.data || []}
        columns={tableColumns}
        loading={isLoading}
        mode="page"
        pagination={{
          total: getCategoriesResponse?.total || 0,
          current: pageIndex,
          pageSize,
          onChange: (p, ps) => {
            handleChangePageIndex(p);
            handleChangePageSize(ps);
          },
        }}
      />
    </>
  );
}
