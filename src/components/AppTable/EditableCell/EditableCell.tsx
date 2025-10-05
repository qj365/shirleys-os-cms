import CheckOutlined from '@ant-design/icons/CheckOutlined';
import CloseOutlined from '@ant-design/icons/CloseOutlined';
import EditOutlined from '@ant-design/icons/EditOutlined';
import type { InputRef } from 'antd';
import { Button, Form, Input } from 'antd';
import clsx from 'clsx';
import NumericTooltipInput from 'components/AppFormElements/AppInput/NumericTooltipInput';
import type { EditableCellProps } from 'components/AppTable/types';
import type { PropsWithChildren } from 'react';
import { useCallback, useEffect, useRef, type Ref } from 'react';
import type { ObjectType } from 'utils/types';

const EditableCell = ({
  editable,
  children,
  dataIndex,
  fieldRule,
  recordKey,
  record,
  onSave,
  cellEditState,
  setCellEditState,
  inputType = 'number',
  ...restProps
}: PropsWithChildren<EditableCellProps>) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [form] = Form.useForm();
  const { setFieldsValue } = form;

  const isEditing =
    cellEditState?.isEditing &&
    cellEditState?.dataIndex === dataIndex &&
    cellEditState?.recordKey === recordKey;

  useEffect(() => {
    if (!isEditing) return;
    inputRef.current?.focus();
  }, [isEditing]);

  const handleOpenEditor = useCallback(() => {
    if (cellEditState?.isEditing) return;

    setCellEditState({
      isEditing: true,
      dataIndex,
      recordKey,
    });
    setFieldsValue({ [dataIndex]: record[dataIndex] });
  }, [
    cellEditState?.isEditing,
    recordKey,
    record,
    dataIndex,
    setFieldsValue,
    setCellEditState,
  ]);

  const handleCloseEditor = useCallback(() => {
    setCellEditState({
      isEditing: false,
      dataIndex: undefined,
      recordKey: undefined,
    });
  }, [setCellEditState]);

  const save = useCallback(
    async (values: ObjectType) => {
      try {
        handleCloseEditor();
        if (values?.[`${dataIndex}`] === record?.[`${dataIndex}`]) return;
        onSave({ ...record, ...values });
      } catch (error) {
        console.error('Failed to save editable cell:', error);
      }
    },
    [dataIndex, onSave, record, handleCloseEditor]
  );

  let childNode = children;

  if (editable) {
    childNode = isEditing ? (
      <Form form={form} onFinish={save} className="flex items-center gap-x-2">
        {inputType === 'text' ? (
          <Form.Item name={dataIndex} rules={fieldRule} noStyle>
            <Input ref={inputRef as Ref<InputRef>} className="w-full" />
          </Form.Item>
        ) : (
          <NumericTooltipInput
            // @ts-expect-error NumericTooltipInput does not support ref typing as expected
            ref={inputRef}
            className="w-full"
            formProps={{
              name: dataIndex,
              rules: fieldRule,
              className: 'mb-0 [&_.ant-form-item]:!mb-0',
            }}
          />
        )}
        <div className="flex shrink-0 items-center justify-end">
          <Button
            type="text"
            size="small"
            htmlType="button"
            icon={<CloseOutlined />}
            onClick={() => handleCloseEditor()}
          />

          <Button
            type="text"
            size="small"
            htmlType="submit"
            icon={<CheckOutlined />}
          />
        </div>
      </Form>
    ) : (
      <div className={clsx('group flex items-center gap-x-1')}>
        {children}
        <Button
          type="text"
          size="small"
          htmlType="submit"
          icon={<EditOutlined />}
          className="shrink-0"
          onClick={handleOpenEditor}
        />
      </div>
    );
  }

  return <td {...restProps}>{childNode}</td>;
};

export default EditableCell;
