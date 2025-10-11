import { api } from '@/lib/api/admin';
import { skuGenerator } from '@/utils/dataTypes/string';
import type { ObjectType } from '@/utils/types';
import { Regex, RegexValidationMessage } from '@/utils/validations';
import ReloadOutlined from '@ant-design/icons/ReloadOutlined';
import { Form, Input } from 'antd';
import debounce from 'lodash/debounce';
import { useEffect, useMemo } from 'react';

type Props = {
  isShowSKU: boolean;
};

const { useFormInstance } = Form;

export default function ProductDetailSKU({ isShowSKU }: Props) {
  const form = useFormInstance();

  const checkSKUDuplicate = useMemo(
    () =>
      debounce(async (sku, resolve, reject) => {
        try {
          const response = await api.product.checkExistingSku({ sku });

          if (response) {
            reject(new Error('SKU is duplicated'));
          } else {
            resolve();
          }
        } catch {
          reject(new Error('Error checking SKU. Please try again.'));
        }
      }, 500),
    []
  );

  const validateSKU = async (_: ObjectType, value: string) => {
    if (!isShowSKU) return Promise.resolve();

    if (!value) {
      return Promise.reject(new Error('Please enter SKU.'));
    }
    if (!Regex.SKU.test(value)) {
      return Promise.reject(new Error(RegexValidationMessage.SKU));
    }

    return new Promise((resolve, reject) => {
      checkSKUDuplicate(value, resolve, reject);
    });
  };

  useEffect(() => {
    if (!isShowSKU) return;
    const initialSKU = form.getFieldValue('sku');
    if (initialSKU) {
      form.validateFields(['sku']);
    }
  }, [form, isShowSKU]);

  useEffect(() => {
    return () => {
      checkSKUDuplicate.cancel();
    };
  }, [checkSKUDuplicate]);

  return (
    <Form.Item
      name="sku"
      label="SKU"
      rules={[
        {
          validator: validateSKU,
        },
      ]}
      className="col-span-3"
      tooltip="Stock-Keeping Unit"
    >
      <Input
        placeholder="Enter SKU"
        maxLength={12}
        suffix={
          <ReloadOutlined
            onClick={() => {
              form.setFieldValue('sku', skuGenerator(12));
              form.validateFields(['sku']);
            }}
          />
        }
        disabled={!isShowSKU}
      />
    </Form.Item>
  );
}
