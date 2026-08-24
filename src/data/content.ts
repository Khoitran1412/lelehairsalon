// Central source of truth for LeLe Hair Design. Replace the image paths below
// with official LeLe photography as it becomes available.

export type ServiceCategory =
  | 'Cắt'
  | 'Uốn'
  | 'Nhuộm'
  | 'Duỗi'
  | 'Phục hồi'
  | 'Gội & Tạo kiểu';

export interface Service {
  id: string;
  name: string;
  description: string;
  categories: ServiceCategory[];
  image: string;
  imageAlt: string;
}

export interface CustomerGalleryItem {
  id: string;
  image: string;
  title: Record<'en' | 'vi', string>;
  alt: Record<'en' | 'vi', string>;
}

export interface PortfolioItem {
  id: string;
  title: string;
  categories: string[];
  image: string;
  imageAlt: string;
}

export interface JournalArticle {
  id: string;
  title: string;
  summary: string;
  category: string;
  image: string;
  imageAlt: string;
}

export interface CustomerReview {
  id: string;
  name: string;
  rating: number;
  text: string;
  location?: string;
  date?: string;
  source?: string;
}

export interface ReviewSummary {
  averageRating?: number;
  reviewCount?: number;
}

const googleMapsPlaceId = 'ChIJDVC1YhKrNTERSJ7cZX_s4C4';

