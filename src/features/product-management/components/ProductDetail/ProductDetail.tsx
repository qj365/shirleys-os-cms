/* eslint-disable @typescript-eslint/no-explicit-any */
import AnimatedSkeletonLoader from '@/components/AnimatedSkeletonLoader';
import AppPaperBox from '@/components/AppPaperBox';
import AppTextEditorFormField from '@/components/AppTextEditor/AppTextEditorFormField';
import {
  _36_Enums_ProductStatus,
  api,
  type GetProductResponse,
  type UpdateProductDto,
} from '@/lib/api/admin';
import type { CreateProductDto } from '@/lib/api/customer';
import {
  initProductDetailStoreValues,
  useProductDetailStore,
  type Variant,
} from '@/lib/stores/productDetailStore';
import { getPath } from '@/routers/router-paths';
import { skuGenerator, toastErrorMessage } from '@/utils/dataTypes/string';
import useSetSelectedMenuKeys from '@/utils/hooks/useSetSelectedMenuKeys';
import type { ObjectType } from '@/utils/types';
import { Button, Checkbox, Form, Input, message } from 'antd';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { v4 as uuid } from 'uuid';
import ProductCategorySelection from './ProductCategorySelection';
import ProductDetailImageUpload from './ProductDetailImageUpload';
import ProductDetailPropertyConfig from './ProductDetailPropertyConfig';
import ProductDetailSKU from './ProductDetailSKU';
import { ProductDetailVariants } from './ProductDetailVariants';
import useQueryHandle from '@/utils/hooks/useQueryHandle';

const validateVariants = (variants: Variant[]) => {
  return variants.every(variant => {
    // Validate image
    if (!variant.image) {
      message.error(`Variant "${variant.name}": Image is Required`);
      return false;
    }

    // Validate price
    if (typeof variant.price !== 'number' || variant.price <= 0) {
      message.error(`Variant "${variant.name}": Price is Required`);
      return false;
    }

    // Validate compareAtPrice
    if (
      typeof variant.compareAtPrice !== 'number' ||
      variant.compareAtPrice <= 0
    ) {
      message.error(`Variant "${variant.name}": Compare Price is Required`);
      return false;
    }

    // Validate price < compareAtPrice
    if (variant.price >= variant.compareAtPrice) {
      message.error(
        `Variant "${variant.name}": Price must be less than Compare Price`
      );
      return false;
    }

    // Validate stock
    if (
      typeof variant.stock !== 'number' ||
      variant.stock < 0 ||
      variant.stock > 99999
    ) {
      message.error(
        `Variant "${variant.name}": Stock must be a number between 0 and 99999`
      );
      return false;
    }

    return true;
  });
};

