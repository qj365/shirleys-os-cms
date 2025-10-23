import { Form, type FormItemProps } from 'antd';
import { memo, useCallback } from 'react';
import AppTextEditor from './AppTextEditor';

type AppTextEditorFormFieldProps = {
  placeholder?: string;
  parentFieldName?: string;
  isShowMediaFeatures?: boolean;
} & FormItemProps;

const { useFormInstance, useWatch } = Form;

const AppTextEditorFormField = ({
  name,
  label = '',
  rules = [],
  placeholder = '',
  parentFieldName,
  isShowMediaFeatures = true,
  ...formItemProps
}: AppTextEditorFormFieldProps) => {
  const form = useFormInstance();
  const formValue = useWatch(name, form);

  const handleBlur = useCallback(
    (value: string) => {
      form?.setFieldValue(
        parentFieldName ? [parentFieldName, ...name] : name,
        value
      );
      form?.validateFields([name]);
    },
    [form, name, parentFieldName]
  );

  return (
    <Form.Item name={name} label={label} rules={rules} {...formItemProps}>
      <AppTextEditor
        value={formValue ?? ''}
        onBlur={handleBlur}
        placeholder={placeholder}
        isShowMediaFeatures={isShowMediaFeatures}
      />
    </Form.Item>
  );
};

export default memo(AppTextEditorFormField);
