import React, { useState, useEffect } from 'react';

// Event bus for popup
const popupEvent = {
  listeners: [],
  fire: (config) => {
    return new Promise((resolve) => {
      popupEvent.listeners.forEach(listener => listener(config, resolve));
    });
  },
  subscribe: (listener) => {
    popupEvent.listeners.push(listener);
    return () => {
      popupEvent.listeners = popupEvent.listeners.filter(l => l !== listener);
    };
  }
};

export const showPopup = (title, text, type = 'info') => {
  return popupEvent.fire({ title, text, type, isConfirm: false });
};

export const showConfirm = (title, text) => {
  return popupEvent.fire({ title, text, type: 'warning', isConfirm: true });
};

export function GlobalPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState({});
  const [resolver, setResolver] = useState(null);

  useEffect(() => {
    const handlePopup = (newConfig, resolve) => {
      setConfig(newConfig);
      setResolver(() => resolve);
      setIsOpen(true);
    };
    const unsubscribe = popupEvent.subscribe(handlePopup);
    return unsubscribe;
  }, []);

  if (!isOpen) return null;

  const handleConfirm = () => {
    setIsOpen(false);
    if (resolver) resolver(true);
  };

  const handleCancel = () => {
    setIsOpen(false);
    if (resolver) resolver(false);
  };

  const typeConfig = {
    warning: { icon: '⚠️', bgColor: 'bg-yellow-100', iconColor: 'text-yellow-500', btnColor: 'bg-yellow-500 hover:bg-yellow-600' },
    error: { icon: '❌', bgColor: 'bg-red-100', iconColor: 'text-red-500', btnColor: 'bg-red-500 hover:bg-red-600' },
    success: { icon: '✅', bgColor: 'bg-green-100', iconColor: 'text-green-500', btnColor: 'bg-green-500 hover:bg-green-600' },
    info: { icon: 'ℹ️', bgColor: 'bg-blue-100', iconColor: 'text-blue-500', btnColor: 'bg-blue-500 hover:bg-blue-600' }
  };

  const currentType = typeConfig[config.type] || typeConfig.info;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] opacity-100 transition-opacity duration-300">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm text-center transform scale-100 transition-transform duration-300">
        <div className={`mx-auto flex items-center justify-center h-16 w-16 mb-4 rounded-full ${currentType.bgColor} text-4xl shadow-sm border-2 border-white`}>
          {currentType.icon}
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">{config.title}</h3>
        <p className="text-sm text-gray-500 mb-6 whitespace-pre-line leading-relaxed">{config.text}</p>
        
        <div className="flex justify-center gap-3">
          {config.isConfirm ? (
            <>
              <button 
                onClick={handleConfirm} 
                className={`py-2 px-6 font-semibold text-white rounded-lg shadow-md transition-all w-full focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-300 ${currentType.btnColor}`}
              >
                ยืนยัน
              </button>
              <button 
                onClick={handleCancel} 
                className="py-2 px-6 font-semibold bg-gray-100 text-gray-700 hover:text-gray-900 border border-gray-200 rounded-lg shadow-sm hover:bg-gray-200 transition-all w-full focus:outline-none"
              >
                ยกเลิก
              </button>
            </>
          ) : (
            <button 
              onClick={handleConfirm} 
              className={`py-2 px-6 font-semibold text-white rounded-lg shadow-md transition-all w-full focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-300 ${currentType.btnColor}`}
            >
              ตกลง
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
