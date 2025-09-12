import React, { useState } from 'react';
import { useLocalize } from '~/hooks';
import { Dropdown } from './ui';
import type { Option } from '~/common';

interface Store {
  id: string;
  name: string;
  description?: string;
  icon?: React.ReactNode;
}

const availableStores: Store[] = [
  {
    id: 'default',
    name: 'Default Store',
    description: 'Default chat store',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9,22 9,12 15,12 15,22"/>
      </svg>
    )
  },
  {
    id: 'shop-mind-ai',
    name: 'ShopMind AI',
    description: 'ShopMind AI store',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="3"/>
        <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"/>
      </svg>
    )
  },
  {
    id: 'marketplace',
    name: 'Marketplace',
    description: 'App marketplace store',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
        <line x1="3" y1="6" x2="21" y2="6"/>
        <path d="M16 10a4 4 0 0 1-8 0"/>
      </svg>
    )
  }
];

interface StoresDropdownProps {
  className?: string;
  onStoreChange?: (storeId: string) => void;
}

export default function StoresDropdown({ className, onStoreChange }: StoresDropdownProps) {
  const localize = useLocalize();
  const [selectedStore, setSelectedStore] = useState<string>('default');

  const handleStoreChange = (storeId: string) => {
    setSelectedStore(storeId);
    onStoreChange?.(storeId);
  };

  const options: Option[] = availableStores.map(store => ({
    value: store.id,
    label: store.name,
    icon: store.icon
  }));

  const selectedStoreData = availableStores.find(store => store.id === selectedStore);

  return (
    <Dropdown
      value={selectedStore}
      onChange={handleStoreChange}
      options={options}
      className={className}
      icon={selectedStoreData?.icon}
      ariaLabel={localize('com_ui_select_store') || 'Select store'}
      testId="stores-dropdown"
      renderValue={(option) => (
        <div className="flex items-center gap-2">
          {option.icon && <span className="flex-shrink-0">{option.icon}</span>}
          <span className="truncate">{option.label}</span>
        </div>
      )}
    />
  );
}
