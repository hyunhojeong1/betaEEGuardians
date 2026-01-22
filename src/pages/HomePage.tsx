import logo from "@/assets/logo.png";
import gemini2 from "@/assets/Gemini_Generated_Image_2.png";
import gemini3 from "@/assets/Gemini_Generated_Image_3.png";
import gemini4 from "@/assets/Gemini_Generated_Image_4.png";
import gemini5 from "@/assets/Gemini_Generated_Image_5.jpg";
import howToUse1 from "@/assets/how_to_use_1.png";
import howToUse2 from "@/assets/how_to_use_2.png";
import howToUse3 from "@/assets/how_to_use_3.png";

// 이미지 카드 데이터
const featureCards = [
  { image: gemini2, title: "타이틀 1", description: "상세 설명 1" },
  { image: gemini3, title: "타이틀 2", description: "상세 설명 2" },
  { image: gemini4, title: "타이틀 3", description: "상세 설명 3" },
  { image: gemini5, title: "타이틀 4", description: "상세 설명 4" },
];

export default function HomePage() {
  return (
    <div className="px-4 py-6 md:px-8 md:py-10">
      <h1 className="text-2xl sm:text-2xl md:text-3xl font-bold mb-6">
        어서오세요! 명령하지마라.
      </h1>
      <section className="mb-8">
        <img src={logo} alt="logo" className="w-160 mb-6" />

        {/* 4개 이미지 가로 배열 (텍스트 오버레이) */}
        <div className="grid grid-cols-4 gap-3 w-full mb-6">
          {featureCards.map((card, index) => (
            <div key={index} className="relative overflow-hidden rounded-lg">
              {/* 이미지 */}
              <img
                src={card.image}
                alt={card.title}
                className="w-full h-auto object-cover"
              />
              {/* 텍스트 오버레이 (이미지 상단에 겹침) */}
              <div className="absolute top-0 left-0 right-0 p-2 bg-gradient-to-b from-black/60 to-transparent">
                <p className="text-white font-bold text-sm md:text-base">
                  {card.title}
                </p>
                <p className="text-white/90 text-xs md:text-sm">
                  {card.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-gray-600 text-base sm:text-sm md:text-base">
          깨끗하고 건강한 물을 배달해드립니다.
        </p>
      </section>
      <section>
        <h2 className="text-xl sm:text-lg md:text-xl font-semibold mb-4">
          이용 방법
        </h2>
        <ol className="list-decimal list-inside space-y-3 text-gray-600 text-base sm:text-sm md:text-base">
          <li>장보기 페이지에서 원하는 상품을 선택하세요</li>
          <li>장바구니에서 수량을 확인하고 주문하세요</li>
          <li>주문 내역에서 배송 상태를 확인하세요</li>
        </ol>
        <img src={howToUse1} alt="htu1" className="w-200" />
        <img src={howToUse2} alt="htu2" className="w-200" />
        <img src={howToUse3} alt="htu2" className="w-200" />
      </section>
    </div>
  );
}
