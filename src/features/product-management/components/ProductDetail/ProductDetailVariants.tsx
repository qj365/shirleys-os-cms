/* eslint-disable @typescript-eslint/no-explicit-any */
import AppIconButton from '@/components/AppIconButton';
import AppTable from '@/components/AppTable';
import OverlayPanelWrapper from '@/components/Overlays/OverlayPanelWrapper';
import { useProductDetailStore } from '@/lib/stores/productDetailStore';
import { Checkbox, Image, InputNumber, Select, Space } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import clsx from 'clsx';
import { ChevronDown, Upload } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import ProductDetailVariantImageUploadPanel from './ProductDetailVariantImageUploadPanel';

interface VariantRow {
  id: string;
  name: string;
  variantOptionIds: number[];
  price: number;
  compareAtPrice: number;
  stock: number;
  image: string;
  selected: boolean;
  displayKey?: string;
}

const bulkFiledOptions = [
  { label: 'Price', value: 'price' },
  { label: 'Compare at Price', value: 'compareAtPrice' },
  { label: 'Stock', value: 'stock' },
  { label: 'Image', value: 'image' },
];

export const ProductDetailVariants = () => {
  const {
    variantOptions,
    variants,
    updateVariant,
    bulkUpdateVariants,
    isRefreshingTemplates,
  } = useProductDetailStore();

  const [groupBy, setGroupBy] = useState<string>();
  const [filterValues, setFilterValues] = useState<string[]>([]);
  const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([]);

  const [selectedBulkField, setSelectedBulkField] = useState<string>(
    bulkFiledOptions[0].value
  );

  // Build groupBy select options
  const groupByOptions = variantOptions.map(opt => ({
    label: opt.name,
    value: opt.name,
  }));

  // Build filter options
  const filterOptions = variantOptions.map(opt => ({
    label: opt.name,
    options: opt.options.map(o => ({
      label: o.value,
      value: `${opt.id}:${o.id}`,
    })),
  }));

  // --- Validate helper ---
  const validatePrice = (price: number, compareAt: number) => {
    if (price == null) return 'Required';
    if (price <= 0) return 'Must > 0';
    if (compareAt && price >= compareAt) return 'Must < compare price';
    return '';
  };

  const validateCompareAt = (compareAt: number, price: number) => {
    if (compareAt == null) return 'Required';
    if (compareAt <= 0) return 'Must > 0';
    if (price && compareAt <= price) return 'Must > price';
    return '';
  };

  const validateStock = (stock: number) => {
    if (stock == null) return 'Required';
    if (stock < 0) return 'Must ≥ 0';
    if (stock > 99999) return 'Must < 99999';
    return '';
  };

  // --- Filter variants by selected filterValues ---
  const filteredVariants = useMemo(() => {
    if (!filterValues.length) return variants;
    return variants.filter(v =>
      filterValues.every(fv => {
        const [, optId] = fv.split(':');
        return v.variantOptionIds.includes(Number(optId));
      })
    );
  }, [variants, filterValues]);

  // --- Build grouped tree data ---
  const groupedData = useMemo(() => {
    if (!variantOptions.length) return [];

    const baseGroup = groupBy
      ? variantOptions.find(opt => opt.name === groupBy)
      : variantOptions[0];

    if (!baseGroup) return [];

    const groupedMap: Record<number, VariantRow[]> = {};
    baseGroup.options.forEach(opt => (groupedMap[opt.id] = []));

    filteredVariants.forEach(v => {
      const match = v.variantOptionIds.find(id => groupedMap[id]);
      if (match) groupedMap[match].push(v);
    });

    const groups = baseGroup.options
      .map(opt => {
        const children = groupedMap[opt.id];
        if (!children?.length) return null;
        return {
          key: `group-${opt.id}`,
          isGroup: true,
          groupValue: opt.value,
          displayKey: `${baseGroup.name}: ${opt.value}`,
          children: children.map(v => ({
            key: v.id,
            ...v,
          })),
        };
      })
      .filter(Boolean);

    return groups;
  }, [filteredVariants, variantOptions, groupBy]);

  useEffect(() => {
    if (groupedData.length) {
      setExpandedRowKeys(groupedData.map((g: any) => g?.key));
    }
  }, [groupedData]);

  const selectedIds = variants.filter(v => v.selected).map(v => v.id);

  const allSelected = variants.length > 0 && variants.every(v => v.selected);

  const handleGroupSelect = (groupKey: string, checked: boolean) => {
    const group = groupedData.find((g: any) => g.key === groupKey);
    if (!group?.children) return;
    bulkUpdateVariants(
      group.children.map((c: VariantRow) => c.id),
      { selected: checked }
    );
  };

  // --- Toggle group collapse ---
  const toggleGroup = (key: string) => {
    setExpandedRowKeys(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  // --- Table columns ---
  const columns: ColumnsType<any> = [
    {
      title: (
        <Checkbox
          checked={allSelected}
          onChange={e =>
            bulkUpdateVariants(
              variants.map(v => v.id),
              { selected: e.target.checked }
            )
          }
        />
      ),
      dataIndex: 'selected',
      width: 50,
      render: (_, record: any) => {
        if (record.isGroup) {
          const allInGroupSelected = record.children.every(
            (v: any) => v.selected
          );
          return (
            <Checkbox
              checked={allInGroupSelected}
              onChange={e => handleGroupSelect(record.key, e.target.checked)}
            />
          );
        }
        return (
          <Checkbox
            checked={record.selected}
            onChange={e =>
              updateVariant(record.id, { selected: e.target.checked })
            }
          />
        );
      },
    },
    {
      title: 'Variant',
      dataIndex: 'name',
      render: (_, record: any) => {
        if (record.isGroup) {
          const expanded = expandedRowKeys.includes(record.key);
          return (
            <div>
              <p>{record.displayKey?.split(':')?.[1]}</p>
              <div className="flex items-center gap-2">
                <p className="text-sm text-gray-600">
                  {record?.children?.length} variant
                </p>
                <AppIconButton
                  htmlType="button"
                  icon={
                    <ChevronDown
                      className={clsx(
                        '!text-sm transition-all duration-100',
                        expanded ? 'rotate-180' : 'rotate-0'
                      )}
                    />
                  }
                  onClick={() => toggleGroup(record.key)}
                />
              </div>
            </div>
          );
        }
        return <span className="pl-6">{record.name}</span>;
      },
    },
    {
      title: 'Image',
      dataIndex: 'image',
      render: (_, record: any) => {
        if (record?.isGroup) return null;

        return (
          <OverlayPanelWrapper
            renderOverlayPanel={(open, setOpen) => (
              <ProductDetailVariantImageUploadPanel
                open={open}
                setOpen={setOpen}
                onSelectImage={imageUrl =>
                  updateVariant(record.id, { image: imageUrl })
                }
              />
            )}
          >
            {record?.image ? (
              <figure className="!h-10 !w-10 cursor-pointer">
                <Image
                  preview={false}
                  className="!aspect-[4/4] !h-full rounded-[8px] object-cover"
                  loading="lazy"
                  src={record?.image}
                  wrapperClassName="h-full w-full"
                />
              </figure>
            ) : (
              <div className="flex !h-10 !w-10 cursor-pointer items-center justify-center rounded bg-slate-300 hover:opacity-80">
                <Upload width={16} height={16} className="text-primary" />
              </div>
            )}
          </OverlayPanelWrapper>
        );
      },
    },
    {
      title: 'Price',
      dataIndex: 'price',
      render: (_, record: any) => {
        if (record.isGroup) return null;

        const errorMsg = validatePrice(record.price, record.compareAtPrice);

        return (
          <InputNumber
            min={0}
            prefix="$"
            step={0.01}
            precision={2}
            stringMode
            value={record.price}
            onChange={val => updateVariant(record.id, { price: Number(val) })}
            status={errorMsg ? 'error' : undefined}
            placeholder="Enter amount"
          />
        );
      },
    },
    {
      title: 'Compare at Price',
      dataIndex: 'compareAtPrice',
      render: (_, record: any) => {
        if (record.isGroup) return null;

        const errorMsg = validateCompareAt(record.compareAtPrice, record.price);

        return (
          <InputNumber
            min={0}
            prefix="$"
            step={0.01}
            precision={2}
            stringMode
            value={record.compareAtPrice}
            onChange={val =>
              updateVariant(record.id, { compareAtPrice: Number(val) })
            }
            status={errorMsg ? 'error' : undefined}
            placeholder="Enter amount"
          />
        );
      },
    },
    {
      title: 'Stock',
      dataIndex: 'stock',

      render: (_, record: any) => {
        if (record.isGroup) return null;

        const errorMsg = validateStock(record.stock);

        return (
          <InputNumber
            min={0}
            max={99999}
            value={record.stock}
            onChange={val => updateVariant(record.id, { stock: Number(val) })}
            status={errorMsg ? 'error' : undefined}
            placeholder="Enter stock amount"
          />
        );
      },
    },
  ];

  const bulkFormField = useMemo(() => {
    const onBlurInput = (e: React.FocusEvent<HTMLInputElement>) => {
      const val = Number((e.target as HTMLInputElement).value);
      if (isNaN(val)) return;
      bulkUpdateVariants(selectedIds, { [selectedBulkField]: val });
    };

    switch (selectedBulkField) {
      case 'price':
      case 'compareAtPrice':
        return (
          <InputNumber
            min={0}
            prefix="$"
            step={0.01}
            precision={2}
            stringMode
            onBlur={onBlurInput}
            onKeyDown={e => {
              if (e.key === 'Enter') onBlurInput(e as any);
            }}
            className="w-50"
            placeholder="Enter amount"
          />
        );

      case 'stock':
        return (
          <InputNumber
            min={0}
            max={99999}
            onBlur={onBlurInput}
            onKeyDown={e => {
              if (e.key === 'Enter') onBlurInput(e as any);
            }}
            className="w-50"
            placeholder="Enter stock amount"
          />
        );

      case 'image':
        return (
          <OverlayPanelWrapper
            renderOverlayPanel={(open, setOpen) => (
              <ProductDetailVariantImageUploadPanel
                open={open}
                setOpen={setOpen}
                onSelectImage={imageUrl => {
                  bulkUpdateVariants(selectedIds, {
                    [selectedBulkField]: imageUrl,
                  });
                }}
              />
            )}
          >
            <div className="flex !h-10 !w-10 cursor-pointer items-center justify-center rounded bg-slate-300 hover:opacity-80">
              <Upload width={16} height={16} className="text-primary" />
            </div>
          </OverlayPanelWrapper>
        );

      default:
        return null;
    }
  }, [bulkUpdateVariants, selectedBulkField, selectedIds]);

  return (
    <div className="my-6">
      <label className="block pb-2">
        <strong className="text-error">*</strong>Variants
      </label>

      <Space className="mb-4 flex flex-wrap gap-4">
        <Select
          placeholder="Group by property"
          options={groupByOptions}
          value={groupBy}
          onChange={setGroupBy}
          allowClear
          style={{ width: 250 }}
        />
        <Select
          mode="multiple"
          allowClear
          placeholder="Filter by values"
          options={filterOptions}
          value={filterValues}
          onChange={setFilterValues}
          style={{ minWidth: 250 }}
        />
      </Space>

      <AppTable
        rowKey="key"
        columns={columns}
        dataSource={groupedData}
        pagination={false}
        className="[&_.ant-table-tbody]:min-h-50"
        loading={isRefreshingTemplates}
        expandable={{
          expandedRowKeys,
          expandIcon: () => null,
          onExpand: (expanded, record) => {
            if (expanded) {
              setExpandedRowKeys(prev => [...prev, record.key]);
            } else {
              setExpandedRowKeys(prev =>
                prev.filter(key => key !== record.key)
              );
            }
          },
        }}
        mode="simple"
      />

      <div className="mt-4 flex items-center justify-start gap-4">
        <span>Auto-set to selected item</span>

        <Select
          options={bulkFiledOptions}
          placeholder="Select field to bulk update"
          value={selectedBulkField}
          className="w-50"
          onChange={setSelectedBulkField}
        />
        <span>as</span>

        {bulkFormField}
      </div>
    </div>
  );
};