const ProductDetail = () => {
  const { productId } = useParams<{
    productId: string;
  }>();

  const isCreateNewProduct = productId === 'create';

  const { queryParams } = useQueryHandle();
  const { duplicateId } = queryParams || {};

  const [form] = Form.useForm();

  const { imageList, variantOptions, variants, setProductDetailStore } =
    useProductDetailStore();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [getProductDetail, setGetProductDetail] =
    useState<GetProductResponse | null>(null);
  const [isFetchingProduct, setIsFetchingProduct] = useState(true);

  const navigate = useNavigate();

  const initialValues = useMemo(() => {
    const { name, sku, category, status, description } = getProductDetail || {};

    return {
      sku: isCreateNewProduct ? skuGenerator(12) : sku,
      active: isCreateNewProduct ? true : status,

      ...((!isCreateNewProduct || (isCreateNewProduct && duplicateId)) && {
        name: !isCreateNewProduct ? name : `${name} (CLONE 1)`,
        description,
        categoryId: category?.id,
      }),
    };
  }, [duplicateId, getProductDetail, isCreateNewProduct]);

  const handleGetProductDetail = useCallback(async () => {
    setIsFetchingProduct(true);
    try {
      if (isCreateNewProduct && !duplicateId) return;
      const res = await api.product.getProduct({
        id: !isCreateNewProduct ? Number(productId) : duplicateId,
      });

      setGetProductDetail(res);
    } catch (e) {
      toastErrorMessage(e);
    } finally {
      setIsFetchingProduct(false);
    }
  }, [isCreateNewProduct, productId, duplicateId]);

  const onScrollToElement = (elementId: string) =>
    document.querySelector(`#${elementId}`)?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });

  const onFinish = async (values: ObjectType) => {
    try {
      setIsSubmitting(true);

      if (!imageList?.length) {
        void message.error('Please upload your product image');
        onScrollToElement('productMedia');
        return;
      }
      if (isCreateNewProduct && !variantOptions?.length) {
        void message.error('Please add at least one product property');
        onScrollToElement('productProperties');
        return;
      }
      if (!variants?.length) {
        void message.error('Please add at least one product variant');
        onScrollToElement('productVariants');
        return;
      }

      const isValidVariants = validateVariants(variants);
      if (!isValidVariants) {
        onScrollToElement('productVariants');
        return;
      }

      const { status, name, sku, description, categoryId } = values || {};

      const requestBody = {
        name,
        description,
        categoryId,
        status: status
          ? _36_Enums_ProductStatus.ACTIVE
          : _36_Enums_ProductStatus.INACTIVE,
        images: imageList.map(img => img.url || ''),
        ...(isCreateNewProduct
          ? {
              sku,
              variantOptions,
              productVariants: variants.map(v => {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { id, selected, sku, ...variantPayload } = v || {};

                return { ...variantPayload };
              }),
            }
          : {
              productVariants: variants?.map((item: any) => {
                return {
                  id: item?.id,
                  price: item?.price,
                  compareAtPrice: item?.compareAtPrice,
                  image: item?.image,
                  stock: item?.stock,
                };
              }),
            }),
      };

      if (isCreateNewProduct) {
        await api.product.createProduct({
          requestBody: requestBody as CreateProductDto,
        });
      } else {
        await api.product.updateProduct({
          id: Number(productId),
          requestBody: requestBody as UpdateProductDto,
        });
      }

      void message.success(
        isCreateNewProduct
          ? 'Created new product successfully'
          : 'Updated product successfully'
      );

      setProductDetailStore(initProductDetailStoreValues);

      navigate(getPath('productListPage'));

      window.scrollTo(0, 0);
    } catch (error) {
      toastErrorMessage(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  useSetSelectedMenuKeys({
    selectedMenuKeys: [getPath('productListPage')],
  });

  useEffect(() => {
    handleGetProductDetail();
  }, [handleGetProductDetail]);

  useEffect(() => {
    const { images, productVariants, variantOptions } = getProductDetail || {};

    const imageList = (images || []).map(item => ({
      uid: uuid(),
      url: item,
    }));

    const properties = (variantOptions || []).map(item => {
      const { id, name, options } = item || {};

      return {
        id,
        name,
        values: options.map(item => item.value),
        mode: 'view',
      };
    });

    const variants = (productVariants || []).map(item => {
      return {
        ...item,
        selected: false,
      };
    });

    setProductDetailStore({
      imageList: (imageList || []) as any,
      properties: (properties || []) as any,
      variantOptions: variantOptions || [],
      variants: (variants || []) as any,
      lastDeleted: null,
      isRefreshingTemplates: false,
    });
  }, [getProductDetail, setProductDetailStore]);

  useEffect(() => {
    form.setFieldsValue(initialValues);
  }, [initialValues, form]);

  if (isFetchingProduct) {
    return (
      <AppPaperBox className="p-4">
        <AnimatedSkeletonLoader rows={2} />
      </AppPaperBox>
    );
  }

  return (
    <>
      <Form
        form={form}
        layout="vertical"
        scrollToFirstError
        onFinish={onFinish}
        initialValues={
          isCreateNewProduct
            ? {
                sku: skuGenerator(12),
              }
            : undefined
        }
      >
        <AppPaperBox className="p-4">
          <div className="grid grid-cols-12 gap-x-4">
            <Form.Item
              name="name"
              label="Product name"
              rules={[
                {
                  required: true,
                  message: 'Please input name of product',
                  whitespace: true,
                },
              ]}
              className="col-span-8"
            >
              <Input
                showCount
                placeholder="Enter product name"
                maxLength={120}
              />
            </Form.Item>
            <ProductDetailSKU isShowSKU={isCreateNewProduct} />

            <Form.Item
              name="categoryId"
              label="Product category"
              rules={[
                {
                  required: true,
                  message: 'Please select Product category',
                },
              ]}
              className="col-span-12"
            >
              <ProductCategorySelection
                name="categoryId"
                placeholder="Select category"
                initialSearchKeyword={
                  isCreateNewProduct
                    ? ''
                    : getProductDetail?.category?.name || ''
                }
              />
            </Form.Item>

            <AppTextEditorFormField
              name="description"
              label="Description"
              rules={[
                {
                  required: true,
                  message: 'Please input description of product',
                },
              ]}
              className="col-span-12 mb-6"
            />
          </div>

          <p id="productMedia" className="h-2" />
          <ProductDetailImageUpload />

          <>
            <p id="productProperties" className="h-2" />
            <ProductDetailPropertyConfig
              isCreateNewProduct={isCreateNewProduct}
            />
          </>

          <p id="productVariants" className="h-2" />
          <ProductDetailVariants />

          <Form.Item
            name="status"
            className="col-span-8"
            valuePropName="checked"
            initialValue={true}
          >
            <Checkbox>Public Product</Checkbox>
          </Form.Item>

          <div className="flex justify-end gap-6">
            <Button
              type="primary"
              htmlType="submit"
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              {isCreateNewProduct ? 'Create Product' : 'Save Changes'}
            </Button>
          </div>
        </AppPaperBox>
      </Form>
    </>
  );
};

export default memo(ProductDetail);
