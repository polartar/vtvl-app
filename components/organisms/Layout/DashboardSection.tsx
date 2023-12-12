import Chip from '@components/atoms/Chip/Chip';
import BarRadio, { Option } from '@components/atoms/FormControls/BarRadio/BarRadio';
import { Typography } from '@components/atoms/Typography/Typography';
import { useEffect, useState } from 'react';

interface IDashboardSectionProps {
  title: string;
  notifCount?: number;
  children: React.ReactNode;
  filters?: Option[];
  onFilterChange?: (value: any) => void;
}

const DashboardSection = ({
  title,
  notifCount,
  children,
  filters,
  onFilterChange,
  ...props
}: IDashboardSectionProps) => {
  const [selectedFilter, setSelectedFilter] = useState(filters ? filters[0].value : '');

  const handleFilterChange = (e: any) => {
    setSelectedFilter(e.target.value);
  };

  useEffect(() => {
    onFilterChange?.(selectedFilter);
  }, [selectedFilter]);

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Title section */}
      <div className="flex flex-row items-center justify-between gap-3">
        <div className="flex flex-row items-center gap-2">
          <Typography variant="sora" size="base" className="font-semibold text-neutral-900">
            {title}
          </Typography>
          {notifCount && <Chip rounded size="small" color="danger" label={notifCount.toString()} />}
        </div>
        {filters && (
          <BarRadio options={filters} variant="tab-small" value={selectedFilter} onClick={handleFilterChange} />
        )}
      </div>
      {/* Table / Content section */}
      {children}
    </div>
  );
};

export default DashboardSection;
