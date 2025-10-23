import AppTable from '@/components/AppTable';
import AppTableActionMenu from '@/components/AppTableActionMenu';
import OverlayPanelWrapper from '@/components/Overlays/OverlayPanelWrapper';
import { api, type AdminGetCookingClassesResponse } from '@/lib/api/admin';
import {
  formatDisplayCurrency,
  toastErrorMessage,
} from '@/utils/dataTypes/string';
import useDebounceSearch from '@/utils/hooks/useDebounceSearch';
import useHandleDeleteRecord from '@/utils/hooks/useHandleDeleteRecord';
import useHandlePagination from '@/utils/hooks/useHandlePagination';
import { Button, Drawer, Input, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  isValidElement,
  useCallback,
  useEffect,
  useState,
  type Dispatch,
  type ReactNode,
} from 'react';
import AddEditCookingClass from './AddEditCookingClass';

type Props = {
  open: boolean;
  setOpen: Dispatch<boolean>;
  onDataChange?: () => void;
};

export default function CookingClassList({
  open,
  setOpen,
  onDataChange,
}: Props) {
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [cookingClasses, setCookingClasses] = useState<
    AdminGetCookingClassesResponse[]
  >([]);

  const { onDeleteRecord } = useHandleDeleteRecord({
    isDeleting,
  });

  const { searchKeyword, debounceSearchFn } = useDebounceSearch();

  const { pageSize, pageIndex, handleChangePageSize, handleChangePageIndex } =
    useHandlePagination();

  const handleGetCookingClasses = useCallback(async () => {
    try {
      setIsLoading(true);

      const response = await api.cookingClass.getCookingClasses({
        ...(searchKeyword && {
          name: searchKeyword,
        }),
      });
      setCookingClasses(response);
    } catch (err) {
      toastErrorMessage(err);
    } finally {
      setIsLoading(false);
    }
  }, [searchKeyword]);

  const handleDeleteCookingClass = useCallback(
    async (id: number) => {
      try {
        setIsDeleting(true);
        await api.cookingClass.deleteCookingClass({ id });
        message.success('Cooking class deleted successfully');
        handleGetCookingClasses();
        onDataChange?.(); // Notify parent component about data change
      } catch (err) {
        message.error('Failed to delete cooking class');
      } finally {
        setIsDeleting(false);
      }
    },
    [handleGetCookingClasses, onDataChange]
  );

  const handleViewDetail = (
    item: AdminGetCookingClassesResponse,
    label: ReactNode | string
  ) => (
    <OverlayPanelWrapper
      renderOverlayPanel={(open, setOpen) => (
        <AddEditCookingClass
          open={open}
          setOpen={setOpen}
          selectedCookingClass={item}
          onUpdateSuccess={() => {
            handleGetCookingClasses();
            onDataChange?.(); // Notify parent component about data change
          }}
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

  const renderDropdownItems = (item: AdminGetCookingClassesResponse) => {
    return [
      {
        key: '1',
        label: handleViewDetail(item, 'Edit Class'),
      },
      {
        key: '2',
        label: <span className="text-red-500">Delete Class</span>,
        onClick: () => {
          onDeleteRecord(item.name, () => handleDeleteCookingClass(item.id));
        },
      },
    ];
  };

  const columns: ColumnsType<AdminGetCookingClassesResponse> = [
    {
      title: 'Image',
      dataIndex: 'image',
      key: 'image',
      width: 80,
      render: (image: string, record: AdminGetCookingClassesResponse) =>
        handleViewDetail(
          record,
          <img
            src={image}
            alt="Cooking class"
            className="h-12 w-12 rounded-lg object-cover"
          />
        ),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (name: string, record: AdminGetCookingClassesResponse) =>
        handleViewDetail(
          record,
          <div className="font-medium text-gray-900">{name}</div>
        ),
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      key: 'duration',
      width: 100,
      render: (duration: number, record: AdminGetCookingClassesResponse) =>
        handleViewDetail(
          record,
          <div className="font-medium text-gray-900">{duration} minutes</div>
        ),
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
      width: 200,
      render: (address: string, record: AdminGetCookingClassesResponse) =>
        handleViewDetail(
          record,
          <div className="font-medium text-gray-900">{address}</div>
        ),
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      width: 100,
      render: (price: number, record: AdminGetCookingClassesResponse) =>
        handleViewDetail(
          record,
          <div className="font-medium text-gray-900">
            {formatDisplayCurrency(price)}
          </div>
        ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <AppTableActionMenu items={renderDropdownItems(record)} />
      ),
    },
  ];

  useEffect(() => {
    handleGetCookingClasses();
  }, [handleGetCookingClasses]);

  return (
    <Drawer
      open={open}
      onClose={() => setOpen(false)}
      footer={null}
      width={1024}
      title={'Cooking Class List'}
    >
      <div>
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Input
              placeholder="Search cooking classes..."
              onChange={e => debounceSearchFn(e.target.value)}
              className="w-64"
            />
          </div>
          <OverlayPanelWrapper
            renderOverlayPanel={(open, setOpen) => (
              <AddEditCookingClass
                open={open}
                setOpen={setOpen}
                onUpdateSuccess={() => {
                  handleGetCookingClasses();
                  onDataChange?.(); // Notify parent component about data change
                }}
              />
            )}
          >
            <Button type="primary">New Class</Button>
          </OverlayPanelWrapper>
        </div>

        <AppTable
          columns={columns}
          dataSource={cookingClasses}
          loading={isLoading}
          rowKey="id"
          mode="simple"
          pagination={{
            current: pageIndex,
            pageSize: pageSize,
            total: cookingClasses.length,
            onChange: handleChangePageIndex,
            onShowSizeChange: handleChangePageSize,
          }}
        />
      </div>
    </Drawer>
  );
}
