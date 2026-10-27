import { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, ArrowLeft, Volume2, VolumeX, X } from 'lucide-react';
import { motion } from 'framer-motion';

// --- ĐƯỜNG DẪN ẢNH (Giữ nguyên như bản trước đã fix) ---
import backgroundImage from '../../assets/7c05cac1098e0e161fbc3a4bcf9666f131db2be7.png';
import logoImage from '../../assets/bf5e8d26fcc31aac349677cb1db5dc5dd517594b.png';
import micButtonImage from '../../assets/cf6d8bdb727ed4c954e05372378bbd4dcb452cf6.png';
import continueButtonImage from '../../assets/b8195e403b8a2a2259167410a7c2639422342ab8.png';
import popupBackgroundImage from '../../assets/87d15533d5f20b1de5108ef69745a50ecb7915b9.png';
import popupTitleImage from '../../assets/ec6047b0ce7d39de40f9b95a0d0ec081d31005e5.png';
import popupSubtitleImage from '../../assets/6b39dcef715e47e73099c00e1e70ad7a3620e031.png';
import previewVideoImage from '../../assets/38e36ca26bf9a84943583fe0f8bc69ceac53f685.png';
import instructionTextImage from '../../assets/6b11cb4f63637c0a649c5a7a153edd5e51a23cae.png';
import recordingPopupBgImage from '../../assets/5ad7bb4064705af78524e77de3c8b386db9cfecb.png';
import micAreaBgImage from '../../assets/f4d254b0352e150ba408b64a003547e558696e40.png';
import recordButtonImage from '../../assets/78ab75794dbd3fde298486a163f8bf6c4b854927.png';
import playbackAreaImage from '../../assets/e146d74616349c8cfc08b77cbb14e5b4accbd0b0.png';
import reRecordButtonImage from '../../assets/3958b17b92cbfd3686038da5ac0d4748981b0893.png';
import continuePlaybackButtonImage from '../../assets/b676c64a42b240f3439194d42d35dfe7dcf35d4b.png';
import playButtonImage from '../../assets/951ca0fe854398a3d44bedc610d952c52c309711.png';

interface VoiceRecordingPageProps {
  onBack: () => void;
  onContinue?: () => void;
  onReset?: () => void;
  onNextPage?: (url?: string) => void;
  uploadedImage: string | null;
  recipientName: string;
  trackingData?: Record<string, string>;
}

