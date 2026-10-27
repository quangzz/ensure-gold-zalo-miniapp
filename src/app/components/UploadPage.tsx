import { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { trackEvent } from '../utils/tracking';
import BrandSafetyPopup from './BrandSafetyPopup';

// --- SỬA ĐƯỜNG DẪN ẢNH (Dùng ../../assets) ---
import backgroundImage from '../../assets/7c05cac1098e0e161fbc3a4bcf9666f131db2be7.png';
import logoImage from '../../assets/bf5e8d26fcc31aac349677cb1db5dc5dd517594b.png';
import headerImage from '../../assets/3268e4ceb06b6d331617ff3e817d7abc3d021e14.png';
// import placeholderImage from '../../assets/0499d48e164d2d71e4ef3f231c3f26f28ededf64.png'; // (File này không thấy dùng, tôi comment lại)
import newPlaceholderImage from '../../assets/cb2038abf03bcc2b8077cf4f651b15725f01a6d8.png';
import bottomImage from '../../assets/ddf4252529842396cec698ed38bcdaacd5dd8837.png';
import contentImage from '../../assets/text.png';
import continueButton from '../../assets/13e9115aef05128a450691937a9ab3008231cff3.png';

interface UploadPageProps {
  onBack: () => void;
  onNext: (image: string, name: string) => void;
}

export function UploadPage({ onBack, onNext }: UploadPageProps) {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    trackEvent('page_enter', { page: 'upload' });
  }, []);
  const [recipientName, setRecipientName] = useState('');
  const [showBrandSafetyAlert, setShowBrandSafetyAlert] = useState(false);
  const [isImageBrandSafe, setIsImageBrandSafe] = useState(true);
  const [isTextBrandSafe, setIsTextBrandSafe] = useState(true);
  const [isValidating, setIsValidating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const maxNameLength = 20;

  const checkImageBrandSafetyAPI = async (file: File) => {
    setIsValidating(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const currentJobId = localStorage.getItem('currentJobId');
      if (currentJobId) {
        formData.append('job_id', currentJobId);
      }
      const response = await fetch('https://linhx.info/api/ensureMiniApp/submit_tracking.php?action=check_image', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      if (!result.safe) {
        alert('Ảnh không hợp lệ');
        setUploadedImage(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        setIsImageBrandSafe(true);
      }
    } catch (error) {
      console.error('Error checking image brand safety:', error);
    } finally {
      setIsValidating(false);
    }
  };

  const checkTextBrandSafetyAPI = async (text: string) => {
    if (!text.trim()) return;
    setIsValidating(true);
    try {
      const response = await fetch('https://linhx.info/api/ensureMiniApp/check_text.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const result = await response.json();
      if (!result.safe) {
        setIsTextBrandSafe(false);
        setShowBrandSafetyAlert(true);
      } else {
        setIsTextBrandSafe(true);
      }
    } catch (error) {
      console.error('Error checking text brand safety:', error);
    } finally {
      setIsValidating(false);
    }
  };

  const handleImageUpload = (file: File | undefined) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageDataUrl = e.target?.result as string;
        setUploadedImage(imageDataUrl);
        checkImageBrandSafetyAPI(file);
      };
      reader.readAsDataURL(file);
    } else {
      setUploadedImage(null);
      setIsImageBrandSafe(true);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    handleImageUpload(file);
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
    
    const file = event.dataTransfer.files[0];
    handleImageUpload(file);
  };

  const handleRemoveImage = () => {
    setUploadedImage(null);
    setIsImageBrandSafe(true); // Reset brand safety status
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCloseBrandSafetyAlert = () => {
    setShowBrandSafetyAlert(false);
    if (!isImageBrandSafe) {
      setUploadedImage(null);
      setIsImageBrandSafe(true);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
    if (!isTextBrandSafe) {
      setRecipientName('');
      setIsTextBrandSafe(true);
    }
  };

  return (
    <div className="h-screen max-h-screen bg-gradient-to-b from-amber-50 to-orange-50 relative overflow-hidden flex flex-col">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src={backgroundImage} 
          alt="Background" 
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="relative max-w-md mx-auto px-4 z-10 h-full flex flex-col w-full">
        {/* Logo */}
        <div className="absolute top-2 left-2 z-20">
          <img 
            src={logoImage} 
            alt="Ensure Gold" 
            className="w-32 h-auto -ml-2 -mt-2"
          />
        </div>

        {/* Header */}
        <div className="text-center pt-16 pb-2 shrink-0">
          <img 
            src={headerImage} 
            alt="Lì xì này bạn muốn dành tặng" 
            className="w-full max-sm mx-[0px] my-[-10px]"
          />
        </div>

        {/* Name Input */}
        <div className="relative shrink-0 mt-2 mb-4">
          <input
            type="text"
            value={recipientName}
            onChange={(e) => {
              if (e.target.value.length <= maxNameLength) {
                setRecipientName(e.target.value);
                setIsTextBrandSafe(true);
              }
            }}
            onBlur={() => checkTextBrandSafetyAPI(recipientName)}
            placeholder=""
            className="w-full bg-transparent border-0 border-b-2 border-dotted px-2 pt-2 pb-0 text-center text-lg font-semibold text-gray-800 focus:outline-none placeholder-gray-400"
            style={{ borderBottomWidth: '2px', borderBottomColor: '#AF721E', marginTop: '-20px' }}
          />
          <div className="absolute right-0 -bottom-5 text-xs text-[rgb(175,114,30)] font-medium">
            ({recipientName.length}/{maxNameLength})
          </div>
        </div>

        {/* Upload Area */}
        <div className="flex-1 flex items-start justify-center min-h-0 pt-4">
          <div className="w-full flex items-start justify-center">
            <img 
              src={newPlaceholderImage} 
              alt="Click to upload" 
              className="w-full h-auto max-h-full object-contain mx-[0px] my-[-10px]"
            />
          </div>
        </div>
      </div>

      {/* Continue Button - Outside main container, on yellow background */}
      <div className="absolute bottom-6 left-0 right-0 z-20 flex justify-center">
        <button 
          onClick={() => uploadedImage && isImageBrandSafe && isTextBrandSafe && onNext(uploadedImage, recipientName)}
          disabled={!uploadedImage || !isImageBrandSafe || !isTextBrandSafe || isValidating}
          className={`transition-transform ${
            uploadedImage && isImageBrandSafe && isTextBrandSafe && !isValidating
              ? 'cursor-pointer hover:scale-105' 
              : 'cursor-not-allowed opacity-50'
          }`}
        >
          <img 
            src={continueButton} 
            alt="Tiếp tục" 
            className="h-12 w-auto mx-[0px] my-[140px]"
          />
        </button>
      </div>

      {/* Bottom Image with Content */}
      <div className="absolute bottom-32 left-0 right-0 z-10 flex justify-center mx-[0px] my-[30px]">
        <div 
          className="relative w-[60%] max-w-md cursor-pointer transition-transform hover:scale-105 active:scale-95"
          onClick={() => fileInputRef.current?.click()}
        >
          {/* Frame */}
          <img 
            src={bottomImage} 
            alt="Bottom decoration" 
            className="w-full h-auto object-contain mx-[0px] my-[70px]"
          />
          {/* Content Image or Uploaded Image */}
          <div className="absolute inset-0 flex items-center justify-center mx-[0px] my-[80px] pointer-events-none">
            {!uploadedImage ? (
              <img 
                src={contentImage} 
                alt="Content" 
                className="w-[85%] h-auto object-contain"
              />
            ) : (
              <div className="w-[85%] h-[85%] relative">
                <img 
                  src={uploadedImage}
                  alt="Uploaded preview" 
                  className="w-[90%] h-[90%] object-contain rounded-lg mx-auto"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveImage();
                  }}
                  className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full shadow-lg transition-colors pointer-events-auto"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
          
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>
      
      {/* Brand Safety Alert Popup */}
      {showBrandSafetyAlert && (
        <BrandSafetyPopup 
          message="Hình ảnh/tên bạn chọn chưa phù hợp. Vui lòng chọn lại." 
          onClose={handleCloseBrandSafetyAlert} 
        />
      )}
    </div>
  );
}
