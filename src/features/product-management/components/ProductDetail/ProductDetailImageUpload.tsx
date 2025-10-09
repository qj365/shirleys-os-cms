import { api } from '@/lib/api/admin';
import { useProductDetailStore } from '@/lib/stores/productDetailStore';
import type { ObjectType } from '@/utils/types';
import LoadingOutlined from '@ant-design/icons/LoadingOutlined';
import PlusOutlined from '@ant-design/icons/PlusOutlined';
import UploadOutlined from '@ant-design/icons/UploadOutlined';
import CloseCircleFilled from '@ant-design/icons/CloseCircleFilled';
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
  Form,
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
import SortableImageItem from './SortableImageItem';

type Props = {
  name: string;
  label: string;
  required: boolean;
  uploadMaxCount?: number;
  maximumFileSize?: number;
  disabled?: boolean;
};

type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];
export type TFileUpload = UploadFile<ObjectType>;

const acceptedMIMETypes = ['image/jpeg', 'image/jpg', 'image/png'];

export default function ProductDetailImageUpload({
  name,
  label,
  required,
  uploadMaxCount = 50,
  maximumFileSize = 10,
  disabled = false,
}: Props) {
  const [isDrag, setIsDrag] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { imageList, setImageList, addImageList, removeImage } =
    useProductDetailStore();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
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

      setImageList(getNewImageList(imageList) as UploadFile<ObjectType>[]);
    }
  };

  const normFile = (e: ObjectType) => (Array.isArray(e) ? e : e?.fileList);

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
    console.log(info, 'info');
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
        file: info?.file,
        url: uploadResponse,
      };

      addImageList([fileData]);
    } catch {
      void message.error('Upload failed, Please try again');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form.Item
      name={name}
      label={label}
      valuePropName="fileList"
      getValueFromEvent={normFile}
      rules={[
        {
          required: required,
          message: 'Please Upload Product Image',
        },
        {
          validator(_, value) {
            if (required && (!value || value?.length <= 0)) {
              return Promise.reject();
            }
            return Promise.resolve();
          },
        },
      ]}
    >
      {imageList?.length ? (
        <>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={imageList.map(item => item.uid)}
              strategy={rectSortingStrategy}
            >
              <div className="grid h-[165px] grid-cols-12 gap-8 overflow-y-auto rounded-[6px] border-[1px] border-dashed border-[#d9d9d9] p-4">
                {imageList.map((item, index) => (
                  <div
                    key={item.uid}
                    className={clsx(index === 0 && 'col-span-2 row-span-2')}
                  >
                    <SortableImageItem id={item.uid}>
                      <CloseCircleFilled
                        className="absolute -right-2 -top-2 z-[1] cursor-pointer !text-lg !text-error"
                        onClick={() => {
                          // if (imageVariant?.find((ii) => ii === i.url)) {
                          //   openNotification({
                          //     status: "error",
                          //     title:
                          //       "This image cannot be deleted because it is being used as a variant image",
                          //   })
                          //   return
                          // }
                          // const newImageList = imageList.filter(
                          //   item => item?.uid !== item.uid
                          // );
                          removeImage(item);
                        }}
                      />

                      <Image
                        preview={false}
                        className="!aspect-[4/4] !h-full rounded-[8px] object-cover"
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
                        setIsDrag(true);
                      }}
                      onDragLeave={() => setIsDrag(false)}
                      onDrop={() => setIsDrag(false)}
                      className="relative"
                    >
                      {isLoading ? (
                        <LoadingOutlined />
                      ) : (
                        <PlusOutlined
                          className={`${isDrag ? 'pointer-events-none' : ''}`}
                        />
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
                  </Upload>
                )}
              </div>
            </SortableContext>
          </DndContext>
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
          className="[&_div.ant-upload-list]:mt-6"
        >
          <Flex
            gap={4}
            vertical
            justify="center"
            align="center"
            className="group relative min-h-[165px] bg-white"
            onDragOver={() => setIsDrag(true)}
            onDragLeave={() => setIsDrag(false)}
            onDrop={() => setIsDrag(false)}
          >
            {isLoading ? (
              <LoadingOutlined className="!text-[32px] text-primary" />
            ) : (
              <UploadOutlined className="!text-[32px] text-primary" />
            )}

            <p className="ant-upload-text">
              Click to select an image or drag it into the box to upload
            </p>
            <p className="ant-upload-hint">
              Only .png, .jpg, or .jpeg image formats are supported
            </p>
            <p className="ant-upload-hint">
              Limited {uploadMaxCount} files. Maximum file size{' '}
              {maximumFileSize}
              MB. Format{' '}
              {acceptedMIMETypes
                .map(item => item.split('/')[1].toUpperCase())
                .join(', ')}
            </p>

            <div
              className={`pointer-events-none absolute hidden h-full w-full rounded-[8px] bg-slate-200 opacity-95 ${isDrag ? '!flex items-center justify-center' : ''}`}
            >
              Drop here
            </div>
          </Flex>
        </Dragger>
      )}
    </Form.Item>
  );
}
