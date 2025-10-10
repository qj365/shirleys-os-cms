import { api } from '@/lib/api/admin';
import type { NumberedPagingResponse_AdminGetCategoriesResponse_Array_ } from '@/lib/api/customer';
import { toastErrorMessage } from '@/utils/dataTypes/string';
import useDebounceSearch from '@/utils/hooks/useDebounceSearch';
import LoadingOutlined from '@ant-design/icons/LoadingOutlined';
import SearchOutlined from '@ant-design/icons/SearchOutlined';
import { Form, Select } from 'antd';
import type { DefaultOptionType } from 'antd/es/select';
import { useCallback, useEffect, useState } from 'react';

type Props = {
  placeholder?: string;
  name: string;
  initialSearchKeyword?: string;
};

const { useWatch, useFormInstance } = Form;

const ProductCategorySelection = ({
  name,
  placeholder,
  initialSearchKeyword,
}: Props) => {
  const { searchKeyword, setSearchKeyword, debounceSearchFn } =
    useDebounceSearch();

  const form = useFormInstance();
  const { setFieldValue, validateFields } = form;
  const value = useWatch(name, form);

  const onSelect = useCallback(
    (value?: string) => {
      setFieldValue(name, value);
      void validateFields([name]);
    },
    [name, setFieldValue, validateFields]
  );

  const handleClear = useCallback(() => {
    setSearchKeyword('');
    onSelect(undefined);
  }, [onSelect, setSearchKeyword]);

  const [isLoading, setIsLoading] = useState(true);
  const [categoryOptions, setCategoryOptions] = useState<
    DefaultOptionType[] | null
  >(null);

  const handleGetCategories = useCallback(async () => {
    try {
      setIsLoading(true);

      const response: NumberedPagingResponse_AdminGetCategoriesResponse_Array_ =
        await api.admin.adminCategoryGetAll({
          pageSize: 20,
          page: 1,
          ...(searchKeyword && {
            name: searchKeyword,
          }),
        });
      setCategoryOptions(
        response?.data?.map(item => {
          return {
            value: item.id,
            label: item.name,
          };
        })
      );
    } catch (err) {
      toastErrorMessage(err);
    } finally {
      setIsLoading(false);
    }
  }, [searchKeyword]);

  useEffect(() => {
    if (!initialSearchKeyword) return;
    setSearchKeyword(initialSearchKeyword);
  }, [initialSearchKeyword, setSearchKeyword]);

  useEffect(() => {
    handleGetCategories();
  }, [handleGetCategories]);

  return (
    <Select
      value={value}
      showSearch
      allowClear
      placeholder={placeholder ?? ''}
      optionFilterProp="label"
      optionLabelProp="label"
      suffixIcon={isLoading ? <LoadingOutlined /> : <SearchOutlined />}
      onSelect={onSelect}
      onClear={handleClear}
      onSearch={debounceSearchFn}
      options={categoryOptions || []}
    />
  );
};

export default ProductCategorySelection;
