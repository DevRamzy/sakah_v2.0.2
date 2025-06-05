import React from 'react';

interface DetailItemProps {
  icon: React.ElementType;
  label: string;
  value?: string | number | null;
  children?: React.ReactNode;
  className?: string;
}

const DetailItem: React.FC<DetailItemProps> = ({ icon: Icon, label, value, children, className }) => (
  <div className={`py-3 ${className || ''}`}>
    <div className="flex items-center mb-1.5">
      <Icon className="w-5 h-5 mr-2 text-yellow-500 flex-shrink-0" />
      <dt className="text-base font-medium text-neutral-700">{label}</dt>
    </div>
    <dd className="text-neutral-800 ml-7 text-base">
      {children || value || <span className="text-neutral-400 italic">Not specified</span>}
    </dd>
  </div>
);

export default DetailItem;
