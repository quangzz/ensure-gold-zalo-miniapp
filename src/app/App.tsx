import { useState, useEffect, useRef } from 'react';
import { trackEvent } from './utils/tracking';

// --- ĐƯỜNG DẪN ẢNH ---
import backgroundImage from '../assets/66a94158565cd9a00964412187fab6edfd620507.png';
import footerImage from '../assets/fb974e43ae32257324e7b30b5237f91c886b6017.png';
import buttonImage from '../assets/d531687e00db26963b141613a54c9ba662a799fb.png';
import textImage from '../assets/e9349ab01778841472e4d54fe5042d9eee76f337.png';
import featureImage from '../assets/b01f41d88a926bbc001c1427fb8c57f8f202dd09.png';
import fireworksImage from '../assets/eb05b2a55146865e1048e371f91f84f7388d30e3.png';
import familyTetImage from "../assets/anhthiep123.png";

// --- ĐƯỜNG DẪN COMPONENT ---
import { UploadPage } from './components/UploadPage';
import { RecordingPage } from './components/RecordingPage';
import { VoiceRecordingPage } from './components/VoiceRecordingPage';
import { VideoReadyPage } from './components/VideoReadyPage';
import TCPage from './components/TCPage';

import { Volume2, VolumeX } from 'lucide-react';
import { getUserID } from "zmp-sdk/apis";

