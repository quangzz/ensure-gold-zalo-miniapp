import React from 'react';
import tcData from '../tc.json';
import { X } from 'lucide-react';

interface TCPageProps {
  onClose: () => void;
}

// Hàm helper để render nội dung hỗn hợp (String hoặc Array hoặc Object con)
const renderMixedContent = (content: any) => {
  if (!content) return null;

  if (typeof content === 'string') {
    return <p className="text-justify mb-1">{content}</p>;
  }

  if (Array.isArray(content)) {
    return (
      <ul className="list-none pl-0 space-y-2">
        {content.map((item, index) => (
          <li key={index}>
            {typeof item === 'string' ? (
              <p className="text-justify">- {item}</p>
            ) : (
              // Xử lý trường hợp item là object (ví dụ: mục Lưu ý hoặc nested list)
              <div className="ml-2">
                 {item.tieu_de && <span className="font-semibold">{item.tieu_de} </span>}
                 {item.doan_van && <p>{item.doan_van}</p>}
                 {item.noi_dung && renderMixedContent(item.noi_dung)}
                 {item.chi_tiet && (
                   <ul className="list-disc pl-5 mt-1">
                     {item.chi_tiet.map((ct: string, i: number) => (
                       <li key={i}>{ct}</li>
                     ))}
                   </ul>
                 )}
                 {item.danh_sach && (
                    <ul className="list-none pl-2 mt-1">
                      {item.danh_sach.map((ds: string, k: number) => <li key={k}>{ds}</li>)}
                    </ul>
                 )}
                 {item.luu_y_lien_lac && <p className="italic mt-1 text-red-600">{item.luu_y_lien_lac}</p>}
              </div>
            )}
          </li>
        ))}
      </ul>
    );
  }
  
  // Trường hợp content là Object (ví dụ mục 6.1, 6.2)
  if (typeof content === 'object') {
     return (
         <div className="pl-2">
             {Object.entries(content).map(([k, v]: [string, any]) => {
                 // Bỏ qua các key không phải là mục con (như tieu_de nếu đã render ở ngoài)
                 if(k === 'tieu_de' || k === 'mo_ta') return null;
                 return (
                     <div key={k} className="mb-2">
                         {v.tieu_de && <p className="font-semibold underline">{v.tieu_de}</p>}
                         {renderMixedContent(v.noi_dung)}
                     </div>
                 )
             })}
         </div>
     )
  }

  return null;
};

