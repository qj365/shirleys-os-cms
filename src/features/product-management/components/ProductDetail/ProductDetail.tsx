import { skuGenerator } from '@/utils/dataTypes/string';
import type { ObjectType } from '@/utils/types';
import { Form } from 'antd';
import { useParams } from 'react-router-dom';
import ProductDetailMedia from './ProductDetailMedia';
import ProductDetailOverviewInfo from './ProductDetailOverviewInfo';

export default function ProductDetail() {
  const { productId } = useParams<{
    productId: string;
  }>();

  const isCreateNewProduct = productId === 'create';
  console.log(isCreateNewProduct);

  const [form] = Form.useForm();

  const onFinish = (values: ObjectType) => {
    console.log(values);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      scrollToFirstError
      onFinish={onFinish}
      initialValues={
        isCreateNewProduct
          ? {
              sku: skuGenerator(12),
              active: true,
            }
          : undefined
      }
    >
      <div className="space-y-4">
        <ProductDetailOverviewInfo />
        <ProductDetailMedia />
      </div>
    </Form>
  );
}
