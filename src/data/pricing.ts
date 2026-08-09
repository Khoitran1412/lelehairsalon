export type HairSize = 'S' | 'M' | 'L' | 'XL';

export const hairSizes: { size: HairSize; description: string }[] = [
  { size: 'S', description: 'Tóc ngắn' },
  { size: 'M', description: 'Tóc ngang cằm / ngang vai' },
  { size: 'L', description: 'Tóc qua vai' },
  { size: 'XL', description: 'Tóc dài ngang lưng trở xuống' },
];

export const haircutPricing = {
  note: 'Đã bao gồm gội + cắt + tạo kiểu',
  services: [
    { name: 'CẮT NỮ — CHUYÊN GIA CHÍNH', price: '400K', description: 'Trên 10 năm kinh nghiệm' },
    { name: 'CẮT NỮ — CHUYÊN GIA', price: '300K', description: 'Trên 5 năm kinh nghiệm' },
    { name: 'CẮT NAM', price: '150K' },
  ],
};

export const chemicalPricing = {
  sizes: ['S', 'M', 'L', 'XL'] as HairSize[],
  rows: [
    { name: 'PROFESSIONAL', prices: { S: '800K', M: '1.000K', L: '1.200K', XL: '1.400K' } },
    { name: 'VIP', prices: { S: '1.000K', M: '1.200K', L: '1.400K', XL: '1.600K' } },
    { name: 'VIP + PHỤC HỒI', prices: { S: '1.400K', M: '1.600K', L: '2.000K', XL: '2.400K' } },
  ],
  note: 'Đối với dịch vụ Uốn Hippie phụ thu thêm 300K.',
};

export const recoveryPricing = [
  {
    name: 'ATS / NAPLA / 003',
    subtitle: 'Phục hồi & cấp ẩm',
    prices: { S: '500K', M: '600K', L: '800K', XL: '1.000K' },
  },
  {
    name: 'KERATIN RECOVERY',
    subtitle: 'Phục hồi & chắc khỏe tóc',
    prices: { S: '800K', M: '1.000K', L: '1.200K', XL: '1.400K' },
  },
  {
    name: 'KERATIN COMPLEX',
    prices: { S: '1.500K', M: '2.000K', L: '2.500K', XL: '3.000K' },
  },
  {
    name: 'HAIR SPA',
    subtitle: 'Thải độc & chăm sóc cơ bản',
    prices: { S: '400K', M: '500K', L: '600K', XL: '800K' },
  },
];

export const technicalColorPricing = [
  { name: 'BALAYAGE / OMBRE', price: '3.000K – 5.000K' },
  { name: 'HIDDEN LIGHT', subtitle: 'Nhuộm ẩn', price: '1.500K – 2.500K' },
  { name: 'BABY LIGHT / HIGHLIGHT', price: '1.000K – 2.000K' },
];

export const bleachingPricing = {
  sizedServices: [
    { name: 'TẨY TOÀN ĐẦU', prices: { S: '2.500K', M: '3.000K', L: '4.000K', XL: '5.000K' } },
    { name: 'KHỬ MÀU ĐEN / ĐỎ', prices: { S: '700K', M: '900K', L: '1.000K', XL: '1.100K' } },
  ],
  rootBleaching: [
    { label: 'Dài từ 1 – 5 cm', price: '2.000K' },
    { label: 'Dài trên 5 cm', price: '3.000K' },
  ],
};

export const otherServicesPricing = [
  { name: 'GỘI CƠ BẢN', price: '100K' },
  { name: 'GỘI TÍM', price: '150K' },
  { name: 'GỘI + SẤY TẠO KIỂU', price: '200K' },
  { name: 'TẠO KIỂU', price: '100K' },
  { name: 'UỐN MÁI', price: '300K' },
  { name: 'DẶM CHÂN TÓC', subtitle: 'Dưới 10 cm', price: '800K' },
  { name: 'DUỖI CHÂN TÓC', price: '1.000K' },
  { name: 'UỐN CHÂN TÓC', price: '500K' },
  { name: 'PHỦ BÓNG / TONER', price: '600K' },
];
