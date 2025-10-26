import { api } from '@/lib/api/admin';
import type { ObjectType } from '@/utils/types';
import CloseCircleFilled from '@ant-design/icons/CloseCircleFilled';
import LoadingOutlined from '@ant-design/icons/LoadingOutlined';
import PlusOutlined from '@ant-design/icons/PlusOutlined';
import UploadOutlined from '@ant-design/icons/UploadOutlined';
import {
  closestCenter,
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { rectSortingStrategy, SortableContext } from '@dnd-kit/sortable';
import {
  Flex,
  Image,
  message,
  Upload,
  type GetProp,
  type UploadFile,
  type UploadProps,
} from 'antd';
import Dragger from 'antd/es/upload/Dragger';
import clsx from 'clsx';
import { useState } from 'react';
import SortableImageItem from '../../features/product-management/components/ProductDetail/SortableImageItem';

export type TImageUploadMode = 'productMedia' | 'variantImage';

type Props = {
  uploadMaxCount?: number;
  maximumFileSize?: number;
  disabled?: boolean;
  mode?: TImageUploadMode;
  imageList: UploadFile<ObjectType>[];
  onImageListChange: (imageList: UploadFile<ObjectType>[]) => void;
  onSelectImage?: (imageUrl: string) => void;
  label?: string;
  showLabel?: boolean;
  required?: boolean;
  className?: string;
  gridClassName?: string;
  draggerClassName?: string;
  uploadButtonClassName?: string;
  imageClassName?: string;
  firstImageLarge?: boolean;
  enableDragAndDrop?: boolean;
  enableSorting?: boolean;
  customUploadText?: {
    main?: string;
    hint?: string;
    format?: string;
    limit?: string;
  };
};

type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];

const acceptedMIMETypes = ['image/jpeg', 'image/jpg', 'image/png'];

const defaultUploadText = {
  main: 'Click to select an image or drag it into the box to upload',
  hint: 'Only .png, .jpg, or .jpeg image formats are supported',
  format: 'PNG, JPG, JPEG',
  limit: 'files. Maximum file size',
};

