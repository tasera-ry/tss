import classNames from 'classnames';

import InfoImg from '@/assets/Info.png';
import texts from '../texts/texts.json';


export function TableLegends() {
  const fin = localStorage.getItem('language');
  const { week } = texts;
  return (
    <div className='flex justify-center'>
      <div className="grid grid-cols-3 gap-2 max-w-7xl">
        {/* Open */}
        <LegendItem label={week.Green[fin]} colorClass="bg-green" />
        {/* Closed */}
        <LegendItem label={week.Blue[fin]} colorClass="bg-turquoise" />
        {/* Range officer confirmed */}
        <LegendItem label={week.Lightgreen[fin]} colorClass="bg-green-light" />
        {/* Range officer on the way */}
        <LegendItem label={week.Orange[fin]} colorClass="bg-orange" />
        {/* Range closed */}
        <LegendItem label={week.Red[fin]} colorClass="bg-red-light" />
        {/* Range officer undefined  */}
        <LegendItem label={week.White[fin]} colorClass="bg-black-tint-05" />
        {/* Track has additional information */}
        <div className='flex gap-1 justify-start items-center pl-2.5'>
          <img
            className="size-5"
            src={InfoImg}
            alt={week.Notice[fin]}
            />
          <p>
            {week.Notice[fin]}
          </p>
        </div>
      </div>
    </div>
  );
};

function LegendItem({ label, colorClass }: { label: string; colorClass: string }) {
  return (
    <div className='flex gap-1 justify-start items-center pl-2.5'>
      <p className={classNames("size-5 border", colorClass)} />
      <p>{label}</p>
    </div>
  );
}
