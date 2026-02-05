interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TermsModal({ isOpen, onClose }: TermsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 배경 오버레이 */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* 모달 컨텐츠 */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[80vh] flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold text-gray-800">이용약관</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
          >
            &times;
          </button>
        </div>

        {/* 본문 */}
        <div className="p-4 overflow-y-auto text-sm text-gray-700 space-y-4">
          <section>
            <h3 className="font-bold text-gray-800 mb-2">제1조 (목적)</h3>
            <p>
              본 약관은 지구환경수호단(이하 "회사")이 운영하는 지환수
              서비스(이하 "서비스")를 이용함에 있어 회사와 이용자의 권리, 의무
              및 책임사항을 규정함을 목적으로 합니다.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-gray-800 mb-2">제2조 (정의)</h3>
            <ol className="list-decimal list-inside space-y-1">
              <li>
                "서비스"란 회사가 제공하는 식품 배송 및 다회용기 순환 서비스를
                말합니다.
              </li>
              <li>
                "이용자"란 본 약관에 따라 회사가 제공하는 서비스를 받는 회원을
                말합니다.
              </li>
              <li>
                "다회용기"란 이용자 또는 회사가 제공하는 재사용 가능한 식품 포장
                용기를 말합니다.
              </li>
            </ol>
          </section>

          <section>
            <h3 className="font-bold text-gray-800 mb-2">
              제3조 (약관의 효력 및 변경)
            </h3>
            <ol className="list-decimal list-inside space-y-1">
              <li>
                본 약관은 서비스를 이용하고자 하는 모든 이용자에게 적용됩니다.
              </li>
              <li>
                회사는 필요한 경우 관련 법령을 위배하지 않는 범위에서 본 약관을
                변경할 수 있습니다.
              </li>
              <li>
                약관이 변경되는 경우 회사는 변경 내용을 서비스 내 공지사항을
                통해 공지합니다.
              </li>
            </ol>
          </section>

          <section>
            <h3 className="font-bold text-gray-800 mb-2">
              제4조 (서비스의 제공)
            </h3>
            <ol className="list-decimal list-inside space-y-1">
              <li>
                회사는 다음과 같은 서비스를 제공합니다:
                <ul className="list-disc list-inside ml-4 mt-1">
                  <li>신선식품 온라인 주문 및 배송 서비스</li>
                  <li>다회용기를 통한 친환경 포장 서비스</li>
                  <li>다회용기 수거 및 세척 서비스</li>
                </ul>
              </li>
              <li>서비스 이용 시간은 회사가 정한 시간에 따릅니다.</li>
            </ol>
          </section>

          <section>
            <h3 className="font-bold text-gray-800 mb-2">
              제5조 (주문 및 결제)
            </h3>
            <ol className="list-decimal list-inside space-y-1">
              <li>
                이용자는 서비스 내에서 제공되는 상품을 선택하여 주문할 수
                있습니다.
              </li>
              <li>
                주문 후 결제가 완료되면 주문이 확정되며, 회사는 확정된 주문에
                대해 배송을 진행합니다.
              </li>
              <li>
                상품의 가격은 회사의 사정에 따라 변경될 수 있으며, 변경된 가격은
                변경 이후 주문에 적용됩니다.
              </li>
            </ol>
          </section>

          <section>
            <h3 className="font-bold text-gray-800 mb-2">제6조 (배송)</h3>
            <ol className="list-decimal list-inside space-y-1">
              <li>
                배송은 이용자가 지정한 배송 희망 시간대에 맞춰 진행됩니다.
              </li>
              <li>배송 지역은 회사가 지정한 서비스 가능 지역에 한합니다.</li>
              <li>
                천재지변, 교통 상황 등 불가항력적인 사유로 인해 배송이 지연될 수
                있습니다.
              </li>
              <li>
                이용자의 부재 시 사전 협의된 장소(현관문 앞 배송 박스 등)에
                배송됩니다.
              </li>
            </ol>
          </section>

          <section>
            <h3 className="font-bold text-gray-800 mb-2">
              제7조 (다회용기 관리)
            </h3>
            <ol className="list-decimal list-inside space-y-1">
              <li>
                이용자는 회사가 제공하는 다회용기를 선량한 관리자의 주의로
                사용해야 합니다.
              </li>
              <li>
                다회용기는 다음 배송 시 수거되며, 이용자는 용기를 깨끗이 비운
                상태로 반납해야 합니다.
              </li>
              <li>
                고의 또는 중대한 과실로 인한 다회용기 파손 및 분실 시 이용자에게
                비용이 청구될 수 있습니다.
              </li>
            </ol>
          </section>

          <section>
            <h3 className="font-bold text-gray-800 mb-2">
              제8조 (청약철회 및 환불)
            </h3>
            <ol className="list-decimal list-inside space-y-1">
              <li>식품의 특성상 배송이 시작된 후에는 청약철회가 제한됩니다.</li>
              <li>
                상품 하자 또는 오배송의 경우 회사에 즉시 연락하여 교환 또는
                환불을 요청할 수 있습니다.
              </li>
              <li>
                이용자의 단순 변심에 의한 환불은 배송 시작 전까지만 가능합니다.
              </li>
            </ol>
          </section>

          <section>
            <h3 className="font-bold text-gray-800 mb-2">
              제9조 (개인정보보호)
            </h3>
            <ol className="list-decimal list-inside space-y-1">
              <li>회사는 이용자의 개인정보를 관련 법령에 따라 보호합니다.</li>
              <li>
                개인정보의 수집, 이용, 제공에 관한 사항은 별도의
                개인정보처리방침에 따릅니다.
              </li>
            </ol>
          </section>

          <section>
            <h3 className="font-bold text-gray-800 mb-2">
              제10조 (회사의 의무)
            </h3>
            <ol className="list-decimal list-inside space-y-1">
              <li>
                회사는 관련 법령과 본 약관이 금지하는 행위를 하지 않습니다.
              </li>
              <li>
                회사는 이용자가 안전하게 서비스를 이용할 수 있도록 최선을
                다합니다.
              </li>
              <li>
                회사는 식품위생법 등 관련 법령을 준수하여 위생적인 상품을
                제공합니다.
              </li>
            </ol>
          </section>

          <section>
            <h3 className="font-bold text-gray-800 mb-2">
              제11조 (이용자의 의무)
            </h3>
            <ol className="list-decimal list-inside space-y-1">
              <li>이용자는 본 약관 및 회사의 공지사항을 준수해야 합니다.</li>
              <li>이용자는 정확한 배송 정보를 제공해야 합니다.</li>
              <li>
                이용자는 다회용기를 타인에게 양도하거나 다른 용도로 사용할 수
                없습니다.
              </li>
            </ol>
          </section>

          <section>
            <h3 className="font-bold text-gray-800 mb-2">제12조 (면책조항)</h3>
            <ol className="list-decimal list-inside space-y-1">
              <li>
                회사는 천재지변, 전쟁, 기간통신사업자의 서비스 중단 등
                불가항력적인 사유로 인한 서비스 중단에 대해 책임지지 않습니다.
              </li>
              <li>
                회사는 이용자의 귀책사유로 인한 서비스 이용 장애에 대해 책임지지
                않습니다.
              </li>
            </ol>
          </section>

          <section>
            <h3 className="font-bold text-gray-800 mb-2">제13조 (분쟁해결)</h3>
            <ol className="list-decimal list-inside space-y-1">
              <li>
                회사와 이용자 간에 발생한 분쟁은 상호 협의하여 해결합니다.
              </li>
              <li>
                협의가 이루어지지 않을 경우 관할 법원에 소송을 제기할 수
                있습니다.
              </li>
            </ol>
          </section>

          <section>
            <h3 className="font-bold text-gray-800 mb-2">부칙</h3>
            <p>본 약관은 2026년 1월 1일부터 시행됩니다.</p>
          </section>
        </div>

        {/* 푸터 */}
        <div className="p-4 border-t">
          <button
            onClick={onClose}
            className="w-full py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
