import { useState, useRef } from "react";
import { createNewCustomerCall } from "@/services/newCustomerCall";
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
import oldHowToUse2 from "@/assets/old_how_to_use_2.png";

// 이미지 카드 데이터
const featureCards = [
  {
    image: gemini2,
    title: "01 우리동네 단골 손님 되기",
    description: "우리 동네 인기 가게들의 상품을 한번에 만나보세요.",
  },
  {
    image: gemini3,
    title: "02 다회용기 포장 배송",
    description: "한번 쓰고 버려지는 비닐, 플라스틱 포장재를 줄여보세요.",
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
  const callSectionRef = useRef<HTMLDivElement>(null);

  // 호출하기 폼 상태
  const [containerCount, setContainerCount] = useState(0);
  const [needsWashing, setNeedsWashing] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const scrollToCallSection = () => {
    callSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleCallSubmit = async () => {
    if (containerCount <= 0) {
      alert("충전할 용기 개수를 1개 이상 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await createNewCustomerCall({
        containerCount,
        needsWashing,
      });

      if (response.success) {
        alert("호출 신청이 완료되었습니다. 직원이 곧 방문할 예정입니다.");
        setContainerCount(0);
        setNeedsWashing(true);
      } else {
        alert(response.message || "호출 신청에 실패했습니다.");
      }
    } catch (error: unknown) {
      console.error("호출 신청 오류:", error);
      const firebaseError = error as { message?: string };
      alert(firebaseError.message || "호출 신청 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
          {/* how_to_use_1 with clickable overlay button */}
          <img
            src={oldHowToUse2}
            alt="이용방법 old2"
            className="max-w-[810px] w-full"
          />
          <div className="relative max-w-[1080px] w-full">
            <img src={howToUse1} alt="이용방법 1" className="w-full" />
            {/* 호출하기 버튼 오버레이 - 이미지 내 버튼 위치에 맞게 조정 필요 */}
            <button
              onClick={scrollToCallSection}
              className="absolute cursor-pointer hover:bg-white/20 transition-colors"
              style={{
                bottom: "10%",
                left: "25%",
                transform: "translateX(-50%)",
                width: "30%",
                height: "8%",
              }}
              aria-label="호출하기 섹션으로 이동"
            />
          </div>
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

      {/* 호출하기 구역 */}
      <section ref={callSectionRef} className="mt-8 px-4">
        <div className="max-w-[810px] mx-auto bg-green-50 border border-green-200 rounded-2xl p-6">
          <h2 className="text-xl md:text-2xl font-bold text-green-800 mb-4 text-center">
            최초 다회용기 충전 호출하기
          </h2>

          {/* 안내 내용 */}
          <ol className="space-y-2 text-base sm:text-sm text-green-700 mb-6">
            <li className="flex gap-2">
              <span className="font-medium">1.</span>
              <span>
                이 호출은 '최초 다회용기 충전 시'에만 사용됩니다.
                <br />
                이후로는 신청하셔도 호출되지 않습니다.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="font-medium">2.</span>
              <span>
                개인 용기를 '식품 배송용 상자'에 담아, 자물쇠를 잠그고 현관문
                앞에 내놓아주세요. <br />
                위생을 위해 용기 뚜껑을 닫아주세요.
              </span>
            </li>
          </ol>

          {/* 용기 개수 입력 & 세척 필요 여부 */}
          <div className="bg-white rounded-xl p-4 mb-6 border border-green-200">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              {/* 용기 수량 입력 */}
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-sm text-green-700 font-medium">
                  충전할 용기 개수:
                </span>
                <input
                  type="number"
                  min="0"
                  max="99"
                  value={containerCount || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "") {
                      setContainerCount(0);
                    } else {
                      const num = parseInt(val, 10);
                      if (!isNaN(num)) {
                        setContainerCount(Math.min(99, Math.max(0, num)));
                      }
                    }
                  }}
                  placeholder="0"
                  className="w-16 px-2 py-2 sm:py-1.5 text-center text-base sm:text-sm border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                />
                <span className="text-base sm:text-sm text-green-700">개</span>
              </div>

              {/* 세척 필요 여부 라디오 버튼 */}
              {containerCount > 0 && (
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="callWashingOption"
                      checked={needsWashing}
                      onChange={() => setNeedsWashing(true)}
                      className="w-5 h-5 sm:w-4 sm:h-4 text-green-600"
                    />
                    <span className="text-base sm:text-sm text-green-700">
                      세척 후 사용해주세요
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="callWashingOption"
                      checked={!needsWashing}
                      onChange={() => setNeedsWashing(false)}
                      className="w-5 h-5 sm:w-4 sm:h-4 text-green-600"
                    />
                    <span className="text-base sm:text-sm text-green-700">
                      세척이 필요 없어요
                    </span>
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* 호출하기 버튼 */}
          <button
            onClick={handleCallSubmit}
            disabled={containerCount <= 0 || isSubmitting}
            className="w-full py-4 text-lg font-semibold text-white bg-green-600 rounded-xl hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting
              ? "신청 중..."
              : containerCount > 0
                ? "호출하기"
                : "충전할 용기 개수를 입력해주세요"}
          </button>
        </div>
      </section>
    </div>
  );
}