export default function AppImageUpload({
  uploadMaxCount = 10,
  maximumFileSize = 10,
  disabled = false,
  mode = 'productMedia',
  imageList,
  onImageListChange,
  onSelectImage,
  label = 'Images',
  showLabel = true,
  required = true,
  className = 'mb-6',
  gridClassName = 'grid h-[300px] grid-cols-12 gap-8 overflow-y-auto rounded-[6px] border-[1px] border-dashed border-[#d9d9d9] p-4',
  draggerClassName = 'group relative min-h-[165px] bg-transparent',
  uploadButtonClassName = 'relative',
  imageClassName = '!aspect-[4/4] !h-full rounded-[8px] object-cover',
  firstImageLarge = true,
  enableDragAndDrop = true,
  enableSorting = true,
  customUploadText = {},
}: Props) {
  const [isDrag, setIsDrag] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const uploadText = { ...defaultUploadText, ...customUploadText };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    if (!enableSorting) return;

    const { active, over } = event;
    if (over && active.id !== over.id) {
      const getNewImageList = (images: ObjectType[]) => {
        const oldIndex = images.findIndex(item => item.uid === active.id);
        const newIndex = images.findIndex(item => item.uid === over.id);
        const newItems = [...images];
        const [movedItem] = newItems.splice(oldIndex, 1);
        newItems.splice(newIndex, 0, movedItem);
        return newItems;
      };

      onImageListChange(getNewImageList(imageList) as UploadFile<ObjectType>[]);
    }
  };

  const handleBeforeUpload = (file: FileType) => {
    const isValidType = acceptedMIMETypes.includes(file?.type || '');

    if (!isValidType) {
      void message.error('File type is invalid');
      return false;
    }
    const isValidFileSize = (file?.size || 0) / 1024 / 1024 <= maximumFileSize;

    if (!isValidFileSize) {
      void message.error(`Please upload file less than ${maximumFileSize}MB`);
      return false;
    }
    return true;
  };

  const handleChange: UploadProps['customRequest'] = async (
    info: ObjectType
  ) => {
    if (imageList?.find(item => item?.name === info?.file.name)) {
      void message.error(`Already uploaded image ${info?.file?.name}`);
      return;
    }
    setIsLoading(true);

    try {
      const uploadResponse = await api.uploadFile(info?.file as FileType);

      const fileData = {
        uid: info?.file?.uid,
        name: info?.file?.name,
        url: uploadResponse,
      };

      const newImageList = [...imageList, fileData];
      onImageListChange(newImageList);

      if (mode === 'variantImage') {
        onSelectImage?.(uploadResponse);
      }
    } catch {
      void message.error(`Failed to upload image ${info?.file?.name}`);
    } finally {
      setIsLoading(false);
    }
  };

  const removeImage = (item: UploadFile<ObjectType>) => {
    const newImageList = imageList.filter(img => img.uid !== item.uid);
    onImageListChange(newImageList);
  };

  const uploadButton = (
    <button
      style={{
        border: 0,
        background: 'none',
        height: '100%',
        width: '100%',
        borderRadius: '8px',
      }}
      type="button"
      onDragOver={() => {
        if (enableDragAndDrop) setIsDrag(true);
      }}
      onDragLeave={() => setIsDrag(false)}
      onDrop={() => setIsDrag(false)}
      className={uploadButtonClassName}
    >
      {isLoading ? (
        <LoadingOutlined />
      ) : (
        <PlusOutlined className={`${isDrag ? 'pointer-events-none' : ''}`} />
      )}
      <div
        style={{ marginTop: 8 }}
        className={`${isDrag ? 'pointer-events-none' : ''}`}
      >
        Upload
      </div>
      <div
        className={`pointer-events-none absolute right-0 top-0 hidden h-full w-full rounded-[8px] bg-slate-200 opacity-95 ${isDrag ? 'z-[1] !flex !items-center !justify-center' : ''}`}
      >
        Drop here
      </div>
    </button>
  );

  // Variant image mode - simple grid without drag & drop
  if (mode === 'variantImage') {
    return (
      <div className="grid grid-cols-4 gap-8 p-4">
        {imageList.map(item => (
          <div
            key={item.uid}
            className="hover:cursor-pointer"
            onClick={() => onSelectImage?.(item?.url || '')}
          >
            <Image
              preview={false}
              className={imageClassName}
              loading="lazy"
              src={item?.url}
              wrapperClassName="h-full w-full"
            />
          </div>
        ))}
        {imageList?.length < uploadMaxCount && (
          <Upload
            multiple={false}
            listType="picture-card"
            maxCount={uploadMaxCount - imageList?.length}
            beforeUpload={handleBeforeUpload}
            customRequest={handleChange}
            showUploadList={false}
            accept={acceptedMIMETypes.join(', ')}
          >
            {uploadButton}
          </Upload>
        )}
      </div>
    );
  }

  return (
    <div className={className}>
      {showLabel && (
        <label className="block pb-2">
          {required && <strong className="text-error">*</strong>}
          {label}
        </label>
      )}
      {imageList?.length ? (
        <>
          {enableSorting ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={imageList.map(item => item.uid)}
                strategy={rectSortingStrategy}
              >
                <div className={gridClassName}>
                  {imageList.map((item, index) => (
                    <div
                      key={item.uid}
                      className={clsx(
                        firstImageLarge &&
                          index === 0 &&
                          'col-span-2 row-span-2'
                      )}
                    >
                      <SortableImageItem id={item.uid}>
                        <CloseCircleFilled
                          className="absolute -right-2 -top-2 z-[1] cursor-pointer !text-lg !text-error"
                          onClick={() => {
                            removeImage(item);
                          }}
                        />

                        <Image
                          preview={false}
                          className={imageClassName}
                          loading="lazy"
                          src={item?.url}
                          wrapperClassName="h-full w-full"
                        />
                      </SortableImageItem>
                    </div>
                  ))}
                  {imageList?.length < uploadMaxCount && (
                    <Upload
                      multiple={true}
                      listType="picture-card"
                      maxCount={uploadMaxCount - imageList?.length}
                      beforeUpload={handleBeforeUpload}
                      customRequest={handleChange}
                      showUploadList={false}
                      accept={acceptedMIMETypes.join(', ')}
                    >
                      {uploadButton}
                    </Upload>
                  )}
                </div>
              </SortableContext>
            </DndContext>
          ) : (
            <div className={gridClassName}>
              {imageList.map((item, index) => (
                <div
                  key={item.uid}
                  className={clsx(
                    firstImageLarge && index === 0 && 'col-span-2 row-span-2'
                  )}
                >
                  <CloseCircleFilled
                    className="absolute -right-2 -top-2 z-[1] cursor-pointer !text-lg !text-error"
                    onClick={() => {
                      removeImage(item);
                    }}
                  />

                  <Image
                    preview={false}
                    className={imageClassName}
                    loading="lazy"
                    src={item?.url}
                    wrapperClassName="h-full w-full"
                  />
                </div>
              ))}
              {imageList?.length < uploadMaxCount && (
                <Upload
                  multiple={true}
                  listType="picture-card"
                  maxCount={uploadMaxCount - imageList?.length}
                  beforeUpload={handleBeforeUpload}
                  customRequest={handleChange}
                  showUploadList={false}
                  accept={acceptedMIMETypes.join(', ')}
                >
                  {uploadButton}
                </Upload>
              )}
            </div>
          )}
        </>
      ) : (
        <Dragger
          listType="picture-card"
          beforeUpload={handleBeforeUpload}
          customRequest={handleChange}
          multiple={true}
          fileList={imageList}
          accept={acceptedMIMETypes.join(', ')}
          disabled={disabled}
          maxCount={uploadMaxCount}
          showUploadList={false}
        >
          <Flex
            gap={4}
            vertical
            justify="center"
            align="center"
            className={draggerClassName}
            onDragOver={() => {
              if (enableDragAndDrop) setIsDrag(true);
            }}
            onDragLeave={() => setIsDrag(false)}
            onDrop={() => setIsDrag(false)}
          >
            {isLoading ? (
              <LoadingOutlined className="!text-[32px] text-primary" />
            ) : (
              <UploadOutlined className="!text-[32px] text-primary" />
            )}

            <p className="ant-upload-text">{uploadText.main}</p>
            <p className="ant-upload-hint">{uploadText.hint}</p>
            <p className="ant-upload-hint">
              Limited {uploadMaxCount} {uploadText.limit} {maximumFileSize}MB.
              Format {uploadText.format}
            </p>

            <div
              className={`pointer-events-none absolute hidden h-full w-full rounded-[8px] bg-slate-200 opacity-95 ${isDrag ? '!flex items-center justify-center' : ''}`}
            >
              Drop here
            </div>
          </Flex>
        </Dragger>
      )}
    </div>
  );
}
