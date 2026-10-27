import { ArrowLeft, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { saveVideoToGallery } from "zmp-sdk/apis";

// --- ĐƯỜNG DẪN ẢNH (Giữ nguyên) ---
import backgroundImage from '../../assets/7ff14bb579345814736cef4e18038ca14c112b2d.png';
import logoImage from '../../assets/bf5e8d26fcc31aac349677cb1db5dc5dd517594b.png';
import footerImage from '../../assets/footer.png';
import shareButtonImage from '../../assets/88ce3b70ca7b86276e3531e09dac8d4768dbcf92.png';
import downloadButtonImage from '../../assets/3a5bef4a683cb2158177aab1ff1687d0dde71c24.png';
import titleImage from '../../assets/fa7a50f1f53168cb5c90cac6a6dcbfd540a9b56e.png';
import popupBackgroundImage from '../../assets/a3c2d09a35d235401440daa8f88f3668653eb8fa.png';
import popupContentImage from '../../assets/1.png';
import popupDownloadButtonImage from '../../assets/aabe801b2b3f3e88df898027bcbd7716b96c2fb2.png';
import closeButtonImage from '../../assets/34a939ed4d25782b6e54d19261395265c8f1d614.png';
import popupDownloadSuccessImage from '../../assets/fd5cf62f135e302b8d0d80fd631de7ec5dc5a68d.png';
import TCPage from './TCPage';

// --- LOGIC: Interface đầy đủ của Đoạn 2 ---
interface VideoReadyPageProps {
  onBack: () => void;
  videoUrl?: string | null;
}

export function VideoReadyPage({ onBack, videoUrl }: VideoReadyPageProps) {
  const [showDownloadPopup, setShowDownloadPopup] = useState(false);
  const [showSharePopup, setShowSharePopup] = useState(false);
  const [showTC, setShowTC] = useState(false);

  // Ép trang có thể scroll khi nội dung vượt quá viewport
  useEffect(() => {
    document.body.style.overflow = 'auto';
    return () => {
      document.body.style.overflow = 'hidden';
    };
  }, []);
  
  // --- LOGIC: Xử lý video và Autoplay của Đoạn 2 ---
  const videoRef = useRef<HTMLVideoElement>(null);

  // Xử lý URL để tránh cache (thêm timestamp) hoặc dùng video mẫu nếu null
  const finalVideoUrl = videoUrl 
    ? (videoUrl.includes('?') ? `${videoUrl}&v=${Date.now()}` : `${videoUrl}?v=${Date.now()}`)
    : 'http://urah.vn/wp-content/uploads/2026/01/Ens_engagement-260121.mp4';

  console.log('VideoReadyPage mounted. Video URL:', finalVideoUrl);

  useEffect(() => {
    if (videoRef.current) {
      console.log('Attempting to play video...');
      videoRef.current.load();
      const playPromise = videoRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log('Autoplay started successfully');
          })
          .catch(error => {
            console.error('Autoplay prevented:', error);
          });
      }
    }
  }, [finalVideoUrl]);

  const handleDownload = async () => {
    console.log('Downloading video from:', finalVideoUrl);
    
    try {
      // Hiển thị thông báo đang tải
      alert("Đang tải về...");

      // Sử dụng API Native của Zalo SDK để lưu video vào Gallery
      // Yêu cầu: Đã xin quyền tại trang Quản lý ứng dụng
      await saveVideoToGallery({
        videoUrl: finalVideoUrl,
        onProgress: (progress) => {
          console.log(`Đã lưu được ${progress}%...`);
        },
      });
      console.log('Download via saveVideoToGallery successfully');
      
      // Chỉ hiển thị popup thành công sau khi tải xong thực sự
      setShowDownloadPopup(false);
      setShowSharePopup(true);

    } catch (error) {
      console.error('saveVideoToGallery failed, falling back to basic link:', error);
      
      try {
        // Fallback: Thử dùng fetch để lấy blob (chỉ hoạt động nếu server cho phép CORS)
        const response = await fetch(finalVideoUrl, { mode: 'cors' });
        if (!response.ok) throw new Error('Fetch failed');
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = 'Ens_Lixi_ChucTet.mp4';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        console.log('Download triggered via Blob successfully');
      } catch (innerError) {
        console.error('Blob download failed, using direct link fallback:', innerError);
        
        // Fallback cuối cùng: Mở liên kết trực tiếp
        window.open(finalVideoUrl, '_blank');
      }

      // Đóng popup download, mở popup share (Success) sau một khoảng thời gian ngắn
      setShowDownloadPopup(false);
      setTimeout(() => {
        setShowSharePopup(true);
      }, 1000);
    }
  };

  const handleShare = async () => {
    // Feature disabled
    console.log('Share feature is disabled');
  };

  return (
    <>
      <div className="relative w-full h-[102vh] bg-gradient-to-b from-amber-50 to-orange-50 overflow-y-auto overflow-x-hidden scrollbar-hide">
        {/* Background Image - Fixed */}
        <div className="fixed inset-0 z-0">
          <img 
            src={backgroundImage} 
            alt="Background" 
            className="w-full h-full object-cover"
          />
        </div>

        {/* Header */}
        <div className="relative w-full z-20 bg-transparent">
          <img 
            src={logoImage} 
            alt="Ensure Gold" 
            className="w-32 h-auto block"
            style={{ 
              margin: 0, 
              padding: 0,
              display: 'block'
            }}
          />
        </div>

        {/* Back Button */}
        <button 
          onClick={onBack}
          className="absolute top-20 left-4 bg-white/80 hover:bg-white p-3 rounded-full shadow-lg transition-all z-20"
        >
          <ArrowLeft className="w-6 h-6" style={{ color: '#AF721E' }} />
        </button>

        {/* Content - No scroll */}
        <div className="relative max-w-md mx-auto z-10">
          {/* Main Content */}
          <motion.div
            className="text-center px-[16px] pt-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-2xl font-bold mb-2" style={{ color: '#0F61B0' }}>
              Video đã sẵn sàng
            </h1>
            
            {/* Placeholder for video preview */}
            {/* --- GIAO DIỆN: Dùng margin my-[-70px] của ĐOẠN 1 (Đẹp hơn) --- */}
            <div className="bg-white/80 rounded-lg p-3 shadow-lg scale-[0.6] max-w-xs my-[-70px] mx-[43px]">
              <div className="w-full h-[24rem] bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                {/* --- LOGIC: Dùng thẻ video thông minh của ĐOẠN 2 --- */}
                {finalVideoUrl && (
                  <video 
                    ref={videoRef}
                    src={finalVideoUrl}
                    controls
                    controlsList="nofullscreen nodownload"
                    disablePictureInPicture
                    playsInline
                    webkit-playsinline="true"
                    className="w-full h-full object-cover"
                    autoPlay
                    loop
                    // Bỏ muted để có tiếng nếu autoplay được phép sau tương tác người dùng
                    // Nhưng thêm logic xử lý autoplay trong useEffect
                    onLoadStart={() => console.log('Video load started')}
                    onPlay={(e) => {
                        console.log('Video started playing');
                        const video = e.currentTarget;
                        // For iOS, setting webkit-playsinline to false before play can trigger native fullscreen
                        video.setAttribute('webkit-playsinline', 'false');
                        video.setAttribute('playsinline', 'false');
                        
                        // Request Fullscreen when user clicks Play
                        if (video.requestFullscreen) {
                            video.requestFullscreen().catch(err => console.log("Fullscreen error:", err));
                        } else if ((video as any).webkitRequestFullscreen) {
                            (video as any).webkitRequestFullscreen();
                        } else if ((video as any).webkitEnterFullscreen) {
                            (video as any).webkitEnterFullscreen(); // iOS Safari specific
                        }
                    }}
                    onCanPlay={(e) => {
                        console.log('Video can play now');
                        const video = e.currentTarget;
                        video.play().catch(err => {
                            console.log("Autoplay blocked, trying muted...");
                            video.muted = true;
                            video.play().catch(err => console.log("Autoplay failed even when muted"));
                        });
                    }}
                    onError={(e) => console.error('Video playback error:', e)}
                  />
                )}
              </div>
            </div>

            {/* Button Image */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block mb-4"
              onClick={handleDownload}
            >
              <img 
                src={titleImage} 
                alt="Tải về máy và chia sẻ ngay" 
                className="w-full max-w-md h-auto m-[0px]"
              />
            </motion.button>
          </motion.div>
        </div>

        {/* Footer Section - Fixed at bottom */}
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <div className="relative">
            <img 
              src={footerImage} 
              alt="Footer" 
              className="w-full h-auto object-cover"
            />
            
            {/* Two buttons horizontally positioned on the blue section */}
            <div className="absolute bottom-[30px] left-1/2 transform -translate-x-1/2 flex flex-col gap-3 items-center w-full max-w-2xl scale-90">
              <div className="flex gap-6 items-center">
                <button 
                  onClick={() => setShowDownloadPopup(true)}
                  className="transition-all duration-300 active:scale-95"
                >
                  <img 
                    src={shareButtonImage} 
                    alt="Chia sẻ" 
                    className="h-14 w-auto"
                  />
                </button>
                
                <button 
                  onClick={() => setShowDownloadPopup(true)}
                  className="transition-all duration-300 active:scale-95"
                >
                  <img 
                    src={downloadButtonImage} 
                    alt="Tải về" 
                    className="h-14 w-auto"
                  />
                </button>
              </div>
              
              {/* Terms and Conditions Link */}
              <button 
                onClick={() => setShowTC(true)}
                className="text-white hover:text-gray-100 font-semibold text-sm underline transition-colors"
              >
                Thể lệ và điều khoản chương trình
              </button>
            </div>
          </div>
        </div>

        {/* Download Popup */}
        {showDownloadPopup && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {/* Overlay */}
            <div 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowDownloadPopup(false)}
            />
            
            {/* Popup Content */}
            <motion.div
              className="relative rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ duration: 0.3, type: "spring" }}
            >
              {/* Background Image */}
              <img 
                src={popupBackgroundImage} 
                alt="Popup Background" 
                className="absolute inset-0 w-full h-full object-cover"
              />
              
              {/* Content wrapper */}
              <div className="relative p-8">
                <button
                  onClick={() => setShowDownloadPopup(false)}
                  className="absolute top-4 right-4 hover:scale-110 transition-transform z-10"
                >
                  <img 
                    src={closeButtonImage} 
                    alt="Close" 
                    className="w-8 h-8"
                  />
                </button>

                <img 
                  src={popupContentImage} 
                  alt="Video đã sẵn sàng" 
                  className="w-full h-auto mb-6"
                />
                
                <motion.button
                  onClick={handleDownload}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full flex justify-center"
                >
                  <img 
                    src={popupDownloadButtonImage} 
                    alt="Tải về ngay" 
                    className="h-12 w-auto"
                  />
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Share/Success Popup */}
        {showSharePopup && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {/* Overlay */}
            <div 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowSharePopup(false)}
            />
            
            {/* Popup Content */}
            <motion.div
              className="relative rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ duration: 0.3, type: "spring" }}
            >
              <img 
                src={popupBackgroundImage} 
                alt="Popup Background" 
                className="absolute inset-0 w-full h-full object-cover"
              />
              
              <div className="relative p-8">
                <button
                  onClick={() => setShowSharePopup(false)}
                  className="absolute top-4 right-4 hover:scale-110 transition-transform z-10"
                >
                  <img 
                    src={closeButtonImage} 
                    alt="Close" 
                    className="w-8 h-8"
                  />
                </button>

                <div className="flex flex-col items-center space-y-4 mb-6">
                  <img 
                    src={popupDownloadSuccessImage} 
                    alt="Video tải về thành công" 
                    className="w-full h-auto"
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Modal T&C */}
        {showTC && <TCPage onClose={() => setShowTC(false)} />}
      </div>
    </>
  );
}
