import React, { useState } from 'react';

const DiscountHunterButton = () => {
  const [isActive, setIsActive] = useState(false);

  const handleClick = () => {
    setIsActive(!isActive);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`flex transform items-center rounded-2xl border px-2.5 py-1.5 text-sm transition-all duration-300 ease-in-out sm:px-3 ${
        isActive
          ? 'border-surface-submit bg-surface-submit text-white shadow-lg hover:border-surface-submit-hover hover:bg-surface-submit-hover'
          : 'border-surface-submit bg-surface-primary text-surface-submit hover:border-surface-submit-hover hover:bg-surface-hover hover:text-surface-submit dark:hover:bg-surface-hover-alt'
      }`}
      title="Find the best discounts and price drops"
    >
      <span className="hidden sm:inline">Discount Hunter</span>
      <span className="sm:hidden">Hunt</span>
    </button>
  );
};

export default DiscountHunterButton;
