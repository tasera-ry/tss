import classNames from 'classnames';
import { useLingui } from '@lingui/react/macro';

export function ExplanationBox() {
  const { t } = useLingui();
  return (
    <div className="flex justify-center">
      <div className="flex gap-4 max-w-7xl">
        {/* Open */}
        <LegendItem label={t`Range officer confirmed`} colorClass="bg-green-500" />
        {/* Closed */}
        <LegendItem
          label={t`Range officer not confirmed`}
          colorClass="bg-light-gray-500"
        />
        {/* Range closed */}
        <LegendItem label={t`Range closed`} colorClass="bg-red-500" />
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
