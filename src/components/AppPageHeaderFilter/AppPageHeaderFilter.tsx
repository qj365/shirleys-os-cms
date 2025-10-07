import CloseOutlined from '@ant-design/icons/CloseOutlined';
import type { FormInstance } from 'antd';
import { Button, Drawer, Form } from 'antd';
import ConditionalWrap from '@/components/ConditionalWrap';
import type { ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import useQueryHandle from '@/utils/hooks/useQueryHandle';
import dayjs from '@/utils/moment/dayjsConfig';
import {
  convertDateStringToObjectDate,
  DefaultDateFormat,
} from '@/utils/moment/utils';
import type { ObjectType } from '@/utils/types';

type AppPageHeaderFilterProps = {
  title: string;
  formElements: ReactNode;
  /** Expose form instance for custom clear filter instead of remove all query params by default */
  customClearFilterCallbackFn?: (form: FormInstance) => void;
  standaloneMode?: boolean;
  noPagination?: boolean;
};

const AppPageHeaderFilter = ({
  title,
  formElements,
  customClearFilterCallbackFn,
  standaloneMode = false,
  noPagination,
}: AppPageHeaderFilterProps) => {
  const [showFilter, setShowFilter] = useState(false);

  const submitBtnRef = useRef<HTMLButtonElement | null>(null);

  const { queryParams, handleChangeFilter, handleClearFilter } = useQueryHandle(
    { noPagination }
  );

  const [form] = Form.useForm();
  const { resetFields, setFieldsValue } = form;

  const onApplyFilter = useCallback(
    (values: ObjectType) => {
      for (const key in values) {
        if (dayjs.isDayjs(values[key])) {
          values[key] = values[key]?.format(DefaultDateFormat) ?? values[key];
        }
      }
      setShowFilter(false);
      handleChangeFilter(values);
    },
    [handleChangeFilter]
  );

  const onClearFilter = useCallback(
    (customClearFilterCallbackFn?: (form: FormInstance) => void) => {
      setShowFilter(false);
      if (customClearFilterCallbackFn) {
        customClearFilterCallbackFn(form);
        return;
      }
      handleClearFilter();
      resetFields();
    },
    [handleClearFilter, resetFields, form]
  );

  const initialValues = useMemo(() => {
    return convertDateStringToObjectDate(queryParams);
  }, [queryParams]);

  const onFormValuesChange = useCallback(
    () => standaloneMode && form.submit(),
    [standaloneMode, form]
  );

  useEffect(() => {
    setFieldsValue(initialValues);
  }, [setFieldsValue, initialValues]);

  const headerFilterButton = useMemo(
    () =>
      !standaloneMode && (
        <Button type="default" onClick={() => setShowFilter(prev => !prev)}>
          Search &amp; filter
        </Button>
      ),
    [standaloneMode, setShowFilter]
  );

  const renderDrawer = useCallback(
    (children: ReactNode) => (
      <Drawer
        open={showFilter}
        onClose={() => setShowFilter(false)}
        title={
          <div className="flex items-center justify-between">
            <span className="text-base font-semibold">{title}</span>

            <Button
              type="text"
              icon={<CloseOutlined />}
              onClick={() => setShowFilter(false)}
            />
          </div>
        }
        forceRender
        closeIcon={null}
        footer={
          <div className="flex items-center justify-end gap-2 py-2">
            <Button
              type="default"
              onClick={() => onClearFilter(customClearFilterCallbackFn)}
            >
              Reset
            </Button>
            <Button
              type="primary"
              onClick={() => submitBtnRef.current?.click()}
            >
              Search
            </Button>
          </div>
        }
      >
        {children}
      </Drawer>
    ),
    [
      title,
      showFilter,
      setShowFilter,
      onClearFilter,
      customClearFilterCallbackFn,
    ]
  );

  return (
    <>
      {headerFilterButton}
      <ConditionalWrap condition={!standaloneMode} wrap={renderDrawer}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onApplyFilter}
          onValuesChange={onFormValuesChange}
        >
          {formElements}
          <Button className="hidden" htmlType="submit" ref={submitBtnRef}>
            Lọc
          </Button>
        </Form>
      </ConditionalWrap>
    </>
  );
};

export default AppPageHeaderFilter;
