import { stripIndents } from 'common-tags';
import { IReservationStatus } from '../types';

const Message = {
  get(status: IReservationStatus, roomId: string) {
    const selfCheckInGuideUrl =
      'https://airbnb.co.kr/reservation/check-in-guide';

    const messageMap = {
      'no-message': {
        ko: [],
        en: [],
      },
      'check-in': {
        ko: [
          stripIndents`
            오늘은 체크인하는 날이에요. (입실 : 15시)
            다시 한번 셀프 체크인 가이드를 확인해주세요.

            주소: 포항시 북구 삼호로253번길 17-5 필오피스텔

            궁금한 점이 있으신가요?
            에어비앤비 메시지를 통해서 호스트와 빠르게 소통하세요~!

            전화 연락은 어려울 수 있습니다.
            그럼 즐거운 여행이 되시길 바래요~!!
            ${selfCheckInGuideUrl}/${roomId}

            ** 만약 폰에서 링크가 열리지 않는다면 링크를 크롬/삼성 인터넷 주소창에 붙여넣기 해보세요 **
            `,
        ],
        en: [
          stripIndents`
            It's check in day today!
            Please check in after 3:00 PM.

            Address: 17-5, Samho-ro 253beon-gil, Buk-gu, Pohang-si

            Do you have questions?
            Please leave an Airbnb message.

            Then have a nice trip :)
            ${selfCheckInGuideUrl}/${roomId}
            `,
        ],
      },
      'check-out': {
        ko: [
          stripIndents`
            여행은 즐거우셨나요? ^^
            체크아웃은 11시까지에요.

            퇴실전에 기본적인 뒷정리 부탁드리고, 
            놓고 가는 물건이 없는 지 한번 더 체크해보세요~
        
            그리고 높은 평점, 좋은 후기를 적어주시면 
            감사의 뜻으로 ₩10,000을 돌려드리는 이벤트를 진행하고 있어요~ ^^
      
            체크아웃 몇 시간 뒤에 [후기 작성] 알림이 오면 
            후기 작성하시고 메세지 남겨주세요~
            `,
        ],
        en: [
          stripIndents`
            Did you enjoy the trip?
            You should check out until 11:00 AM.

            Before you leave, please clean up and 
            make sure you take all your belongings with you.

            And if your leave good review, we'll pay you ₩10,000 back :)
            Leave a review and send us Airbnb message.
            Thank you. Have a nice day :)
            `,
        ],
      },
      'reservation-confirmed': {
        ko: [
          stripIndents`
            포항시 북구 삼호로253번길 17-5 필오피스텔
            `,
          stripIndents`
            안녕하세요 게스트님 ^^
    
            * 숙소 기본 정보 *
            숙소 주소는 위 메세지 참조
            숙소의 기본적인 정보가 궁금하신가요?
            (https://airbnb.co.kr/rooms/${roomId})
            - 건물 1층 무료 주차장 이용 가능
            - 여분 침구류 제공
            - 체크인 시간 2시간 전부터 짐 두고 가셔도 됩니다 ^^

            * 체크인 / 체크아웃 *
            체크인: 오후 3시부터
            체크아웃: 오전 11시까지
            (숙소 정리를 위해 체크아웃 시간을 지켜주세요^^)

            약도 / 체크인 / 비밀번호 / 숙소 이용 / 맛집 안내는 
            아래 링크를 통해 체크인 3일 전부터 확인 가능합니다.
            ${selfCheckInGuideUrl}/${roomId}

            ** 만약 폰에서 링크가 열리지 않는다면 링크를 크롬/삼성 인터넷 주소창에 붙여넣기 해보세요 **
            `,
        ],
        en: [
          stripIndents`
            17-5, Samho-ro 253beon-gil, Buk-gu, Pohang-si
            `,
          stripIndents`
            Hi!

            We look forward to meeting you.
            * Check-in: After 3:00 PM
            * Check-out: Before 11:00 AM
            (Don't be late for check out time. 
            Please be aware that it takes some time to clean up the room after you check out)

            * You can check information such as
            - map to house
            - how to check in
            - door lock code
            - famous places nearby
            in self check in guide.
            (Self check in guide link will be open 3days before check in)
            ${selfCheckInGuideUrl}/${roomId}
            `,
        ],
      },
    };

    return messageMap[status];
  },
};

export default Message;
