import { Author, Book, Category, User } from '../types';

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-1',
    slug: 'badiiy-adabiyot',
    name: 'Badiiy adabiyot',
    iconName: 'BookOpen',
    booksCount: 0,
    color: '#3B82F6',
    description: 'Klassik va zamonaviy o‘zbek hamda jahon adabiyoti durdonalari',
    subcategories: [
      { id: 'sub-bad-1', categoryId: 'cat-1', name: 'O‘zbek mumtoz adabiyoti', slug: 'ozbek-mumtoz' },
      { id: 'sub-bad-2', categoryId: 'cat-1', name: 'Zamonaviy o‘zbek nasri', slug: 'zamonaviy-nasr' },
      { id: 'sub-bad-3', categoryId: 'cat-1', name: 'Jahon adabiyoti', slug: 'jahon-adabiyoti' },
      { id: 'sub-bad-4', categoryId: 'cat-1', name: 'Tarixiy romanlar', slug: 'tarixiy-romanlar' },
      { id: 'sub-bad-5', categoryId: 'cat-1', name: 'She’riyat & G‘azallar', slug: 'sheriyat' }
    ]
  },
  {
    id: 'cat-2',
    slug: 'maktab-darsliklari',
    name: 'Maktab darsliklari',
    iconName: 'GraduationCap',
    booksCount: 0,
    color: '#10B981',
    description: '1-sinfdan 11-sinfgacha bo‘lgan barcha umumta’lim fan darsliklari va rasmiy o‘quv qo‘llanmalar',
    subcategories: [
      { id: 'sub-sinf-1', categoryId: 'cat-2', name: '1-sinf', slug: '1-sinf', description: '1-sinf o‘quvchilari uchun darsliklar va o‘quv qo‘llanmalar' },
      { id: 'sub-sinf-2', categoryId: 'cat-2', name: '2-sinf', slug: '2-sinf', description: '2-sinf darsliklari va mashq to‘plamlari' },
      { id: 'sub-sinf-3', categoryId: 'cat-2', name: '3-sinf', slug: '3-sinf', description: '3-sinf boshlang‘ich ta’lim kitoblari' },
      { id: 'sub-sinf-4', categoryId: 'cat-2', name: '4-sinf', slug: '4-sinf', description: '4-sinf umumta’lim fan darsliklari' },
      { id: 'sub-sinf-5', categoryId: 'cat-2', name: '5-sinf', slug: '5-sinf', description: '5-sinf darsliklari va qo‘llanmalari' },
      { id: 'sub-sinf-6', categoryId: 'cat-2', name: '6-sinf', slug: '6-sinf', description: '6-sinf darsliklari va atlaslari' },
      { id: 'sub-sinf-7', categoryId: 'cat-2', name: '7-sinf', slug: '7-sinf', description: '7-sinf umumta’lim darsliklari' },
      { id: 'sub-sinf-8', categoryId: 'cat-2', name: '8-sinf', slug: '8-sinf', description: '8-sinf fan darsliklari' },
      { id: 'sub-sinf-9', categoryId: 'cat-2', name: '9-sinf', slug: '9-sinf', description: '9-sinf umumta’lim darsliklari' },
      { id: 'sub-sinf-10', categoryId: 'cat-2', name: '10-sinf', slug: '10-sinf', description: '10-sinf chuqurlashtirilgan o‘quv adabiyotlari' },
      { id: 'sub-sinf-11', categoryId: 'cat-2', name: '11-sinf', slug: '11-sinf', description: '11-sinf bitiruvchi sinf kitoblari va OTMga tayyorgarlik' }
    ]
  },
  {
    id: 'cat-3',
    slug: 'informatika',
    name: 'Informatika',
    iconName: 'Laptop',
    booksCount: 0,
    color: '#6366F1',
    description: 'Dasturlash, axborot texnologiyalari va kiberxavfsizlik',
    subcategories: [
      { id: 'sub-inf-1', categoryId: 'cat-3', name: 'Dasturlash (Python, Web, C++)', slug: 'dasturlash' },
      { id: 'sub-inf-2', categoryId: 'cat-3', name: 'Ma’lumotlar fani & Algoritmlar', slug: 'data-science' },
      { id: 'sub-inf-3', categoryId: 'cat-3', name: 'Kiberxavfsizlik & Tarmoqlar', slug: 'kiberxavfsizlik' },
      { id: 'sub-inf-4', categoryId: 'cat-3', name: 'Kompyuter savodxonligi', slug: 'kompyuter-savodxonligi' }
    ]
  },
  {
    id: 'cat-4',
    slug: 'matematika',
    name: 'Matematika',
    iconName: 'Divide',
    booksCount: 0,
    color: '#EC4899',
    description: 'Algebra, geometriya, oliy matematika va mantiqiy masalalar',
    subcategories: [
      { id: 'sub-math-1', categoryId: 'cat-4', name: 'Algebra', slug: 'algebra' },
      { id: 'sub-math-2', categoryId: 'cat-4', name: 'Geometriya', slug: 'geometriya' },
      { id: 'sub-math-3', categoryId: 'cat-4', name: 'Oliy matematika & Ehtimollar', slug: 'oliy-matematika' },
      { id: 'sub-math-4', categoryId: 'cat-4', name: 'Olimpiada masalalari', slug: 'olimpiada' }
    ]
  },
  {
    id: 'cat-5',
    slug: 'tarix',
    name: 'Tarix',
    iconName: 'Globe',
    booksCount: 0,
    color: '#F59E0B',
    description: 'O‘zbekiston va jahon sivilizatsiyasi tarixi, xotiralar va ilmiy asarlar',
    subcategories: [
      { id: 'sub-tar-1', categoryId: 'cat-5', name: 'O‘zbekiston tarixi', slug: 'ozbekiston-tarixi' },
      { id: 'sub-tar-2', categoryId: 'cat-5', name: 'Jahon tarixi', slug: 'jahon-tarixi' },
      { id: 'sub-tar-3', categoryId: 'cat-5', name: 'Amir Temur va Temuriylar', slug: 'temuriylar' }
    ]
  },
  {
    id: 'cat-6',
    slug: 'ilm-fan',
    name: 'Ilm-fan',
    iconName: 'Microscope',
    booksCount: 0,
    color: '#06B6D4',
    description: 'Fizika, biologiya, kimyo, astronomiya va ilmiy tadqiqotlar',
    subcategories: [
      { id: 'sub-ilm-1', categoryId: 'cat-6', name: 'Fizika & Astronomiya', slug: 'fizika-astronomiya' },
      { id: 'sub-ilm-2', categoryId: 'cat-6', name: 'Kimyo', slug: 'kimyo' },
      { id: 'sub-ilm-3', categoryId: 'cat-6', name: 'Biologiya & Ekologiya', slug: 'biologiya' }
    ]
  },
  {
    id: 'cat-7',
    slug: 'bolalar-adabiyoti',
    name: 'Bolalar adabiyoti',
    iconName: 'Smile',
    booksCount: 0,
    color: '#84CC16',
    description: 'Ertaklar, qissalar, she’rlar va bolalar uchun qiziqarli hikoyalar',
    subcategories: [
      { id: 'sub-bol-1', categoryId: 'cat-7', name: 'Xalq ertaklari', slug: 'ertaklar' },
      { id: 'sub-bol-2', categoryId: 'cat-7', name: 'Bolalar ensiklopediyasi', slug: 'ensiklopediya' },
      { id: 'sub-bol-3', categoryId: 'cat-7', name: 'Qiziqarli hikoyalar', slug: 'hikoyalar' }
    ]
  },
  {
    id: 'cat-8',
    slug: 'chet-tillari',
    name: 'Chet tillari',
    iconName: 'Languages',
    booksCount: 0,
    color: '#8B5CF6',
    description: 'Ingliz, nemis, koreys, xitoy va boshqa tillarni o‘rganish qo‘llanmalari',
    subcategories: [
      { id: 'sub-lang-1', categoryId: 'cat-8', name: 'Ingliz tili (IELTS, CEFR, Grammar)', slug: 'ingliz-tili' },
      { id: 'sub-lang-2', categoryId: 'cat-8', name: 'Nemis tili', slug: 'nemis-tili' },
      { id: 'sub-lang-3', categoryId: 'cat-8', name: 'Rus tili', slug: 'rus-tili' },
      { id: 'sub-lang-4', categoryId: 'cat-8', name: 'Koreys & Xitoy tillari', slug: 'sharq-tillari' }
    ]
  },
  {
    id: 'cat-9',
    slug: 'psixologiya',
    name: 'Psixologiya',
    iconName: 'Brain',
    booksCount: 0,
    color: '#14B8A6',
    description: 'Shaxsiy rivojlanish, motivatsiya, muloqot va ruhiy barqarorlik',
    subcategories: [
      { id: 'sub-psi-1', categoryId: 'cat-9', name: 'Shaxsiy rivojlanish & Motivatsiya', slug: 'motivatsiya' },
      { id: 'sub-psi-2', categoryId: 'cat-9', name: 'Muloqot va Liderlik', slug: 'liderlik' }
    ]
  },
  {
    id: 'cat-10',
    slug: 'biznes',
    name: 'Biznes',
    iconName: 'Briefcase',
    booksCount: 0,
    color: '#EAB308',
    description: 'Tadbirkorlik, moliya, investitsiya, marketing va boshqaruv sirlari',
    subcategories: [
      { id: 'sub-biz-1', categoryId: 'cat-10', name: 'Moliya & Investitsiya', slug: 'moliya' },
      { id: 'sub-biz-2', categoryId: 'cat-10', name: 'Marketing & Savdo', slug: 'marketing' },
      { id: 'sub-biz-3', categoryId: 'cat-10', name: 'Startap va Menejment', slug: 'menejment' }
    ]
  },
  {
    id: 'cat-11',
    slug: 'huquq',
    name: 'Huquq',
    iconName: 'Scale',
    booksCount: 0,
    color: '#EF4444',
    description: 'Qonun hujjatlari, konstitutsiya, yuridik darsliklar va sharhlar'
  },
  {
    id: 'cat-12',
    slug: 'sanat',
    name: 'San’at',
    iconName: 'Palette',
    booksCount: 0,
    color: '#A855F7',
    description: 'Arxitektura, rangtasvir, musiqa, teatr va kino tarixi'
  }
];

export const INITIAL_AUTHORS: Author[] = [];

export const INITIAL_BOOKS: Book[] = [];

export const ADMIN_USER: User = {
  id: 'admin-1',
  name: 'Muxiddin Aliyev',
  email: 'muxiddin980001@gmail.com',
  role: 'ADMIN',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
  joinedDate: '2026-09-19',
  stats: {
    booksRead: 0,
    readingHours: 0,
    favoriteCount: 0,
    audioListenedHours: 0
  }
};

export const DEMO_USER: User = {
  id: 'user-reader-1',
  name: 'Kitobxon',
  email: 'kitobxon@signalbooks.uz',
  role: 'USER',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=300',
  joinedDate: '2026-09-19',
  stats: {
    booksRead: 0,
    readingHours: 0,
    favoriteCount: 0,
    audioListenedHours: 0
  }
};
