import forestBg from "@/assets/forest_1920.jpg";
import logo from "@/assets/logo.png";
import gemini2 from "@/assets/Gemini_Generated_Image_2.png";
import gemini3 from "@/assets/Gemini_Generated_Image_3.png";
import gemini4 from "@/assets/Gemini_Generated_Image_4.jpg";
import gemini5 from "@/assets/Sprout_Image_1920.png";
import howToUse1 from "@/assets/how_to_use_1.png";
import howToUse2 from "@/assets/how_to_use_2.png";
import howToUse3 from "@/assets/how_to_use_3.png";
import howToUse4 from "@/assets/how_to_use_4.png";

// 이미지 카드 데이터
const featureCards = [
  {
    image: gemini2,
    title: "01 우리동네 단골 손님 되기",
    description:
      "우리 동네 인기 가게의 신선식품을 간편하게 온라인으로 주문하세요.",
  },
  {
    image: gemini3,
    title: "02 다회용기 포장 배송",
    description: "한번 쓰고 버려지는 비닐, 플라스틱 포장재 사용을 줄여보세요.",
  },
  {
    image: gemini4,
    title: "03 식품은 배송, 쓰레기는 수거",
    description: "음식물, 재활용쓰레기 분리배출은 지환수에 맡겨주세요!",
  },
  {
    image: gemini5,
    title: "04 오염을 최소화하는 재순환",
    description:
      "수거한 음식물 양만큼, 자연 순환 과정을 따라 작물로 재탄생해요.",
  },
];

export default function HomePage() {
  return (
    <div className="px-4 py-6 md:px-8 md:py-10">
      {/* 슬로건 구역 - 배경 이미지 + 반투명 오버레이 */}
      <section
        className="mb-8 rounded-2xl py-10 px-6 text-center relative overflow-hidden"
        style={{
          backgroundImage: `url(${forestBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* 검은색 반투명 오버레이 */}
        <div className="absolute inset-0 bg-black/60 rounded-2xl"></div>

        {/* 텍스트 콘텐츠 (오버레이 위) */}
        <div className="relative z-10">
          <h1 className="text-white text-2xl md:text-4xl font-bold mb-4">
            다회용기 포장 신선식품 당일배송
          </h1>
          <p className="text-white/90 text-lg md:text-2xl mb-2">
            가정의 모든 쓰레기가 재순환하는 그날까지
          </p>
          <p className="text-white text-xl md:text-3xl font-semibold mb-6">
            함께해요!
          </p>
          {/* 브랜드 로고 */}
          <img src={logo} alt="지환수 로고" className="mx-auto w-40 md:w-56" />
        </div>
      </section>

      <section className="mb-8">
        {/* 4개 이미지: 모바일 세로 1열 / PC 가로 4열 */}
        <div className="grid grid-cols-1 md:grid-cols-4 md:gap-3 w-full mb-6">
          {featureCards.map((card, index) => (
            <div key={index} className="relative overflow-hidden md:rounded-lg">
              {/* 이미지: 모바일에서 가로로 긴 직사각형 (aspect-[2/1]), PC에서 원본 비율 */}
              <img
                src={card.image}
                alt={card.title}
                className="w-full h-32 md:h-auto object-cover"
              />
              {/* 텍스트 오버레이 (이미지 상단에 겹침) */}
              <div className="absolute top-0 left-0 right-0 p-3 md:p-2 bg-gradient-to-b from-black/70 to-transparent">
                <p className="text-white font-bold text-base md:text-base">
                  {card.title}
                </p>
                <p className="text-white/90 text-sm md:text-sm">
                  {card.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="bg-gray-100">
        <div className="flex flex-col items-center">
          <img
            src={howToUse1}
            alt="이용방법 1"
            className="max-w-[810px] w-full"
          />
          <img
            src={howToUse2}
            alt="이용방법 2"
            className="max-w-[810px] w-full"
          />
          <img
            src={howToUse3}
            alt="이용방법 3"
            className="max-w-[810px] w-full"
          />
          <img
            src={howToUse4}
            alt="이용방법 4"
            className="max-w-[810px] w-full"
          />
        </div>
      </section>
    </div>
  );
}