const TCPage: React.FC<TCPageProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl h-[85vh] rounded-3xl overflow-hidden flex flex-col relative text-left shadow-2xl">
        
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b bg-gray-50">
          <h3 className="font-bold text-xl text-[#0F61B0]">Thể lệ và điều khoản</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 w-full overflow-y-auto p-6 text-sm text-gray-800 leading-relaxed scrollbar-thin scrollbar-thumb-gray-300">
          <div className="space-y-6">
            
            {/* Tiêu đề chính */}
            <h4
              className="font-bold text-center text-xl text-[#0F61B0] mb-6 uppercase"
              dangerouslySetInnerHTML={{ __html: tcData.tieu_de_van_ban.join('<br/>') }}
            />

            {/* Loop render các mục I, II, III... */}
            {Object.entries(tcData.noi_dung_chuong_trinh).map(([key, value]: [string, any]) => (
              <section key={key} className="mb-6">
                <h5 className="font-bold border-b-2 border-[#0F61B0]/20 pb-1 mb-3 text-[#0F61B0] uppercase text-base">
                    {key}. {value.tieu_de}
                </h5>

                {/* Render các trường thông thường */}
                {value.noi_dung && !value.muc_1 && renderMixedContent(value.noi_dung)}
                {value.mo_ta && <p className="mb-2">{value.mo_ta}</p>}
                
                {value.chi_tiet && Array.isArray(value.chi_tiet) && (
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    {value.chi_tiet.map((item: string, index: number) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                )}

                {value.cac_dot && (
                  <div className="bg-blue-50 p-3 rounded-lg mt-2">
                    <ul className="list-none pl-0 space-y-1 font-medium text-[#0F61B0]">
                      {value.cac_dot.map((item: string, index: number) => (
                        <li key={index}>+ {item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {value.cac_buoc && (
                     <div className="pl-2 mt-2">
                         {renderMixedContent(value.cac_buoc)}
                     </div>
                )}

                {/* XỬ LÝ CÁC MỤC CON (muc_1 -> muc_10) */}
                {Object.keys(value).filter(k => k.startsWith('muc_')).map((mucKey) => {
                    const mucData = value[mucKey];
                    return (
                        <div key={mucKey} className="mt-4 mb-2">
                            {mucData.tieu_de && <p className="font-bold text-gray-900 mb-2">{mucData.tieu_de}</p>}
                            
                            {/* Gọi hàm render đệ quy để xử lý mọi cấu trúc bên trong */}
                            {mucData.noi_dung && renderMixedContent(mucData.noi_dung)}
                            
                            {/* Xử lý riêng cho mục 6 có cấu trúc 6.1, 6.2 nằm trực tiếp trong muc_6 */}
                            {key === 'VI' || key === 'VII' ? (
                                <div>
                                     {Object.entries(mucData).map(([subKey, subVal]: [string, any]) => {
                                         // Kiểm tra xem key có phải dạng "6.1", "6.2" không
                                         if (/^\d+\.\d+$/.test(subKey)) {
                                             return (
                                                 <div key={subKey} className="ml-3 mt-2">
                                                     <p className="font-semibold underline italic">{subVal.tieu_de}</p>
                                                     {renderMixedContent(subVal.noi_dung)}
                                                 </div>
                                             )
                                         }
                                         return null;
                                     })}
                                </div>
                            ) : null}
                        </div>
                    )
                })}

                {value.chi_tiet_giai && (
                  <div className="grid gap-4 mt-3">
                    {value.chi_tiet_giai.map((giai: any, index: number) => (
                      <div className="border border-gray-200 p-3 rounded-lg bg-gray-50" key={index}>
                        <p className="font-bold text-[#0F61B0]">{giai.ten_giai}</p>
                        <ul className="list-none pl-0 mt-1 text-gray-600 text-xs space-y-1">
                          {giai.chi_tiet.map((ct: string, i: number) => (
                            <li key={i}>• {ct}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}

                {value.luu_y && (
                    <div className="mt-3 bg-yellow-50 p-3 rounded text-sm border-l-4 border-yellow-400">
                        {renderMixedContent(value.luu_y)}
                    </div>
                )}
              </section>
            ))}

            {/* Fallback for Section VIII if missing in JSON */}
            {!(tcData.noi_dung_chuong_trinh as any)['VIII'] && (
                <section className="mb-6">
                    <h5 className="font-bold border-b-2 border-[#0F61B0]/20 pb-1 mb-3 text-[#0F61B0] uppercase text-base">
                        VIII. THÔNG TIN SẢN PHẨM
                    </h5>
                    <ul className="list-disc pl-5 mt-1 space-y-1">
                        <li>Ensure Gold là công thức dinh dưỡng đầy đủ và cân đối. Với hơn 30 nghiên cứu khoa học trong suốt 50 năm có mặt trên thị trường, Ensure được chứng minh lâm sàng giúp phục hồi và tăng cường sức khỏe, tăng cường miễn dịch và chất lượng cuộc sống. Ensure Gold với Hệ dưỡng chất StrengthPro gồm HMB, YBG và nhiều dưỡng chất khác.</li>
                        <li>Sản phẩm này không phải là thuốc, không có tác dụng thay thế thuốc chữa bệnh</li>
                    </ul>
                </section>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 flex justify-center border-t">
          <button
            onClick={onClose}
            className="bg-[#0F61B0] hover:bg-[#0a4d8c] text-white px-10 py-2.5 rounded-full font-bold shadow-lg active:scale-95 transition-all"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default TCPage;