import classNames from 'classnames';

import InfoImg from '@/assets/Info.png';
import { useLingui } from '@lingui/react/macro';

export function TableLegends({ showAdditionalInfo = true }: { showAdditionalInfo?: boolean }) {
  const { t } = useLingui();
  return (
    <div className="flex justify-center">
      <div className="grid grid-cols-3 gap-2 max-w-7xl">
        {/* Open */}
        <LegendItem label={t`Range officer present`} colorClass="bg-green" />
        {/* Closed */}
        <LegendItem
          label={t`Range officer predefined, not confirmed`}
          colorClass="bg-turquoise"
        />
        {/* Range officer confirmed */}
        {showAdditionalInfo && (
          <LegendItem
            label={t`Range officer confirmed, estimated time of arrival`}
            colorClass="bg-green-light"
          />
        )}
        {!showAdditionalInfo && (
          <LegendItem
            label={t`Range officer confirmed, not present`}
            colorClass="bg-green-light"
          />
        )}
        {/* Range officer on the way */}
        <LegendItem
          label={t`Range officer on the way`}
          colorClass="bg-orange"
        />
        {/* Range closed */}
        <LegendItem label={t`Range closed`} colorClass="bg-red-light" />
        {/* Range officer undefined  */}
        <LegendItem
          label={t`Range officer undefined`}
          colorClass="bg-black-tint-05"
        />
        {/* Track has additional information */}
        {showAdditionalInfo && (
          <div className="flex gap-1 justify-start items-center pl-2.5">
            <img
              className="size-5"
              src={InfoImg}
              alt={t`Track has additional information`}
            />
            <p>{t`Track has additional information`}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function LegendItem({
  label,
  colorClass,
}: { label: string; colorClass: string }) {
  return (
    <div className="flex gap-2 justify-start items-center pl-2.5">
      <p className={classNames('w-4 h-4 border', colorClass)} />
      <p>{label}</p>
    </div>
  );
}