const contact = {
  address: {
    en: 'House No. 9/22 Luong Ngoc Quyen Street, Hoan Kiem, Hanoi',
    vi: 'Nhà số 9/22 Lương Ngọc Quyến, Hoàn Kiếm, Hà Nội',
  },
  structuredAddress: {
    streetAddress: '9/22 Lương Ngọc Quyến, Hoàn Kiếm',
    addressLocality: 'Hà Nội',
    addressRegion: 'Hà Nội',
    addressCountry: 'VN',
  },
  phone: '0888 565 798',
  phoneHref: 'tel:+84888565798',
  hours: '09:30 – 20:00',
  instagramUrl: 'https://www.instagram.com/vanhlele94/',
  facebookUrl: 'https://www.facebook.com/Vanhlele94',
  googleMapsPlaceId,
  googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=LeLe%20Hair%20Design&query_place_id=${googleMapsPlaceId}`,
};

const siteContent = {
  brand: {
    name: 'LeLe Hair Design',
    logoText: 'LeLe',
    heroHeadline: 'Mái tóc của bạn.\nPhiên bản đẹp nhất của chính bạn.',
    heroDescription: 'Thiết kế tóc cá nhân hóa tại trung tâm Hà Nội.',
    aboutHeading: 'Vẻ đẹp không cần một khuôn mẫu',
    aboutParagraphs: [
      'LeLe tin rằng một mái tóc đẹp không được tạo ra từ khuôn mẫu, mà từ việc thấu hiểu gương mặt, chất tóc và phong cách sống của bạn.',
      'Từ đường cắt, độ chuyển layer, lọn uốn đến màu sắc, mỗi thiết kế được cá nhân hóa để bạn cảm thấy tự tin và vẫn là chính mình.',
    ],
  },
  contact,
  navigation: [
    { label: 'TRANG CHỦ', href: '#home' },
    { label: 'DỊCH VỤ', href: '#services' },
    { label: 'BẢNG GIÁ', href: '#pricing' },
    { label: 'VỀ LELE', href: '#about' },
    { label: 'PORTFOLIO', href: '/portfolio' },
    { label: 'KHÔNG GIAN', href: '/khong-gian' },
    { label: 'ĐÁNH GIÁ', href: '/danh-gia' },
    { label: 'JOURNAL', href: '/journal' },
    { label: 'LIÊN HỆ', href: '#contact' },
  ],
  reviews: {
    summary: {} as ReviewSummary,
    verifiedReviews: [] as CustomerReview[],
  },
  serviceFilters: [
    { id: 'all', label: 'Tất cả' },
    { id: 'Cắt', label: 'Cắt' },
    { id: 'Uốn', label: 'Uốn' },
    { id: 'Nhuộm', label: 'Nhuộm' },
    { id: 'Phục hồi', label: 'Phục hồi' },
  ] as const,
  services: [
    {
      id: 'long-layer',
      name: 'LONG LAYER',
      description:
        'Thiết kế layer dài giúp mái tóc có độ chuyển động tự nhiên, mềm mại và có chiều sâu trong khi vẫn dễ chăm sóc hàng ngày.',
      categories: ['Cắt'],
      image: '/images/services-new/01-long-layer.png',
      imageAlt: 'Kiểu tóc Long Layer tại LeLe Hair Design',
    },
    {
      id: 'layer-design',
      name: 'LAYER DESIGN',
      description:
        'Không đơn thuần là cắt tầng. Đường layer được thiết kế theo gương mặt, chiều dài, chất tóc và phong cách riêng của từng khách hàng.',
      categories: ['Cắt'],
      image: '/images/services-new/02-layer-design.png',
      imageAlt: 'Mẫu tóc Layer Design tại LeLe Hair Design',
    },
    {
      id: 'bob-layer',
      name: 'BOB / BOB LAYER',
      description:
        'Kiểu tóc gọn gàng, hiện đại nhưng vẫn giữ sự mềm mại. Có thể kết hợp cùng C-Curl để tạo độ ôm và chuyển động tự nhiên.',
      categories: ['Cắt'],
      image: '/images/services-new/03-bob-layer.png',
      imageAlt: 'Mẫu tóc Bob Layer tại LeLe Hair Design',
    },
    {
      id: 'uon-layer',
      name: 'UỐN LAYER',
      description:
        'Tạo độ cong và chuyển động cho từng lớp tóc, giúp form layer rõ nét nhưng vẫn mềm mại và tự nhiên.',
      categories: ['Uốn'],
      image: '/images/services-new/11-wash-styling.png',
      imageAlt: 'Tóc Layer được tạo kiểu tại LeLe Hair Design',
    },
    {
      id: 'uon-song-loi',
      name: 'UỐN SÓNG LƠI',
      description:
        'Những lọn sóng nhẹ với chuyển động tự nhiên, phù hợp phong cách hiện đại và nữ tính.',
      categories: ['Uốn'],
      image: '/images/services-new/07-soft-perm-waves.png',
      imageAlt: 'Mẫu tóc Uốn Sóng Lơi tại LeLe Hair Design',
    },
    {
      id: 'c-curl',
      name: 'C-CURL',
      description:
        'Tạo độ cong chữ C mềm mại ở thân và đuôi tóc, giúp mái tóc vào form tự nhiên và dễ chăm sóc.',
      categories: ['Uốn'],
      image: '/images/services-new/08-c-curl.png',
      imageAlt: 'Mẫu tóc uốn C-Curl tại LeLe Hair Design',
    },
    {
      id: 'wolfcut-perm',
      name: 'WOLFCUT PERM',
      description:
        'Kết hợp cấu trúc Wolfcut cùng chuyển động uốn để tạo một tổng thể cá tính, phóng khoáng và có chiều sâu.',
      categories: ['Uốn'],
      image: '/images/services-new/lele-wolfcut-perm.png',
      imageAlt: 'Mẫu tóc Wolfcut uốn tại LeLe Hair Design',
    },
    {
      id: 'uon-phuc-hoi',
      name: 'UỐN PHỤC HỒI',
      description:
        'Kết hợp tạo kiểu và quy trình chăm sóc nhằm hạn chế tác động lên mái tóc, đặc biệt phù hợp với tóc cần được chăm sóc sau hóa chất.',
      categories: ['Uốn', 'Phục hồi'],
      image: '/images/services-new/10-hair-recovery.png',
      imageAlt: 'Mái tóc suôn mượt sau quy trình uốn phục hồi tại LeLe Hair Design',
    },
    {
      id: 'color-design',
      name: 'COLOR DESIGN',
      description:
        'Màu tóc được tư vấn dựa trên màu da, form tóc, phong cách và hình ảnh mà khách hàng muốn hướng tới.',
      categories: ['Nhuộm'],
      image: '/images/services-new/06-color-design.png',
      imageAlt: 'Mẫu tóc nhuộm Color Design tại LeLe Hair Design',
    },
    {
      id: 'balayage',
      name: 'BALAYAGE',
      description: 'Kỹ thuật tạo hiệu ứng chuyển màu có chiều sâu, mềm mại và tự nhiên.',
      categories: ['Nhuộm'],
      image: '/images/services-new/05-balayage.png',
      imageAlt: 'Mẫu tóc Balayage chuyển màu tự nhiên tại LeLe Hair Design',
    },
    {
      id: 'color-haircut',
      name: 'COLOR + HAIRCUT',
      description: 'Thiết kế màu tóc và đường cắt đồng bộ để tạo nên một tổng thể hoàn chỉnh.',
      categories: ['Nhuộm', 'Cắt'],
      image: '/images/services-new/04-short-bob.png',
      imageAlt: 'Tóc bob ngắn với thiết kế màu tại LeLe Hair Design',
    },
    {
      id: 'hair-recovery',
      name: 'HAIR RECOVERY',
      description:
        'Chăm sóc mái tóc sau uốn, nhuộm và các dịch vụ hóa chất, hướng tới cảm giác mềm mại, khỏe và dễ chăm sóc hơn.',
      categories: ['Phục hồi'],
      image: '/images/services-new/09-straightening.png',
      imageAlt: 'Mái tóc mềm mượt sau phục hồi tại LeLe Hair Design',
    },
  ] satisfies Service[],
  mainServiceCategories: [
    {
      number: '01',
      title: 'CẮT & THIẾT KẾ FORM',
      description: 'Tạo cấu trúc tóc cân đối với gương mặt, chất tóc và nhịp sống của bạn.',
      image: '/images/services/01-long-layer.png',
      imageAlt: 'Thiết kế form tóc Long Layer tại LeLe Hair Design',
    },
    {
      number: '02',
      title: 'UỐN',
      description: 'Tạo chuyển động tự nhiên, giữ form hài hòa và dễ chăm sóc mỗi ngày.',
      image: '/images/services/06-uon-song-loi.png',
      imageAlt: 'Mẫu tóc uốn sóng lơi tại LeLe Hair Design',
    },
    {
      number: '03',
      title: 'NHUỘM',
      description: 'Tư vấn sắc độ phù hợp với tone da, form tóc và phong cách cá nhân.',
      image: '/images/services/04-color-design.png',
      imageAlt: 'Mẫu tóc nhuộm Color Design tại LeLe Hair Design',
    },
    {
      number: '04',
      title: 'BALAYAGE & HIGHLIGHT',
      description: 'Hiệu ứng chuyển màu có chiều sâu, sáng vừa đủ và giàu chuyển động.',
      image: '/images/services/05-balayage.png',
      imageAlt: 'Mẫu tóc nhuộm Balayage tại LeLe Hair Design',
    },
    {
      number: '05',
      title: 'DUỖI',
      description: 'Điều chỉnh phom tóc gọn gàng, mềm mại và phù hợp với nhu cầu sử dụng.',
      image: '/images/services/03-bob-layer.png',
      imageAlt: 'Mẫu tóc Bob Layer tại LeLe Hair Design',
    },
    {
      number: '06',
      title: 'PHỤC HỒI',
      description: 'Chăm sóc chuyên sâu để mái tóc mềm mại, khỏe hơn sau dịch vụ hóa chất.',
      image: '/images/services/08-hair-recovery.png',
      imageAlt: 'Dịch vụ phục hồi tóc tại LeLe Hair Design',
    },
  ],
  signatureStyles: [
    { name: 'LONG LAYER', image: '/images/signature/01-signature-long-layer.png', imageAlt: 'Mẫu tóc Long Layer đặc trưng tại LeLe Hair Design' },
    { name: 'LAYER DESIGN', image: '/images/signature/02-signature-layer-design.png', imageAlt: 'Mẫu tóc Layer Design tại LeLe Hair Design' },
    { name: 'BOB LAYER', image: '/images/signature/03-signature-bob-layer.png', imageAlt: 'Mẫu tóc Bob Layer tại LeLe Hair Design' },
    { name: 'WOLFCUT', image: '/images/signature/05-signature-wolfcut.png', imageAlt: 'Mẫu tóc Wolfcut tại LeLe Hair Design' },
    { name: 'C-CURL', image: '/images/signature/04-signature-c-curl.png', imageAlt: 'Mẫu tóc C-Curl tại LeLe Hair Design' },
    { name: 'BALAYAGE', image: '/images/signature/06-signature-balayage.png', imageAlt: 'Mẫu tóc nhuộm Balayage tại LeLe Hair Design' },
  ],
  signatureHighlights: [
    {
      name: 'LONG LAYER',
      description: 'Đường layer mềm mại, giữ độ dài và tạo chuyển động tự nhiên cho mái tóc.',
      image: '/images/signature-new/01-signature-long-layer.jpg',
      imageAlt: 'Mẫu tóc Long Layer đặc trưng tại LeLe Hair Design',
    },
    {
      name: 'BOB LAYER',
      description: 'Form tóc gọn hiện đại, cân bằng giữa cấu trúc rõ nét và nét mềm mại.',
      image: '/images/signature-new/02-signature-bob-layer.jpg',
      imageAlt: 'Mẫu tóc Bob Layer đặc trưng tại LeLe Hair Design',
    },
    {
      name: 'BALAYAGE',
      description: 'Hiệu ứng màu chuyển tự nhiên, có chiều sâu và được tinh chỉnh theo từng nền tóc.',
      image: '/images/signature-new/03-signature-balayage.jpg',
      imageAlt: 'Mẫu tóc nhuộm Balayage đặc trưng tại LeLe Hair Design',
    },
  ],
  customerGallery: [
    {
      id: 'long-layer',
      image: '/images/real-clients/01-real-client-long-layer.png',
      title: { en: 'Long Layer', vi: 'Long Layer' },
      alt: {
        en: 'Long layered hairstyle created for a customer at LeLe Hair Design',
        vi: 'Mẫu tóc Long Layer thực tế của khách hàng tại LeLe Hair Design',
      },
    },
    {
      id: 'soft-curl',
      image: '/images/real-clients/02-real-client-soft-curl.png',
      title: { en: 'Soft Curl', vi: 'Uốn sóng mềm' },
      alt: {
        en: 'Soft curled hairstyle created for a customer at LeLe Hair Design',
        vi: 'Mẫu tóc uốn sóng mềm thực tế tại LeLe Hair Design',
      },
    },
    {
      id: 'layer-cut',
      image: '/images/real-clients/03-real-client-wolf-layer.png',
      title: { en: 'Layer Cut', vi: 'Layer' },
      alt: {
        en: 'Layer haircut created for a customer at LeLe Hair Design',
        vi: 'Mẫu tóc Layer thực tế của khách hàng tại LeLe Hair Design',
      },
    },
    {
      id: 'short-design',
      image: '/images/real-clients/04-real-client-short-cut.png',
      title: { en: 'Short Design', vi: 'Thiết kế tóc ngắn' },
      alt: {
        en: 'Short hairstyle created for a customer at LeLe Hair Design',
        vi: 'Mẫu tóc ngắn thực tế tại LeLe Hair Design',
      },
    },
    {
      id: 'short-curly-cut',
      image: '/images/real-clients/05-short-curly-cut.jpg',
      title: { en: 'Short Curly Cut', vi: 'Tóc ngắn uốn xoăn' },
      alt: {
        en: 'Short curly haircut created for a customer at LeLe Hair Design',
        vi: 'Mẫu tóc ngắn uốn xoăn thực tế tại LeLe Hair Design',
      },
    },
    {
      id: 'wavy-bob',
      image: '/images/real-clients/06-wavy-bob.jpg',
      title: { en: 'Wavy Bob', vi: 'Bob uốn sóng' },
      alt: {
        en: 'Soft wavy bob hairstyle created for a customer at LeLe Hair Design',
        vi: 'Mẫu tóc Bob uốn sóng mềm thực tế tại LeLe Hair Design',
      },
    },
    {
      id: 'long-layer-volume',
      image: '/images/real-clients/07-long-layer-volume.jpg',
      title: { en: 'Long Layer', vi: 'Long Layer' },
      alt: {
        en: 'Voluminous long layered hairstyle created at LeLe Hair Design',
        vi: 'Mẫu tóc Long Layer bồng bềnh thực tế tại LeLe Hair Design',
      },
    },
    {
      id: 'balayage-waves',
      image: '/images/real-clients/08-balayage-waves.jpg',
      title: { en: 'Balayage Waves', vi: 'Balayage uốn sóng' },
      alt: {
        en: 'Dimensional balayage waves created at LeLe Hair Design',
        vi: 'Mẫu tóc Balayage uốn sóng có chiều sâu tại LeLe Hair Design',
      },
    },
    {
      id: 'sleek-straight',
      image: '/images/real-clients/09-sleek-straight.jpg',
      title: { en: 'Sleek Straight', vi: 'Tóc duỗi suôn mượt' },
      alt: {
        en: 'Long sleek straight hairstyle created at LeLe Hair Design',
        vi: 'Mẫu tóc dài duỗi suôn mượt thực tế tại LeLe Hair Design',
      },
    },
    {
      id: 'ash-balayage-layer',
      image: '/images/real-clients/10-ash-balayage-layer.jpg',
      title: { en: 'Ash Balayage', vi: 'Balayage ánh khói' },
      alt: {
        en: 'Ash balayage layered hairstyle created at LeLe Hair Design',
        vi: 'Mẫu tóc Layer Balayage ánh khói tại LeLe Hair Design',
      },
    },
  ] satisfies CustomerGalleryItem[],
  portfolioFilters: ['TẤT CẢ', 'LAYER', 'BOB', 'CURL', 'COLOR', 'WOLFCUT', 'TRANSFORMATION'],
  portfolio: [
    { id: 'long-layer', title: 'LONG LAYER', categories: ['LAYER'], image: '/images/portfolio-new/01-long-layer.jpg', imageAlt: 'Mẫu tóc Long Layer tại LeLe Hair Design' },
    { id: 'bob-layer', title: 'BOB LAYER', categories: ['BOB'], image: '/images/portfolio-new/02-bob-layer.jpg', imageAlt: 'Mẫu tóc Bob Layer tại LeLe Hair Design' },
    { id: 'wolfcut', title: 'WOLFCUT', categories: ['WOLFCUT'], image: '/images/portfolio-new/03-wolfcut.jpg', imageAlt: 'Mẫu tóc Wolfcut tại LeLe Hair Design' },
    { id: 'c-curl', title: 'C-CURL', categories: ['CURL'], image: '/images/portfolio-new/04-c-curl.jpg', imageAlt: 'Mẫu tóc C-Curl tại LeLe Hair Design' },
    { id: 'song-loi', title: 'UỐN SÓNG LƠI', categories: ['CURL'], image: '/images/portfolio-new/05-uon-song-loi.jpg', imageAlt: 'Mẫu tóc uốn sóng lơi tại LeLe Hair Design' },
    { id: 'uon-layer', title: 'UỐN LAYER', categories: ['CURL', 'LAYER'], image: '/images/portfolio-new/06-uon-layer.jpg', imageAlt: 'Mẫu tóc uốn Layer tại LeLe Hair Design' },
    { id: 'color-design', title: 'COLOR DESIGN', categories: ['COLOR'], image: '/images/portfolio-new/07-color-design.jpg', imageAlt: 'Mẫu nhuộm Color Design tại LeLe Hair Design' },
    { id: 'balayage', title: 'BALAYAGE', categories: ['COLOR'], image: '/images/portfolio-new/08-balayage.jpg', imageAlt: 'Mẫu tóc Balayage tại LeLe Hair Design' },
    { id: 'color-haircut', title: 'COLOR + HAIRCUT', categories: ['COLOR'], image: '/images/portfolio-new/09-color-haircut.jpg', imageAlt: 'Mẫu nhuộm kết hợp cắt thiết kế tại LeLe Hair Design' },
    { id: 'color-transition', title: 'COLOR TRANSITION', categories: ['COLOR'], image: '/images/portfolio-new/10-color-transition.jpg', imageAlt: 'Mẫu nhuộm chuyển màu tại LeLe Hair Design' },
    { id: 'hair-recovery', title: 'HAIR RECOVERY', categories: ['TRANSFORMATION'], image: '/images/portfolio-new/11-hair-recovery.jpg', imageAlt: 'Mái tóc sau phục hồi tại LeLe Hair Design' },
    { id: 'transformation', title: 'TRANSFORMATION', categories: ['TRANSFORMATION'], image: '/images/portfolio-new/12-transformation.jpg', imageAlt: 'Màn thay đổi kiểu tóc tại LeLe Hair Design' },
  ] satisfies PortfolioItem[],
  spaceImages: [
    { image: '/images/the-space-new/01-the-space-lounge.png', imageAlt: 'Không gian bên trong LeLe Hair Design' },
    { image: '/images/the-space-new/02-the-space-stations.png', imageAlt: 'Khu vực đón khách tại LeLe Hair Design' },
    { image: '/images/the-space-new/03-the-space-mirror.png', imageAlt: 'Không gian thư giãn tại LeLe Hair Design' },
  ],
  journalArticles: [
    { id: 'long-layer', title: 'LONG LAYER CÓ PHÙ HỢP VỚI BẠN?', summary: 'Cách lựa chọn form layer dựa trên chiều dài, chất tóc và hình dáng khuôn mặt.', category: 'TƯ VẤN', image: '/images/journal/01-long-layer.png', imageAlt: 'Mẫu tóc Long Layer tại LeLe Hair Design' },
    { id: 'bob-c-curl', title: 'BOB LAYER & C-CURL', summary: 'Sự kết hợp giữa cấu trúc Bob hiện đại và chuyển động mềm mại của C-Curl.', category: 'THIẾT KẾ', image: '/images/journal/02-bob-layer-c-curl.png', imageAlt: 'Mẫu tóc Bob Layer và C-Curl tại LeLe Hair Design' },
    { id: 'wolfcut', title: 'WOLFCUT DÀNH CHO AI?', summary: 'Tìm hiểu cấu trúc, độ chuyển tầng và phong cách đặc trưng của Wolfcut.', category: 'TƯ VẤN', image: '/images/journal/03-wolfcut.png', imageAlt: 'Mẫu tóc Wolfcut tại LeLe Hair Design' },
    { id: 'perm-care', title: 'CÁCH CHĂM SÓC TÓC SAU UỐN', summary: 'Những nguyên tắc cơ bản giúp mái tóc duy trì form và cảm giác mềm mại.', category: 'CHĂM SÓC', image: '/images/journal/04-hair-care-after-perm.png', imageAlt: 'Tóc uốn được chăm sóc và phục hồi tại LeLe Hair Design' },
    { id: 'skin-tone-color', title: 'CHỌN MÀU TÓC THEO TONE DA', summary: 'Những yếu tố nên cân nhắc trước khi lựa chọn màu tóc.', category: 'TƯ VẤN', image: '/images/journal/05-color-consultation-by-skin-tone.png', imageAlt: 'Tư vấn màu tóc phù hợp với tông da tại LeLe Hair Design' },
    { id: 'balayage', title: 'BALAYAGE KHÁC GÌ NHUỘM THÔNG THƯỜNG?', summary: 'Tìm hiểu hiệu ứng màu, độ chuyển và đặc trưng của kỹ thuật Balayage.', category: 'XU HƯỚNG', image: '/images/journal/06-balayage.png', imageAlt: 'Mẫu tóc Balayage tại LeLe Hair Design' },
  ] satisfies JournalArticle[],
  seo: {
    title: 'LeLe Hair Design | Hair Salon in Hoan Kiem, Hanoi',
    description:
      `LeLe Hair Design at ${contact.address.en}. Personalized hair design including cuts, perms, color, Balayage and hair recovery.`,
    keywords:
      'LeLe Hair Design, salon tóc Hà Nội, salon tóc Hoàn Kiếm, cắt tóc layer Hà Nội, Long Layer, Bob Layer, uốn tóc Hà Nội, nhuộm tóc Hà Nội, Balayage Hà Nội, Wolfcut Hà Nội, hair salon Hanoi',
  },
};

export default siteContent;