export function VoiceRecordingPage({ onBack, onContinue, onReset, onNextPage, uploadedImage, recipientName, trackingData }: VoiceRecordingPageProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0); 
  const [playbackTime, setPlaybackTime] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [showBrandSafetyModal, setShowBrandSafetyModal] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [waveformBars, setWaveformBars] = useState<number[]>([]);
  const [videoProgress, setVideoProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement>(null);
  const timerRef = useRef<any>(null);
  const startTimeRef = useRef<number>(0);
  const accumulatedTimeRef = useRef<number>(0);
  const onNextPageRef = useRef<((url?: string) => void) | undefined>(onNextPage);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const MAX_DURATION = 7000;

  useEffect(() => {
    onNextPageRef.current = onNextPage;
  }, [onNextPage]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (isPlaying && audioRef.current) {
      const interval = setInterval(() => {
        setPlaybackTime(audioRef.current?.currentTime || 0);
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isPlaying]);

  const startRecording = async () => {
    try {
      setPermissionError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContextClass();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      analyser.fftSize = 64; 
      source.connect(analyser);
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      sourceRef.current = source;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      const updateWaveform = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        const bars = Array.from(dataArray).slice(0, 50).map(val => val / 255);
        setWaveformBars(bars);
        animationFrameRef.current = requestAnimationFrame(updateWaveform);
      };
      updateWaveform();

      let mimeType = 'audio/webm';
      if (MediaRecorder.isTypeSupported('audio/mp4')) mimeType = 'audio/mp4';
      else if (MediaRecorder.isTypeSupported('audio/aac')) mimeType = 'audio/aac';

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
           audioContextRef.current.close();
        }
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        if (blob.size > 0) {
            setAudioURL(URL.createObjectURL(blob));
            setAudioBlob(blob);
        } else {
            setPermissionError('Lỗi ghi âm: Không thu được dữ liệu.');
        }
        setIsRecording(false);
        setIsPaused(false);
        if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
      };

      mediaRecorder.start(); 
      setIsRecording(true);
      setIsPaused(false);
      setRecordingTime(0);
      accumulatedTimeRef.current = 0;
      startTimeRef.current = Date.now();
      timerRef.current = setInterval(() => {
        const now = Date.now();
        const elapsed = now - startTimeRef.current + accumulatedTimeRef.current;
        setRecordingTime(Math.min(7, Math.floor(elapsed / 1000)));
        if (elapsed >= MAX_DURATION) stopRecording();
      }, 100);
    } catch (error: any) {
      setPermissionError('Vui lòng cho phép quyền truy cập microphone.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && (mediaRecorderRef.current.state === 'recording' || mediaRecorderRef.current.state === 'paused')) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setIsRecording(false);
      setIsPaused(false);
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      accumulatedTimeRef.current += Date.now() - startTimeRef.current;
      setIsPaused(true);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (audioContextRef.current && audioContextRef.current.state === 'running') audioContextRef.current.suspend();
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      startTimeRef.current = Date.now();
      setIsPaused(false);
      timerRef.current = setInterval(() => {
        const now = Date.now();
        const elapsed = now - startTimeRef.current + accumulatedTimeRef.current;
        setRecordingTime(Math.min(7, Math.floor(elapsed / 1000)));
        if (elapsed >= MAX_DURATION) stopRecording();
      }, 100);
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') audioContextRef.current.resume();
    }
  };

  const formatTime = (seconds: number) => `00:${Math.min(7, Math.floor(seconds)).toString().padStart(2, '0')}`;

  const handleContinue = async () => {
    if (!audioBlob) {
        if (isRecording || isPaused) stopRecording();
        setTimeout(handleContinue, 500);
        return;
    }
    setShowPopup(true);
    setVideoProgress(0);
    try {
        const formData = new FormData();
        if (uploadedImage) {
            const res = await fetch(uploadedImage);
            formData.append('image', await res.blob(), 'user_input.jpg');
        }
        const ext = audioBlob.type.includes('mp4') ? 'm4a' : 'webm';
        formData.append('audio', audioBlob, `voice_record.${ext}`); 
        formData.append('recipient_name', recipientName || 'Ba Mẹ');
        formData.append('region', 'MienNam');
        formData.append('gender', 'NU'); 
        formData.append('wish_slug', 'ankhangphucloc');
        
        if (trackingData) {
            formData.append('tracking_data', JSON.stringify(trackingData));
            Object.keys(trackingData).forEach(k => {
                if (trackingData[k]) {
                    formData.append(`tracking_${k}`, trackingData[k]);
                    // Nếu là zalo_user thì gửi riêng ra ngoài luôn
                    if (k === 'zalo_user') {
                        formData.append('zalo_user', trackingData[k]);
                    }
                }
            });
        }

        const response = await fetch('https://linhx.info/api/ensureMiniApp/submit.php', { method: 'POST', body: formData });
        const result = await response.json();
        if (result.success && result.job_id) {
            const poll = setInterval(async () => {
                try {
                    const sRes = await fetch(`https://linhx.info/api/ensureMiniApp/status.php?job_id=${result.job_id}&t=${Date.now()}`);
                    const sData = await sRes.json();
                    if (sData.success) {
                        setVideoProgress(sData.progress || 0);
                        if (sData.status === 'completed' && sData.video_url) {
                            clearInterval(poll);
                            if (onNextPageRef.current) onNextPageRef.current(sData.video_url);
                        } else if (sData.status === 'failed') {
                            clearInterval(poll);
                            setShowPopup(false);
                            if (sData.error_code === 'BRAND_SAFETY_VIOLATION' || sData.error_code === 'CONTENT_VIOLATION') {
                                setShowBrandSafetyModal(true);
                            } else {
                                setPermissionError('Xử lý video thất bại.');
                                setTimeout(() => {
                                    if (onReset) onReset();
                                    else onBack();
                                }, 2000);
                            }
                        }
                    }
                } catch (e) {}
            }, 2000);
        } else { setShowPopup(false); setPermissionError('Lỗi gửi yêu cầu.'); }
    } catch (e) { setShowPopup(false); setPermissionError('Lỗi kết nối server.'); }
  };

  return (
    <div className="h-screen max-h-screen bg-gradient-to-b from-amber-50 to-orange-50 relative overflow-hidden">
      <div className="absolute inset-0 z-0"><img src={backgroundImage} className="w-full h-full object-cover" /></div>
      <div className="relative max-w-md mx-auto px-4 py-4 z-10 h-full flex flex-col">
        <div className="absolute top-2 left-2 z-20"><img src={logoImage} className="w-32 h-auto -ml-2 -mt-2" /></div>
        <button onClick={onBack} className="absolute top-20 left-4 z-20 bg-white/80 p-2 rounded-full shadow-lg"><ArrowLeft className="w-5 h-5 text-[#AF721E]" /></button>
        <div className="flex flex-col items-center justify-center flex-1">
          <motion.div className="w-full max-w-sm mb-6" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="w-full h-64 bg-cover bg-center rounded-3xl p-6 flex flex-col items-center justify-center gap-6" style={{ backgroundImage: `url(${micAreaBgImage})` }}>
              <div className="flex items-center justify-center gap-0.5 h-24 w-full px-2">
                {(isRecording && !isPaused) ? waveformBars.map((v, i) => (
                  <motion.div key={i} className="w-1 rounded-full bg-[#1084D7]" animate={{ height: Math.max(4, v * 60) + 10 }} transition={{ duration: 0.1 }} />
                )) : Array.from({ length: 50 }).map((_, i) => <div key={i} className="w-1 h-2 rounded-full bg-[#93B5D1]" />)}
              </div>
              <div className="w-full max-w-xs"><div className="relative w-full h-4 bg-white/40 rounded-full border-2 border-[#0F61B0] overflow-hidden"><motion.div className="h-full bg-[#1084D7]" animate={{ width: `${(recordingTime / 7) * 100}%` }} transition={{ duration: 0.1 }} /></div></div>
              {(isRecording || isPaused || audioURL) && (
                <div className="text-center">
                  <p className="text-xl font-bold text-[#0F61B0]">{isPlaying ? formatTime(playbackTime) : formatTime(recordingTime)} / 00:07</p>
                  {(isRecording || isPaused) && <p className="text-xs text-gray-600 mt-1">Đang ghi âm... Tối đa 7 giây</p>}
                </div>
              )}
              {audioURL && <audio ref={audioRef} src={audioURL} onEnded={() => setIsPlaying(false)} className="hidden" />}
            </div>
          </motion.div>
          <motion.button onClick={() => { if (isPaused) resumeRecording(); else if (isRecording) pauseRecording(); else startRecording(); }} className="relative transition-transform hover:scale-105 active:scale-95" animate={{ scale: isRecording && !isPaused ? [1, 1.1, 1] : 1 }} transition={{ repeat: isRecording && !isPaused ? Infinity : 0, duration: 1.5 }}>
            <img src={micButtonImage} className="w-[45%] h-auto mx-auto" style={{ filter: isPaused ? 'brightness(0.7)' : 'none' }} />
            {isPaused && <div className="absolute inset-0 flex items-center justify-center"><Pause className="w-12 h-12 text-white drop-shadow-lg" /></div>}
          </motion.button>
          {isRecording ? <p className="text-[#0F61B0] text-2xl font-bold text-center animate-pulse mt-4">Đang thu âm...</p> : <img src={instructionTextImage} className="w-full max-w-xs mx-auto scale-80" />}
          {(isPaused || (!isRecording && audioURL)) && (
            <div className="flex gap-4 justify-center mt-6">
              <button onClick={() => { setIsRecording(false); setIsPaused(false); setRecordingTime(0); setAudioURL(null); setAudioBlob(null); accumulatedTimeRef.current = 0; }}><img src={reRecordButtonImage} className="w-40 h-auto" /></button>
              <button onClick={handleContinue}><img src={continuePlaybackButtonImage} className="w-40 h-auto" /></button>
            </div>
          )}
        </div>
        {permissionError && <div className="mt-4 p-3 rounded-lg bg-[#FFE5E5] text-red-600 text-center text-sm font-medium">{permissionError}</div>}
      </div>
      {showPopup && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <motion.div className="relative rounded-3xl shadow-2xl max-sm w-full overflow-hidden" initial={{ scale: 0.8, y: 50 }} animate={{ scale: 1, y: 0 }}>
            <img src={popupBackgroundImage} className="absolute inset-0 w-full h-full object-cover" />
            <div className="relative p-8">
              <img src={popupTitleImage} alt="Title" className="w-full max-w-xs mx-auto mb-6" />
              <img src={popupSubtitleImage} alt="Subtitle" className="w-full max-w-xs mx-auto mb-6 scale-90" />
              <div className="relative mb-6">
                <video 
                  src="https://linhx.info/api/ensureMiniApp/processingVideo.mp4" 
                  autoPlay 
                  loop 
                  muted={isMuted}
                  playsInline 
                  className="w-full rounded-lg shadow-lg" 
                  onCanPlay={(e) => {
                    e.currentTarget.play().catch(() => {
                        console.log("Autoplay blocked, trying muted...");
                        e.currentTarget.muted = true;
                        setIsMuted(true);
                        e.currentTarget.play().catch(console.error);
                    });
                  }}
                />
                <button 
                  onClick={() => setIsMuted(!isMuted)}
                  className="absolute top-2 right-2 bg-black/50 p-1.5 rounded-full text-white backdrop-blur-sm active:scale-90 transition-transform"
                >
                  {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
              </div>
              <div className="px-4">
                <div className="flex justify-between items-center mb-2 text-[#8B6914] text-sm font-bold"><span>Đang tạo video...</span><span>{Math.round(videoProgress)}%</span></div>
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden border border-gray-300"><div className="h-full rounded-full bg-gradient-to-r from-[#FF6B35] to-[#F7931E]" style={{ width: `${videoProgress}%` }} /></div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Brand Safety Modal */}
      {showBrandSafetyModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden flex flex-col relative shadow-2xl">
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="font-bold text-[#0F61B0]">Thông báo</h3>
                    <button onClick={() => setShowBrandSafetyModal(false)} className="p-1 hover:bg-gray-100 rounded-full">
                        <X size={24} />
                    </button>
                </div>
                <div className="p-8 text-center">
                    <p className="text-gray-700 font-medium text-lg leading-relaxed">
                        Hình ảnh/tên bạn chọn chưa phù hợp.<br/>Vui lòng chọn lại.
                    </p>
                </div>
                <div className="p-6 bg-gray-50 flex justify-center">
                    <button 
                        onClick={() => {
                            setShowBrandSafetyModal(false);
                            if (onReset) onReset();
                            else onBack();
                        }}
                        className="bg-[#0F61B0] text-white px-10 py-3 rounded-full font-bold active:scale-95 transition-transform shadow-lg"
                    >
                        Thoát
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
