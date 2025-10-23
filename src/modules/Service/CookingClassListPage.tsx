import AppHelmet from '@/components/AppHelmet/AppHelmet';
import CookingClassManagement from '@/features/cooking-class/components/CookingClassManagement';

export default function CookingClassListPage() {
  return (
    <>
      <AppHelmet title="Cooking Class" />
      <CookingClassManagement />
    </>
  );
}
