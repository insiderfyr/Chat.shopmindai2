import React, { useState } from 'react';

const DailyDealsButton = () => {
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
          ? 'border-[#4d8eff] bg-[#4d8eff] text-white shadow-lg hover:border-[#3d7eff] hover:bg-[#3d7eff]'
          : 'border-[#4d8eff] bg-white text-[#4d8eff] hover:border-[#3d7eff] hover:bg-blue-50 hover:text-[#3d7eff]'
      }`}
      title="Discover today's best deals and offers"
    >
      <span className="hidden sm:inline">Daily Deals</span>
      <span className="sm:hidden">Deals</span>
    </button>
  );
};

export default DailyDealsButton;
