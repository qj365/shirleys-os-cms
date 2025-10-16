import type { ObjectType } from '@/utils/types';
import { arrayMove } from '@dnd-kit/sortable';
import { message, type UploadFile } from 'antd';
import { create } from 'zustand';
import {
  api,
  type PrismaJson_VariantOptions,
  type TemplateVariantOptionsResponse,
} from '@/lib/api/admin';
import { v4 as uuid } from 'uuid';
import { toastErrorMessage } from '@/utils/dataTypes/string';
export interface ProductProperty {
  id: string;
  name: string;
  values: string[];
  mode: 'edit' | 'view';
}
export interface Variant {
  id: string;
  name: string;
  variantOptionIds: number[];
  price: number;
  compareAtPrice: number;
  stock: number;
  image: string;
  selected: boolean;
  sku?: number;
  minOrder: number;
}

export interface ProductStoreState {
  imageList: UploadFile<ObjectType>[];
  properties: ProductProperty[];
  lastDeleted: { property: ProductProperty; index: number } | null;

  variantOptions: PrismaJson_VariantOptions;
  variants: Variant[];
  isRefreshingTemplates: boolean;
}

interface ProductDetailStore extends ProductStoreState {
  setImageList: (imageList: UploadFile<ObjectType>[]) => void;
  addImageList: (imageList: UploadFile<ObjectType>[]) => void;
  removeImage: (image: UploadFile<ObjectType>) => void;

  //product property
  addProperty: () => void;
  deleteProperty: (index: number) => void;
  restoreDeleted: () => void;
  updateProperty: (index: number, newProp: Partial<ProductProperty>) => void;
  reorderProperties: (from: number, to: number) => void;
  reorderValues: (propertyIndex: number, from: number, to: number) => void;

  //variant
  setVariantOptions: (opts: PrismaJson_VariantOptions) => void;
  setVariants: (variants: Variant[]) => void;

  updateVariant: (id: string, patch: Partial<Variant>) => void;
  bulkUpdateVariants: (ids: string[], patch: Partial<Variant>) => void;

  handleGetTemplateVariants: () => Promise<void>;

  //set all store
  setProductDetailStore: (values: ProductStoreState) => void;
}

export const initProductDetailStoreValues: ProductStoreState = {
  imageList: [],
  properties: [{ id: 'p1', name: '', values: [], mode: 'edit' }],
  lastDeleted: null,
  variantOptions: [],
  variants: [],
  isRefreshingTemplates: false,
};

export const useProductDetailStore = create<ProductDetailStore>((set, get) => ({
  imageList: [],

  properties: [{ id: 'p1', name: '', values: [], mode: 'edit' }],

  lastDeleted: null,

  variantOptions: [],
  variants: [],
  isRefreshingTemplates: false,

  setImageList: images => set({ imageList: images }),
  addImageList: imgs => {
    const currentImageList = get().imageList || [];

    return set({ imageList: [...currentImageList, ...imgs] });
  },
  removeImage: image => {
    const isUseAsVariantImage = get().variants.some(
      v => v.image === image?.url
    );

    if (isUseAsVariantImage) {
      message.error(
        'This image cannot be deleted because it is being used as a variant image'
      );
      return;
    }

    const newImageList = (get().imageList || []).filter(
      item => item.uid !== image?.uid
    );
    return set({ imageList: newImageList });
  },

  addProperty: () => {
    const props = get().properties;
    if (props.length >= 3) return;
    set({
      properties: [
        ...props,
        { id: `p${Date.now()}`, name: '', values: [], mode: 'edit' },
      ],
    });
  },

  deleteProperty: index => {
    const props = get().properties;
    const deleted = props[index];
    const updated = props.filter((_, i) => i !== index);
    set({ properties: updated, lastDeleted: { property: deleted, index } });
  },

  restoreDeleted: () => {
    const { lastDeleted, properties } = get();
    if (!lastDeleted) return;
    const updated = [...properties];
    updated.splice(lastDeleted.index, 0, lastDeleted.property);
    set({ properties: updated, lastDeleted: null });
  },

  updateProperty: (index, newProp) => {
    const props = [...get().properties];
    props[index] = { ...props[index], ...newProp };
    set({ properties: props });
  },

  reorderProperties: (from, to) => {
    const props = [...get().properties];
    const [moved] = props.splice(from, 1);
    props.splice(to, 0, moved);
    set({ properties: props });
  },

  reorderValues: (propertyIndex, from, to) => {
    const props = [...get().properties];
    const prop = props[propertyIndex];
    if (!prop) return;
    if (from === to) return;
    props[propertyIndex] = {
      ...prop,
      values: arrayMove(prop.values, from, to),
    };
    set({ properties: props });
  },

  //variant

  setVariantOptions: opts => set({ variantOptions: opts }),
  setVariants: variants => set({ variants }),

  updateVariant: (id, patch) =>
    set(state => ({
      variants: state.variants.map(v => (v.id === id ? { ...v, ...patch } : v)),
    })),

  bulkUpdateVariants: (ids, patch) =>
    set(state => ({
      variants: state.variants.map(v =>
        ids.includes(v.id) ? { ...v, ...patch } : v
      ),
    })),
  handleGetTemplateVariants: async () => {
    const state = get();
    const viewProps = state.properties.filter(p => p.mode === 'view');
    if (!viewProps.length) return;

    try {
      set({ isRefreshingTemplates: true });

      const response: TemplateVariantOptionsResponse =
        await api.product.getTemplateVariantOptions({
          requestBody: viewProps.map(p => ({
            name: p.name,
            options: p.values,
          })),
        });

      const variantOptions = response.variantOptions ?? [];
      const productVariants = response.productVariants ?? [];

      // Map response data to FE variant model
      const variants: Variant[] = productVariants.map(pv => ({
        id: uuid(),
        name: pv.name,
        variantOptionIds: pv.variantOptionIds,
        price: 0,
        compareAtPrice: 0,
        stock: 0,
        image: '',
        selected: false,
        minOrder: 1,
      }));

      set({
        variantOptions,
        variants,
        isRefreshingTemplates: false,
      });
    } catch (error) {
      toastErrorMessage(error);
      set({ isRefreshingTemplates: false });
    }
  },
  //reset store
  setProductDetailStore: values =>
    set({
      ...values,
    }),
}));
