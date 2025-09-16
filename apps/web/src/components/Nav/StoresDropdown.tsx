import React, { useState } from 'react';
import { useLocalize } from '~/hooks';
import { Dropdown } from './ui';
import type { Option } from '~/common';

// Lista de retaileri e-commerce
const retailers = [
  { id: 'alibaba', name: 'Alibaba' },
  { id: 'amazon', name: 'Amazon' },
  { id: 'asos', name: 'ASOS' },
  { id: 'ebay', name: 'eBay' },
  { id: 'etsy', name: 'Etsy' },
  { id: 'flipkart', name: 'Flipkart' },
  { id: 'rakuten', name: 'Rakuten' },
  { id: 'shopify', name: 'Shopify' },
  { id: 'target', name: 'Target' },
  { id: 'walmart', name: 'Walmart' },
];

interface StoresDropdownProps {
  className?: string;
  onStoreChange?: (storeId: string) => void;
}

export default function StoresDropdown({ className, onStoreChange }: StoresDropdownProps) {
  const localize = useLocalize();
  const [selectedStore, setSelectedStore] = useState<string>(retailers[0].id);

  const handleStoreChange = (storeId: string) => {
    setSelectedStore(storeId);
    onStoreChange?.(storeId);
  };

  const options: Option[] = retailers.map((store) => ({
    value: store.id,
    label: store.name,
  }));

  const storeIcon = (
    <svg
      className="h-5 w-5"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9,22 9,12 15,12 15,22" />
    </svg>
  );

  return (
    <Dropdown
      value={selectedStore}
      onChange={handleStoreChange}
      options={options}
      className={className}
      ariaLabel={localize('com_ui_select_store') || 'Select store'}
      testId="stores-dropdown"
      renderValue={() => (
        <div className="flex items-center gap-2">
          {storeIcon}
          <span className="font-medium">Stores</span>
        </div>
      )}
      renderOption={(option) => (
        <div className="flex items-center gap-2">
          <span className="truncate">{option.label}</span>
        </div>
      )}
    />
  );
}
