import AppPaperBox from '@/components/AppPaperBox';
import ProductDetailImageUpload from './ProductDetailImageUpload';

export default function ProductDetailMedia() {
  return (
    <AppPaperBox className="p-4">
      <h3 className="mb-4 line-clamp-2 text-lg font-semibold text-primary">
        Media
      </h3>
      <ProductDetailImageUpload label="Product Images" name="images" required />
    </AppPaperBox>
  );
}
