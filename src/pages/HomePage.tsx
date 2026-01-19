export default function HomePage() {
  return (
    <div className="px-4 py-6 md:px-8 md:py-10">
      <h1 className="text-2xl sm:text-2xl md:text-3xl font-bold mb-6">
        지환수에 오신 것을 환영합니다
      </h1>
      <section className="mb-8">
        <h2 className="text-xl sm:text-lg md:text-xl font-semibold mb-4">지환수 소개</h2>
        <p className="text-gray-600 text-base sm:text-sm md:text-base">
          깨끗하고 건강한 물을 배달해드립니다.
        </p>
      </section>
      <section>
        <h2 className="text-xl sm:text-lg md:text-xl font-semibold mb-4">이용 방법</h2>
        <ol className="list-decimal list-inside space-y-3 text-gray-600 text-base sm:text-sm md:text-base">
          <li>장보기 페이지에서 원하는 상품을 선택하세요</li>
          <li>장바구니에서 수량을 확인하고 주문하세요</li>
          <li>주문 내역에서 배송 상태를 확인하세요</li>
        </ol>
      </section>
    </div>
  );
}
