import React from 'react';
import { X } from 'lucide-react';

interface BrandSafetyPopupProps {
  message: string;
  onClose: () => void;
}

const BrandSafetyPopup: React.FC<BrandSafetyPopupProps> = ({ message, onClose }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-sm rounded-3xl overflow-hidden flex flex-col relative text-left shadow-2xl">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b bg-red-50">
          <h3 className="font-bold text-lg text-red-700">Thông báo An toàn Thương hiệu</h3>
          <button onClick={onClose} className="p-2 hover:bg-red-100 rounded-full transition-colors">
            <X size={20} className="text-red-600" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 w-full p-6 text-sm text-gray-800 leading-relaxed text-center">
          <p className="font-semibold text-red-600">{message}</p>
        </div>

        {/* Footer */}
        <div className="p-4 bg-red-50 flex justify-center border-t">
          <button
            onClick={onClose}
            className="bg-red-600 hover:bg-red-700 text-white px-8 py-2 rounded-full font-bold shadow-lg active:scale-95 transition-all"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default BrandSafetyPopup;
