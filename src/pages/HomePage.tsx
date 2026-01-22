import { useState } from "react";
import logo from "@/assets/logo.png";
import gemini1 from "@/assets/Gemini_Generated_Image_1.png";
import gemini2 from "@/assets/Gemini_Generated_Image_2.png";
import gemini3 from "@/assets/Gemini_Generated_Image_3.png";
import gemini4 from "@/assets/Gemini_Generated_Image_4.png";
import gemini5 from "@/assets/Gemini_Generated_Image_5.jpg";
import gemini6 from "@/assets/Gemini_Generated_Image_6.png";
import howToUse1 from "@/assets/how_to_use_1.png";

const meritImages = [gemini2, gemini3, gemini4, gemini5, gemini6];

export default function HomePage() {
  const [index, setIndex] = useState(0);

  return (
    <div className="px-4 py-6 md:px-8 md:py-10">
      <h1 className="text-2xl sm:text-2xl md:text-3xl font-bold mb-6">
        어서오세요! 명령하지마라.
      </h1>
      <section className="mb-8">
        <img src={logo} alt="logo" className="w-160" />
        <img src={gemini1} alt="logo" className="w-160" />
        <p className="text-gray-600 text-base sm:text-sm md:text-base">
          깨끗하고 건강한 물을 배달해드립니다.
        </p>
      </section>
      <section>
        <h2 className="text-xl sm:text-lg md:text-xl font-semibold mb-4">
          이용 방법
        </h2>
        <div className="relative w-160">
          {/* viewport */}
          <div className="overflow-hidden">
            {/* track */}
            <div
              className="flex transition-transform duration-300 ease-out"
              style={{ transform: `translateX(-${index * 100}%)` }}
            >
              {meritImages.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  className="w-full flex-shrink-0"
                  alt=""
                />
              ))}
            </div>
          </div>

          {/* arrows */}
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/60 text-white px-3 py-2 rounded"
            onClick={() =>
              setIndex((index - 1 + meritImages.length) % meritImages.length)
            }
          >
            ‹
          </button>

          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/60 text-white px-3 py-2 rounded"
            onClick={() => setIndex((index + 1) % meritImages.length)}
          >
            ›
          </button>
        </div>
        <ol className="list-decimal list-inside space-y-3 text-gray-600 text-base sm:text-sm md:text-base">
          <li>장보기 페이지에서 원하는 상품을 선택하세요</li>
          <li>장바구니에서 수량을 확인하고 주문하세요</li>
          <li>주문 내역에서 배송 상태를 확인하세요</li>
        </ol>
        <img src={howToUse1} alt="htu1" className="w-200" />
      </section>
    </div>
  );
}
