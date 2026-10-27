import { useState } from 'react';
import { motion } from 'framer-motion'; 

// --- ĐƯỜNG DẪN ẢNH ---
import backgroundImage from '../../assets/7c05cac1098e0e161fbc3a4bcf9666f131db2be7.png';
import logoImage from '../../assets/bf5e8d26fcc31aac349677cb1db5dc5dd517594b.png';
import headerImage from '../../assets/1cd0f0ff828676edb1f1873a4fd27db276e68bf2.png';
import optionImage from '../../assets/5c882aad5d4f2f8be20829abfb1f4d15867ba43e.png';
import dividerImage from '../../assets/9db70b6f766f63ca5144aaeb76e40a6e8363a281.png';
import option2Image from '../../assets/f572e39dbbea377bd2227e5311cc60ac764e388a.png';

import { VoiceRecordingPage } from './VoiceRecordingPage';
import { TextGreetingPage } from './TextGreetingPage';
import { VideoReadyPage } from './VideoReadyPage';

interface RecordingPageProps {
  onBack: () => void;
  onNext: () => void; 
  onReset?: () => void;
  uploadedImage: string | null;
  recipientName: string;
  onVideoGenerated: (url: string) => void;
  trackingData?: Record<string, string>;
}

export function RecordingPage({ onBack, onNext, onReset, uploadedImage, recipientName, onVideoGenerated, trackingData }: RecordingPageProps) {
  const [showVoiceRecording, setShowVoiceRecording] = useState(false);
  const [showTextGreeting, setShowTextGreeting] = useState(false);
  const [showVideoReady, setShowVideoReady] = useState(false);

  if (showVoiceRecording) {
    return (
        <VoiceRecordingPage 
            onBack={() => setShowVoiceRecording(false)} 
            onReset={onReset}
            onNextPage={(url) => {
                setShowVoiceRecording(false);
                if (url) onVideoGenerated(url);
            }}
            uploadedImage={uploadedImage}
            recipientName={recipientName}
            // @ts-ignore
            trackingData={trackingData}
        />
    );
  }

  if (showTextGreeting) {
    return (
      <TextGreetingPage 
        onBack={() => setShowTextGreeting(false)} 
        onReset={onReset}
        onNext={(url) => {
          setShowTextGreeting(false);
          if (url) onVideoGenerated(url);
        }} 
        uploadedImage={uploadedImage}
        recipientName={recipientName}
        // @ts-ignore
        trackingData={trackingData}
      />
    );
  }

  if (showVideoReady) {
    return <VideoReadyPage onBack={() => setShowVideoReady(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 relative">
      <div className="fixed inset-0 z-0">
        <img src={backgroundImage} alt="Background" className="w-full h-full object-cover" />
      </div>

      <div className="relative max-w-md mx-auto px-4 py-2 z-10 h-full flex flex-col justify-center">
        <div className="fixed top-0 left-0 z-20 p-[0px] px-[0px] py-[10px]">
          <img src={logoImage} alt="Ensure Gold" className="w-32 h-auto -ml-4 -mt-4" />
        </div>

        <div className="text-center mb-3 pt-16">
          <img src={headerImage} alt="Lời chúc năm mới" className="w-full max-w-xs mx-auto" />
        </div>

        <motion.div 
          className="text-center mb-3 cursor-pointer"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowVoiceRecording(true)}
        >
          <img src={optionImage} alt="Options" className="w-[50%] max-w-[513px] mx-auto" />
        </motion.div>

        <div className="text-center my-3">
          <img src={dividerImage} alt="Divider" className="w-full max-w-md mx-auto" />
        </div>

        <motion.div 
          className="text-center mt-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowTextGreeting(true)}
        >
          <img src={option2Image} alt="Option 2" className="w-[60%] max-w-[513px] mx-auto" />
        </motion.div>
      </div>
    </div>
  );
}