type Page = "home" | "upload" | "recording" | "voice" | "video";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [lastPage, setLastPage] = useState<Page | null>(null);
  const [pageStartTime, setPageStartTime] = useState<number>(Date.now());
  const [isMuted, setIsMuted] = useState(true);

  // Track Page Timing and Navigation
  useEffect(() => {
    const now = Date.now();
    if (lastPage) {
      const duration = Math.floor((now - pageStartTime) / 1000);
      trackEvent('page_exit', {
        page: lastPage,
        duration_seconds: duration,
        next_page: currentPage
      });
    }
    trackEvent('page_enter', { page: currentPage });
    setLastPage(currentPage);
    setPageStartTime(now);
  }, [currentPage]);
  const [trackingData, setTrackingData] = useState<Record<string, string>>({});
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [recipientName, setRecipientName] = useState('');
  const [finalVideoUrl, setFinalVideoUrl] = useState<string | null>(null);
  const [zaloUser, setZaloUser] = useState<any>(() => {
      const saved = localStorage.getItem('zalo_user');
      return saved ? JSON.parse(saved) : null;
  });

  // --- MỚI: State để kiểm tra checkbox đồng ý ---
  const [isAgreed, setIsAgreed] = useState(false);
  const [showTC, setShowTC] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);

  // Parse Query Parameters for Tracking
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
    if (Object.keys(params).length > 0) {
      console.log("[Tracking] URL Params detected:", params);
      setTrackingData(params);
    }
  }, []);

  // Listen for custom navigation event
  useEffect(() => {
    const handleNavigateToVideo = () => {
      setCurrentPage("video");
    };
    window.addEventListener("navigate-to-video", handleNavigateToVideo);
    return () => window.removeEventListener("navigate-to-video", handleNavigateToVideo);
  }, []);

  // Auto-play music on homepage and pause on other pages
  useEffect(() => {
    if (audioRef.current) {
      if (currentPage === "home" && !isMuted) {
        audioRef.current.play().catch(console.log);
      } else {
        audioRef.current.pause();
      }
    }
  }, [currentPage, isMuted]);

  // Enable audio on first interaction
  useEffect(() => {
    const enableAudio = () => {
      if (audioRef.current && isMuted) {
        audioRef.current.play().catch(console.error);
        setIsMuted(false);
      }
    };
    document.addEventListener("click", enableAudio, { once: true });
    return () => document.removeEventListener("click", enableAudio);
  }, [isMuted]);

  const toggleMute = () => {
    trackEvent('toggle_mute', { is_muted: !isMuted });
    if (audioRef.current) {
      if (isMuted) audioRef.current.play();
      else audioRef.current.pause();
      setIsMuted(!isMuted);
    }
  };

  // --- MỚI: Hàm xử lý khi bấm nút tham gia ---
  const handleStart = async () => {
    trackEvent('click_join_now', { is_agreed: isAgreed });
    if (!isAgreed) {
        alert("Vui lòng đồng ý với Thể lệ và điều khoản chương trình để tiếp tục!");
        return;
    }
    
    try {
        // Lấy ID người dùng (Chuỗi định danh duy nhất theo Zalo App, không cần xin quyền)
        const userID = await getUserID({});

        const userData = { id: userID };
        setZaloUser(userData);
        localStorage.setItem('zalo_user', JSON.stringify(userData));
        
        console.log("User ID collected:", userID);
    } catch (error) {
        console.error("Error collecting Zalo User ID:", error);
    }

    setCurrentPage("upload");
  };

  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-amber-50 to-orange-50 overflow-y-auto overflow-x-hidden scrollbar-hide">
      <audio ref={audioRef} autoPlay loop>
        <source src="http://urah.vn/wp-content/uploads/2026/01/chinese-lunar-new-year-music-283891-mp3cut.net_.mp3" type="audio/wav" />
      </audio>

      {currentPage === "upload" && (
        <UploadPage
          onBack={() => setCurrentPage("home")}
          onNext={(image, name) => {
            setUploadedImage(image);
            setRecipientName(name);
            setCurrentPage("recording");
          }}
        />
      )}

      {currentPage === "recording" && (
        <RecordingPage
          onBack={() => setCurrentPage("upload")}
          onNext={() => setCurrentPage("voice")}
          onReset={() => setCurrentPage("upload")}
          uploadedImage={uploadedImage}
          recipientName={recipientName}
          // @ts-ignore
          trackingData={{ ...trackingData, zalo_user: JSON.stringify(zaloUser) }}
          onVideoGenerated={(url) => {
              setFinalVideoUrl(url);
              setCurrentPage('video');
          }}
        />
      )}

      {currentPage === "voice" && (
        <VoiceRecordingPage
          key="voice-page"
          onBack={() => setCurrentPage("recording")}
          onReset={() => setCurrentPage("upload")}
          onNextPage={(url) => {
            if (url) setFinalVideoUrl(url);
            setCurrentPage("video");
          }}
          uploadedImage={uploadedImage}
          recipientName={recipientName}
          // @ts-ignore
          trackingData={{ ...trackingData, zalo_user: JSON.stringify(zaloUser) }}
        />
      )}

      {currentPage === "video" && (
        <VideoReadyPage onBack={() => setCurrentPage("voice")} videoUrl={finalVideoUrl} />
      )}

      {currentPage === "home" && (
        <>
          <div className="fixed inset-0 z-0">
            <img src={backgroundImage} alt="Background" className="w-full h-full object-cover" />
          </div>

          <div className="relative z-10 h-[115vh] overflow-hidden">
            <div className="relative flex flex-col items-center">
              <div className="w-full flex justify-center mt-[-20px]">
                <img src={fireworksImage} alt="Fireworks" className="w-full max-w-md h-auto" />
              </div>

              <div className="relative w-full mt-[-40px] overflow-hidden flex justify-end p-[0px] pr-[5px]">
                <div className="relative w-full max-w-[350px] ml-auto">
                  <img src={familyTetImage} alt="Gia đình Tết" className="absolute top-[10%] left-[50%] w-[46%] h-[68%] object-cover rounded-[8px] z-0 ml-[-5px]" />
                  <img src={featureImage} alt="Tết này lời chúc" className="w-[120%] h-auto relative z-10 mr-[10px] ml-[-5px]" />
                </div>
              </div>

              <div className="w-full flex justify-center mt-[-20px] px-4">
                <img src={textImage} alt="Chúc Tết Khỏi Sắc" className="w-full max-w-[350px] h-auto mx-[0px] my-[30px] ml-[10px]" />
              </div>

              <div className="h-[100px]"></div>
            </div>

            <div className="relative w-full">
              <img src={footerImage} alt="Footer" className="w-full h-auto object-cover mx-[0px] my-[-117px]" />
              <div className="absolute bottom-[125px] left-0 right-0 z-20 pb-4">
                <div className="flex flex-col items-center gap-2">
                  <button onClick={handleStart} className="transition-transform duration-300 active:scale-95">
                    <img src={buttonImage} alt="Tham gia ngay" className="w-64 h-auto" />
                  </button>

                  <div className="flex items-center gap-2 px-4">
                    <input 
                        type="checkbox" 
                        id="agreement" 
                        className="w-4 h-4 cursor-pointer accent-[#0F61B0] flex-shrink-0"
                        checked={isAgreed}
                        onChange={(e) => setIsAgreed(e.target.checked)}
                    />
                    <label htmlFor="agreement" className="text-white text-xs cursor-pointer">
                      Tôi đã đọc và đồng ý với{' '}
                      <span 
                        className="underline hover:text-blue-200"
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowTC(true);
                        }}
                      >
                        Thể lệ và điều khoản chương trình
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="fixed top-24 left-4 z-30">
            <button onClick={toggleMute} className="bg-white rounded-full p-2 shadow-md active:scale-95 transition-transform">
              {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
            </button>
          </div>

          {showTC && <TCPage onClose={() => setShowTC(false)} />}
        </>
      )}
    </div>
  );
}
