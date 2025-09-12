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
      className={`flex transform items-center rounded-xl border px-2.5 py-2 text-sm transition-all duration-300 ease-in-out sm:px-3 ${
        isActive
          ? 'scale-105 border-[#3b82f6] bg-[#3b82f6] text-white shadow-lg hover:border-[#2563eb] hover:bg-[#2563eb]'
          : 'border-[#3b82f6] bg-white text-[#3b82f6] hover:border-[#2563eb] hover:bg-blue-50 hover:text-[#2563eb]'
      }`}
      title="Find the best discounts and price drops"
    >
      <span className="hidden sm:inline">Discount Hunter</span>
      <span className="sm:hidden">Hunt</span>
    </button>
  );
};

export default DiscountHunterButton;
