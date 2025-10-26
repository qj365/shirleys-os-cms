import AppPaperBox from '@/components/AppPaperBox';
import OverlayPanelWrapper from '@/components/Overlays/OverlayPanelWrapper';
import { Button } from 'antd';
import { useCallback, useRef } from 'react';
import CookingClassList from './CookingClassList';
import CookingClassSchedules, {
  type CookingClassSchedulesRef,
} from './CookingClassSchedules';
import AddEditCookingClass from './AddEditCookingClass';

export default function CookingClassManagement() {
  const refreshSchedulesRef = useRef<CookingClassSchedulesRef>(null);

  const handleDataChange = useCallback(() => {
    // Trigger refresh of schedules when cooking class data changes
    refreshSchedulesRef.current?.refreshData();
  }, []);

  return (
    <>
      <div className="mb-4 flex items-center justify-between gap-4">
        <OverlayPanelWrapper
          renderOverlayPanel={(open, setOpen) => (
            <AddEditCookingClass
              open={open}
              setOpen={setOpen}
              onUpdateSuccess={() => {
                handleDataChange();
              }}
            />
          )}
        >
          <Button type="primary">New Class</Button>
        </OverlayPanelWrapper>
        <OverlayPanelWrapper
          renderOverlayPanel={(open, setOpen) => (
            <CookingClassList
              open={open}
              setOpen={setOpen}
              onDataChange={handleDataChange}
            />
          )}
        >
          <Button variant="outlined">Class List</Button>
        </OverlayPanelWrapper>
      </div>

      <AppPaperBox className="p-6">
        <CookingClassSchedules ref={refreshSchedulesRef} />
      </AppPaperBox>
    </>
  );
}
