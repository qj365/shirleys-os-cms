import type { ObjectType } from '@/utils/types';
import type { UploadFile } from 'antd';
import { create } from 'zustand';

interface productDetailStore {
  imageList: UploadFile<ObjectType>[];
  setImageList: (imageList: UploadFile<ObjectType>[]) => void;
  addImageList: (imageList: UploadFile<ObjectType>[]) => void;
  removeImage: (image: UploadFile<ObjectType>) => void;
}

export const useProductDetailStore = create<productDetailStore>((set, get) => ({
  imageList: [],
  setImageList: images => set({ imageList: images }),
  addImageList: imgs => {
    const currentImageList = get().imageList || [];

    return set({ imageList: [...currentImageList, ...imgs] });
  },
  removeImage: image => {
    const newImageList = (get().imageList || []).filter(
      item => item.uid !== image?.uid
    );
    return set({ imageList: newImageList });
  },
}));
