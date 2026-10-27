import { ArrowLeft, Volume2, VolumeX, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { trackEvent } from '../utils/tracking';

// --- ĐƯỜNG DẪN ẢNH ---
import backgroundImage from '../../assets/c48d58af43fee75567bdcd218368ccde478a07d2.png';
import logoImage from '../../assets/bf5e8d26fcc31aac349677cb1db5dc5dd517594b.png';
import headerImage from '../../assets/763bab0d92194c3cd5d9c8c10a413a90987c8133.png';
import wish1Image from '../../assets/e1ea3556dcfcf428cccc327ac89c5c3fcc9a2fa5.png';
import wish2Image from '../../assets/ec9e0cb29a7fe0452599f5da3f81f63f421ba7f3.png';
import wish3Image from '../../assets/b992de40f934d4379fdf547702c8e83aae642aa5.png';
import wish4Image from '../../assets/7b7ac38e484dd90a0ce9e78bab99a728893864f8.png';
import wish5Image from '../../assets/d68d962e8a4a03a62dfd9dea56a344559e586b43.png';
import wish6Image from '../../assets/f31304e9bdd927eb22ee0a3d3926e30ad0704045.png';

// Ảnh Preview Card (Dùng làm nền thiệp)
import previewCardImage from '../../assets/123.png';

import completeButtonImage from '../../assets/b4c22f400f876d18ee6df0ff9bcd45b56ae87c6c.png';
import recreateButtonImage from '../../assets/c098ecbceb4b55ad18ecb940b4a81aef50cfd4dc.png';
import popupBackgroundImage from '../../assets/87d15533d5f20b1de5108ef69745a50ecb7915b9.png';
import popupTitleImage from '../../assets/ec6047b0ce7d39de40f9b95a0d0ec081d31005e5.png';
import popupSubtitleImage from '../../assets/6b39dcef715e47e73099c00e1e70ad7a3620e031.png';

// Import Voice Images
import maleVoiceImage from '../../assets/giongnam.png';
import femaleVoiceImage from '../../assets/giongnu.png';
import maleVoiceSelectedImage from '../../assets/GIONG-NAM.png';
import femaleVoiceSelectedImage from '../../assets/GIONG-NU.png';

interface TextGreetingPageProps {
  onBack: () => void;
  onNext: (url: string) => void;
  onReset?: () => void;
  uploadedImage: string | null;
  recipientName: string;
  trackingData?: Record<string, string>;
}

export function TextGreetingPage({ onBack, onNext, onReset, uploadedImage, recipientName, trackingData }: TextGreetingPageProps) {
  const [selectedWishes, setSelectedWishes] = useState<number[]>([]);
  const [showPopup, setShowPopup] = useState(false);
  const [showBrandSafetyModal, setShowBrandSafetyModal] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<'male' | 'female' | null>(null);
  const [videoProgress, setVideoProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentStructureIndex, setCurrentStructureIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const promoVideoRef = useRef<HTMLVideoElement>(null);

  // --- DỮ LIỆU LỜI CHÚC ---
  const wishMap: { [key: number]: string } = {
    1: 'ankhang', 2: 'thinhvuong', 3: 'truongtho', 4: 'cattuong', 5: 'binhan', 6: 'phucloc'
  };

  const WISH_CONTENT: { [key: string]: string[] } = {
    "1-6": [ // An Khang Phúc Lộc
      "Chúc cha mẹ dồi dào sức khỏe, phúc lộc an khang và năm mới khởi sắc rực rỡ.",
      "Gói trọn phúc lộc, gửi gắm an khang trong lời chúc yêu thương dành tặng Cha Mẹ, mong cho năm mới cả nhà khởi sắc",
      "Chẳng cầu gì cao xa, chỉ mong Cha Mẹ nhiều an khang, phúc lộc để đón năm mới khởi sắc cùng cả nhà",
      "Năm sang khởi sắc, chúc cha mẹ an khang phúc lộc, trường thọ an nhiên",
      "Cha Mẹ an khang\nThêm phần phúc lộc\nCả nhà sum vầy\nMừng năm khởi sắc"
    ],
    "2-6": [ // Phúc Lộc Thịnh Vượng (Đảo id 2-6 cho đúng logic sort)
      "Gói trọn thịnh vượng, gửi gắm phúc lộc trong lời chúc yêu thương dành tặng Cha Mẹ, mong cho năm mới cả nhà khởi sắc.",
      "Chúc cha mẹ dồi dào sức khỏe, vạn sự phúc lộc, thịnh vượng và năm mới khởi sắc rực rỡ.",
      "Chẳng cầu gì cao xa, chỉ mong Cha Mẹ nhiều phúc lộc, thịnh vượng để đón năm mới khởi sắc cùng cả nhà.",
      "Năm sang khởi sắc, chúc cha mẹ phúc lộc, thịnh vượng, trường thọ an nhiên.",
      "Cha Mẹ thịnh vượng\nThêm phần phúc lộc\nCả nhà sum vầy\nMừng năm khởi sắc"
    ],
    "4-6": [ // Cát Tường Phúc Lộc
      "Chúc cha mẹ dồi dào sức khỏe, cát tường phúc lộc và năm mới khởi sắc rực rỡ.",
      "Gói trọn cát tường, gửi gắm phúc lộc qua lời chúc yêu thương dành tặng Cha Mẹ, mong cho năm mới cả nhà khởi sắc.",
      "Chẳng ước chi xa xôi, mong Cha Mẹ được phúc lộc cát tường để đón năm mới khởi sắc cùng cả nhà.",
      "Xuân sang khởi sắc, chúc cha mẹ cát tường, phúc lộc, trường thọ an nhiên.",
      "Cha Mẹ cát tường\nHưởng phần phúc lộc\nGia đình quây quần\nĐón năm khởi sắc"
    ],
    "5-6": [ // Bình An Phúc Lộc
      "Chúc cha mẹ dồi dào sức khỏe, bình an phúc lộc và năm mới khởi sắc rực rỡ.",
      "Gói trọn bình an, gửi gắm phúc lộc trong lời chúc yêu thương gửi tới Cha Mẹ, mong cho năm mới cả nhà khởi sắc.",
      "Không cầu cao xa, chỉ mong Cha Mẹ bình an, phúc lộc để đón xuân mới khởi sắc cùng cả nhà.",
      "Tết sang khởi sắc, cầu mong cha mẹ bình an, phúc lộc, trường thọ an nhiên.",
      "Cha Mẹ bình an\nNhận phần phúc lộc\nCả nhà họp mặt\nChúc năm khởi sắc"
    ],
    "3-6": [ // Trường Thọ Phúc Lộc
      "Chúc cha mẹ dồi dào sức khỏe, trường thọ phúc lộc và năm mới khởi sắc rực rỡ.",
      "Gói trọn trường thọ, gửi gắm phúc lộc trong lời chúc yêu thương đến Cha Mẹ, mong cho năm mới cả nhà khởi sắc.",
      "Chẳng cầu gì xa vời, mong Cha Mẹ trường thọ, nhiều phúc lộc để đón năm mới khởi sắc cùng cả nhà.",
      "Năm mới khởi sắc, chúc cha mẹ trường thọ, phúc lộc, đời đời an nhiên.",
      "Cha Mẹ trường thọ\nTrọn phần phúc lộc\nCháu con vui vầy\nMừng xuân khởi sắc"
    ],
    "1-2": [ // Thịnh Vượng An Khang
      "Gói trọn thịnh vượng, gửi gắm an khang vào lời chúc yêu thương dành tặng Cha Mẹ, mong cho năm mới cả nhà khởi sắc.",
      "Chúc cha mẹ dồi dào sức khỏe, thịnh vượng an khang và năm mới khởi sắc rực rỡ.",
      "Chẳng mong chi cao xa, chỉ mong Cha Mẹ thịnh vượng, an khang để đón Tết mới khởi sắc cùng cả nhà.",
      "Khai xuân khởi sắc, chúc cha mẹ thịnh vượng, an khang, trường thọ an nhiên.",
      "Cha Mẹ thịnh vượng\nThêm phần an khang\nCả nhà đoàn viên\nNăm mới khởi sắc"
    ],
    "1-4": [ // Cát Tường An Khang
      "Chúc cha mẹ dồi dào sức khỏe, luôn cát tường an khang và năm mới khởi sắc rực rỡ.",
      "Gói trọn cát tường, gửi gắm an khang nơi lời chúc yêu thương dành tặng Cha Mẹ, mong cho năm mới cả nhà khởi sắc.",
      "Không ước gì cao xa, mong Cha Mẹ đủ đầy cát tường, an khang để đón năm mới khởi sắc cùng cả nhà.",
      "Đón xuân khởi sắc, chúc cha mẹ cát tường, an khang, trường thọ an nhiên.",
      "Cha Mẹ cát tường\nThêm phần an khang\nGia đình sum họp\nĐón xuân khởi sắc"
    ],
    "1-3": [ // Trường Thọ An Khang
      "Năm mới khởi sắc, chúc cha mẹ trường thọ, an khang, mãi mãi an nhiên.",
      "Chúc cha mẹ dồi dào sức khỏe, trường thọ an khang và năm mới khởi sắc rực rỡ.",
      "Gói trọn trường thọ, gửi gắm an khang trong lời chúc yêu thương tặng Cha Mẹ, mong cho năm mới cả nhà khởi sắc.",
      "Chẳng cầu chi xa xôi, mong Cha Mẹ luôn trường thọ, an khang để đón xuân mới khởi sắc cùng cả nhà.",
      "Cha Mẹ trường thọ\nThêm nhiều an khang\nCả nhà chung vui\nMừng năm khởi sắc"
    ],
    "1-5": [ // Bình An An Khang
      "Chúc cha mẹ dồi dào sức khỏe, trọn vẹn an khang và bình an để năm mới khởi sắc rực rỡ.",
      "Gói trọn bình an, gửi gắm an khang bằng lời chúc yêu thương dành tặng Cha Mẹ, mong cho năm mới cả nhà khởi sắc.",
      "Chẳng mong gì cao xa, chỉ cầu Cha Mẹ bình an, an Khang để đón năm mới khởi sắc cùng cả nhà.",
      "Năm tới khởi sắc, chúc cha mẹ bình an, an khang, trường thọ an nhiên.",
      "Cha Mẹ bình an\nVạn phần an khang\nCả nhà hân hoan\nChào năm khởi sắc"
    ],
    "2-5": [ // Bình An Thịnh Vượng
      "Chúc cha mẹ dồi dào sức khỏe, bình an thịnh vượng và năm mới khởi sắc rực rỡ.",
      "Gói trọn bình an, gửi gắm thịnh vượng trong lời chúc yêu thương gửi Cha Mẹ, mong cho năm mới cả nhà khởi sắc.",
      "Không cầu chi cao xa, mong Cha Mẹ trọn bình an, thịnh vượng để đón Tết này khởi sắc cùng cả nhà.",
      "Năm mới khởi sắc, chúc cha mẹ bình an, thịnh vượng, trường thọ an nhiên.",
      "Cha Mẹ bình an\nThêm phần thịnh vượng\nGia đình ấm êm\nĐón Tết khởi sắc"
    ],
    "4-5": [ // Bình An Cát Tường
      "Chúc cha mẹ dồi dào sức khỏe, vạn điều bình an cát tường và năm mới khởi sắc rực rỡ.",
      "Gói trọn bình an, gửi gắm cát tường trong lời chúc yêu thương tới Cha Mẹ, mong cho năm mới cả nhà khởi sắc.",
      "Chẳng ước mong cao xa, chỉ mong Cha Mẹ bình an, cát tường để đón năm mới khởi sắc cùng cả nhà.",
      "Xuân mới khởi sắc, chúc cha mẹ bình an, cát tường, trường thọ an nhiên.",
      "Cha Mẹ bình an\nĐượm phần cát tường\nCả nhà hạnh phúc\nMừng năm khởi sắc"
    ],
    "3-5": [ // Bình An Trường Thọ
      "Chúc cha mẹ dồi dào sức khỏe, an nhiên bình an trường thọ và năm mới khởi sắc rực rỡ.",
      "Gói trọn bình an, gửi gắm trường thọ qua lời chúc yêu thương dành tặng Cha Mẹ, mong cho năm mới cả nhà khởi sắc.",
      "Chẳng cầu chi xa vời, mong Cha Mẹ hưởng bình an, trường thọ để đón xuân này khởi sắc cùng cả nhà.",
      "Năm sang khởi sắc, chúc cha mẹ bình an, trường thọ, tâm thái an nhiên.",
      "Cha Mẹ bình an\nThêm phần trường thọ\nCả nhà gắn kết\nXuân mới khởi sắc"
    ],
    "2-3": [ // Trường Thọ Thịnh Vượng
      "Gói trọn trường thọ, gửi gắm thịnh vượng trong lời chúc yêu thương tặng Cha Mẹ, mong cho năm mới cả nhà khởi sắc.",
      "Chúc cha mẹ dồi dào sức khỏe, trường thọ thịnh vượng và năm mới khởi sắc rực rỡ.",
      "Không mong gì cao xa, chúc Cha Mẹ luôn trường thọ, thịnh vượng để năm mới khởi sắc cùng cả nhà.",
      "Đón Tết khởi sắc, chúc cha mẹ trường thọ, thịnh vượng, sống đời an nhiên.",
      "Cha Mẹ trường thọ\nThêm phần thịnh vượng\nGia đình an vui\nMừng năm khởi sắc"
    ],
    "3-4": [ // Trường Thọ Cát Tường
      "Chúc cha mẹ dồi dào sức khỏe, trường thọ cát tường và năm mới khởi sắc rực rỡ.",
      "Gói trọn trường thọ, gửi gắm cát tường trong lời chúc yêu thương gửi Cha Mẹ, mong cho năm mới cả nhà khởi sắc.",
      "Chẳng cầu mong cao xa, chỉ mong Cha Mẹ trường thọ, cát tường để đón Tết về khởi sắc cùng cả nhà.",
      "Khai xuân khởi sắc, chúc cha mẹ trường thọ, cát tường, hưởng lạc an nhiên.",
      "Cha Mẹ trường thọ\nTrọn phần cát tường\nCả nhà hạnh phúc\nChào xuân khởi sắc"
    ],
    "2-4": [ // Thịnh Vượng Cát Tường
      "Chúc cha mẹ dồi dào sức khỏe, thịnh vượng cát tường và năm mới khởi sắc rực rỡ.",
      "Gói trọn thịnh vượng, gửi gắm cát tường trong lời chúc yêu thương dành Cha Mẹ, mong cho năm mới cả nhà khởi sắc.",
      "Chẳng ước chi xa xôi, mong Cha Mẹ thịnh vượng, cát tường để năm mới khởi sắc cùng cả nhà.",
      "Năm mới khởi sắc, chúc cha mẹ thịnh vượng, cát tường, trường thọ an nhiên.",
      "Cha Mẹ thịnh vượng\nThêm phần cát tường\nCả nhà sum vầy\nChúc năm khởi sắc"
    ]
  };

  const getGreetingTextWithStructure = () => {
    if (selectedWishes.length < 2) return "";
    const sorted = [...selectedWishes].sort((a, b) => a - b);
    
    // Logic ánh xạ Key: 
    // 1: An Khang, 2: Thịnh Vượng, 3: Trường Thọ, 4: Cát Tường, 5: Bình An, 6: Phúc Lộc
    // Cặp 4-5 (Cát Tường - Bình An) đã được kiểm tra kỹ trong WISH_CONTENT
    
    let key = `${sorted[0]}-${sorted[1]}`;
    
    const content = WISH_CONTENT[key];
    if (!content) return "Chúc gia đình năm mới khởi sắc, vạn sự như ý!";
    
    const text = content[currentStructureIndex];
    return text;
  };

  useEffect(() => {
    if (selectedWishes.length === 2) {
        setCurrentStructureIndex(Math.floor(Math.random() * 5));
    }
  }, [selectedWishes]);

  const wishes = [
    { id: 1, image: wish1Image, alt: 'An Khang' },
    { id: 2, image: wish2Image, alt: 'Thịnh Vượng' },
    { id: 3, image: wish3Image, alt: 'Trường Thọ' },
    { id: 4, image: wish4Image, alt: 'Cát Tường' },
    { id: 5, image: wish5Image, alt: 'Bình An' },
    { id: 6, image: wish6Image, alt: 'Phúc Lộc' },
  ];

  const handleWishClick = (id: number) => {
    trackEvent('click_wish', { wish_id: id, wish_name: wishMap[id] });
    if (selectedWishes.includes(id)) {
      setSelectedWishes(selectedWishes.filter(wishId => wishId !== id));
    } else if (selectedWishes.length < 2) {
      setSelectedWishes([...selectedWishes, id]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 relative overflow-y-auto">
      <div className="fixed inset-0 z-0">
        <img src={backgroundImage} alt="Background" className="w-full h-[110vh] object-cover" />
      </div>

      <div className="relative max-w-md mx-auto px-4 py-2 z-10 my-[-10px]">
        <div className="fixed top-0 left-0 z-20 p-4">
          <img src={logoImage} alt="Ensure Gold" className="w-32 h-auto -ml-4 -mt-4" />
        </div>

        <button onClick={onBack} className="fixed top-20 left-4 z-20 bg-white/80 hover:bg-white p-3 rounded-full shadow-lg transition-all mx-[0px] my-[-15px]">
          <ArrowLeft className="w-6 h-6" style={{ color: '#AF721E' }} />
        </button>

        <div className="text-center mb-8 pt-20">
          <img src={headerImage} alt="Chọn 2 ước nguyện" className="w-full max-w-md mx-auto" />
        </div>

        <motion.div className="mt-8 text-center px-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="flex flex-col items-center gap-0.5 scale-[1.17]">
            <div className="flex gap-0.5 justify-center">
              {[1, 2, 3].map(id => (
                <motion.div key={id} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="cursor-pointer relative rounded-lg" onClick={() => handleWishClick(id)}>
                  <img src={wishes[id - 1].image} alt={wishes[id - 1].alt} className={`w-24 h-24 object-contain transition-opacity ${selectedWishes.includes(id) ? 'opacity-100' : 'opacity-40'}`} />
                </motion.div>
              ))}
            </div>
            <div className="flex gap-0.5 justify-center">
              {[4, 5].map(id => (
                <motion.div key={id} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="cursor-pointer relative rounded-lg" onClick={() => handleWishClick(id)}>
                  <img src={wishes[id - 1].image} alt={wishes[id - 1].alt} className={`w-24 h-24 object-contain mx-[0px] my-[-45px] transition-opacity ${selectedWishes.includes(id) ? 'opacity-100' : 'opacity-40'}`} />
                </motion.div>
              ))}
            </div>
            <div className="flex justify-center">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="cursor-pointer relative rounded-lg" onClick={() => handleWishClick(6)}>
                <img src={wish6Image} alt="Phúc Lộc" className={`w-24 h-24 object-contain transition-opacity ${selectedWishes.includes(6) ? 'opacity-100' : 'opacity-40'}`} />
              </motion.div>
            </div>
          </div>
        </motion.div>

        {errorMessage && (
          <div className="fixed top-20 left-4 right-4 z-50 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p className="text-center font-bold">{errorMessage}</p>
          </div>
        )}

        {selectedWishes.length >= 2 && (
          <motion.div className="mt-[42px] mb-[32px] flex flex-col items-center" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
             
             {/* ĐÃ XÓA: Phần Text hướng dẫn phía trên thiệp */}

            {/* KHUNG THIỆP CHÍNH */}
            <div className="relative w-full max-w-[320px] shadow-2xl rounded-xl overflow-hidden mt-2">
                {/* 1. Ảnh nền thiệp */}
                <img src={previewCardImage} alt="Base" className="w-full h-auto object-contain" />
                
                {/* 2. Nội dung Text nằm đè lên ảnh (Absolute) */}
                <div className="absolute inset-0 flex flex-col items-center justify-between py-6 px-8">
                    
                    {/* ĐÃ XÓA: Phần Header text màu xanh */}

                    {/* Phần giữa: Nội dung lời chúc dynamic */}
                    <div className="flex-1 flex items-center justify-center w-full mt-[10px]">
                        <p className={`text-[#AF721E] font-bold text-center italic leading-relaxed drop-shadow-sm ${
                            (getGreetingTextWithStructure()?.length || 0) > 100 ? 'text-[11px]' : 'text-[13px]'
                        }`}>
                            "{getGreetingTextWithStructure()}"
                        </p>
                    </div>

                    {/* ĐÃ XÓA: Phần số thứ tự mẫu */}
                </div>
            </div>

            <motion.div className="mt-6 flex gap-3 justify-center px-4 w-full max-w-sm" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <motion.button 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }} 
                onClick={() => {
                  trackEvent('select_voice', { voice: 'male' });
                  setSelectedVoice('male');
                }} 
                className="flex-1"
              >
                <img src={selectedVoice === 'male' ? maleVoiceSelectedImage : maleVoiceImage} alt="Nam" className="w-full h-auto" />
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }} 
                onClick={() => {
                  trackEvent('select_voice', { voice: 'female' });
                  setSelectedVoice('female');
                }} 
                className="flex-1"
              >
                <img src={selectedVoice === 'female' ? femaleVoiceSelectedImage : femaleVoiceImage} alt="Nữ" className="w-full h-auto" />
              </motion.button>
            </motion.div>

            <div className="mt-[24px] flex gap-4 justify-center">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setSelectedWishes([])}>
                <img src={recreateButtonImage} alt="Recreate" className="h-12 w-auto" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={async () => {
                  if (!selectedVoice) { alert('Vui lòng chọn giọng đọc'); return; }
                  const finalName = recipientName.trim() || 'Ba Mẹ';
                  setShowPopup(true);
                  setErrorMessage(null);
                  try {
                    const formData = new FormData();
                    if (uploadedImage) {
                      const res = await fetch(uploadedImage);
                      const blob = await res.blob();
                      formData.append('image', blob, 'user_input.jpg');
                    }
                    formData.append('recipient_name', finalName);
                    // Revert to 'NAM'/'NU' as per user feedback suggesting potential issues with voice generation
                    formData.append('gender', selectedVoice === 'male' ? 'NAM' : 'NU');
                    formData.append('region', 'MienNam');
                    let wishSlugs = selectedWishes.map(id => wishMap[id]).join('');
                    formData.append('wish_slug', wishSlugs || 'ankhangthinhvuong');
                    formData.append('structure_index', currentStructureIndex.toString());

                    if (trackingData) {
                      formData.append('tracking_data', JSON.stringify(trackingData));
                      Object.keys(trackingData).forEach(key => {
                        if (trackingData[key]) {
                            formData.append(`tracking_${key}`, trackingData[key]);
                            if (key === 'zalo_user') {
                                formData.append('zalo_user', trackingData[key]);
                            }
                        }
                      });
                    }

                    const currentJobId = localStorage.getItem('currentJobId');
                    if (currentJobId) {
                      formData.append('job_id', currentJobId);
                    }

                    const response = await fetch('https://linhx.info/api/ensureMiniApp/submit_tracking.php?action=submit', { method: 'POST', body: formData });
                    const result = await response.json();

                    if (result.success && result.job_id) {
                      const jobId = result.job_id;
                      console.log(`[Polling] Started for Job ID: ${jobId}`);
                      const poll = setInterval(async () => {
                        try {
                          const statusRes = await fetch(`https://linhx.info/api/ensureMiniApp/status.php?job_id=${jobId}&t=${Date.now()}`);
                          const statusData = await statusRes.json();
                          console.log(`[Polling] Status for ${jobId}:`, statusData);
                          if (statusData.success) {
                            setVideoProgress(statusData.progress || 0);
                            if (statusData.status === 'completed' && statusData.video_url) {
                              console.log(`[Polling] Completed! URL: ${statusData.video_url}`);
                              clearInterval(poll);
                              setVideoProgress(100);
                              try {
                                const resp = await fetch(statusData.video_url);
                                const blob = await resp.blob();
                                const dUrl = window.URL.createObjectURL(blob);
                                const link = document.createElement('a');
                                link.href = dUrl;
                                link.download = 'ChucTetKhoiSac_Video.mp4';
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                                window.URL.revokeObjectURL(dUrl);
                              } catch (dlErr) {
                                const link = document.createElement('a');
                                link.href = statusData.video_url;
                                link.download = 'ChucTetKhoiSac_Video.mp4';
                                link.target = '_blank';
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                              }
                              setTimeout(() => onNext(statusData.video_url), 1500);
                            } else if (statusData.status === 'failed') {
                              clearInterval(poll);
                              setShowPopup(false);
                              if (statusData.error_code === 'BRAND_SAFETY_VIOLATION' || statusData.error_code === 'CONTENT_VIOLATION') {
                                setShowBrandSafetyModal(true);
                              } else {
                                setErrorMessage('Xử lý video thất bại.');
                                setTimeout(() => {
                                    if (onReset) onReset();
                                    else onBack();
                                }, 2000);
                              }
                            }
                          }
                        } catch (e) { console.error('[Polling] Error:', e); }
                      }, 2000);
                    } else { setShowPopup(false); setErrorMessage('Không thể gửi yêu cầu.'); }
                  } catch (e) { setShowPopup(false); setErrorMessage('Lỗi kết nối server.'); }
                }}
              >
                <img src={completeButtonImage} alt="Complete" className="h-12 w-auto" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>

      {showPopup && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowPopup(false)} />
          <motion.div className="relative rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden" initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
            <img src={popupBackgroundImage} alt="BG" className="absolute inset-0 w-full h-full object-cover" />
            <div className="relative p-8">
              <div className="text-center mb-6"><img src={popupTitleImage} className="w-full max-w-xs mx-auto scale-[0.8]" /></div>
              <div className="text-center mb-6"><img src={popupSubtitleImage} className="w-full max-w-xs mx-auto scale-90 mt-[-20px]" /></div>
              <div className="mb-6 relative">
              <video 
                ref={promoVideoRef}
                src="https://linhx.info/api/ensureMiniApp/processingVideo.mp4" 
                className="w-full h-auto rounded-lg shadow-lg" 
                autoPlay 
                loop 
                playsInline 
                muted={isMuted}
                webkit-playsinline="true"
                onCanPlay={(e) => { 
                  e.currentTarget.play().catch(() => {
                    console.log("Autoplay with sound blocked for promo, trying muted...");
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
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold" style={{ color: '#AF721E' }}>Đang tạo video...</span>
                    <span className="text-sm font-bold" style={{ color: '#AF721E' }}>{videoProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
                    <motion.div className="h-full rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-500" initial={{ width: 0 }} animate={{ width: `${videoProgress}%` }} transition={{ duration: 0.3 }} />
                  </div>
                </div>
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
