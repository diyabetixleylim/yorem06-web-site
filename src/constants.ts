export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  unit: string;
  howToCook?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Reward {
  id: number;
  label: string;
  probability: number; // 0 to 1
  color: string;
  productId?: string;
  quantity?: number;
}

export const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Çömlekçatlatan Pirinç',
    description: "Bazı pirinçler pilav olur. Bazıları ise sofrada hatıra bırakır. Çömlekçatlatan Pirinç; ata tohumundan yetiştirilen, işlem görmeden ve doğal yapısı korunarak sofralarınıza gelen özel bir pirinçtir. Bu yüzden piştiğinde pilavı tane tane olur ve mutfağı çocukluğumuzun pilav kokusuyla doldurur.\n\n✔ Yerli ata tohumundan yetiştir\n✔ Pestisit analizleri temiz, güvenle tüketilebilir\n✔ Glisemik indeksi düşüktür\n✔ Katkı ve koruyucu içermez\n\nBu ismin de bir hikâyesi var. Rahmetli babaannem anlatırdı: 'Bizim gençliğimizde pirinçler çömlekte pişerdi. Bizim pirinci çömleğe koyduğunda öyle kabarırdı ki iki katı, üç katı büyürdü. Eğer çömlekte en ufak bir yapım hatası varsa dayanamaz… çömlek çatlar.' İşte o yüzden bu pirincin adı Çömlekçatlatan kaldı.",
    price: 125,
    unit: '1 KG',
    category: 'Bakliyat',
    howToCook: "Çömlekçatlatan Pirinç’in doğal yapısını ve tane tane pilav özelliğini en iyi şekilde ortaya çıkarmak için bu adımları izleyebilirsiniz:\n\n1. Islatma: Pirinci pişirmeden önce ılık tuzlu suda en az 30-45 dakika bekletin. Bu, pirincin nişastasını salmasını ve daha iyi kabarmasını sağlar.\n2. Yıkama: Islatma sonrası pirinci soğuk suyla, suyu tamamen berraklaşana kadar nazikçe yıkayın.\n3. Kavurma: Tencereye tereyağı veya zeytinyağını alın. Süzülen pirinçleri ekleyip pirinçler şeffaflaşana kadar orta ateşte kavurun.\n4. Su Oranı: 1 su bardağı Çömlekçatlatan Pirinç için 1.5 su bardağı sıcak su (veya et/tavuk suyu) kullanın.\n5. Pişirme: Suyu ekledikten sonra bir kez karıştırın, kapağını kapatın. Önce harlı ateşte kaynatın, sonra en kısık ateşte suyunu çekene kadar pişirin.\n6. Demleme: Ocağı kapattıktan sonra tencerenin üzerine kağıt havlu koyup kapağını kapatın. En az 20 dakika demlenmeye bırakın.\n\nAfiyet olsun! Gerçek pilav lezzetinin tadını çıkarın.",
    images: [
      'https://i.imgur.com/48Jm2nA.jpeg',
      'https://i.imgur.com/B3HEJMx.jpeg',
      'https://i.imgur.com/Kq7MYHk.jpeg'
    ]
  },
  {
    id: '2',
    name: 'Bol Yumurtalı Ev Eriştesi',
    description: "Bizim eriştemiz: Kırık yumurta değil, bolca taze köy yumurtasıyla hazırlanır. O meşhur Doğal rafine edilmemiş unumuz kullanılır. Sadece kaya tuzu ile yoğrulur. Katkısız, ev usulü hazırlanır ve özenle kurutulur. Katkı yok. Koruyucu yok. Hile yok. Saf lezzet var. Yoğun tat var. Gerçek emek var. Deneyenlerin çoğu aynı şeyi söylüyor: 'Anne eli değmiş gibi… eskilerin eriştesi.'",
    price: 250,
    unit: '1 KG',
    category: 'Hamur İşi',
    images: [
      'https://i.imgur.com/0ahGquc.jpeg',
      'https://i.imgur.com/cduG0ic.jpeg'
    ]
  },
  {
    id: '3',
    name: 'Pilavlık Köy Bulguru',
    description: "Gerçek bulgur artık kolay bulunmuyor. Bizim Pilavlık Köy Bulguru ise eskisi gibi hazırlanır. Buğday önce usulüne uygun şekilde kaynatılır, sonra güneşte kurutulur ve taş değirmende tek çekim yapılır. İşlem görmez, rafine edilmez. Bu yüzden kepeği üzerinde kalır, buğdayın özü kaybolmaz. Tencereye koyduğunuzda anlarsınız zaten. Daha pişerken mutfağı o gerçek bulgur kokusu doldurur. İşte bizim bulgurumuz tam olarak o eski bulgurun kendisi.",
    price: 85,
    unit: '1 KG',
    category: 'Bakliyat',
    images: [
      'https://i.imgur.com/DBXUyhA.jpeg',
      'https://i.imgur.com/HJ08MtG.jpeg',
      'https://i.imgur.com/Au2Hbu5.jpeg'
    ]
  },
  {
    id: '4',
    name: 'Atalık Hanımteni Şeker Fasulyesi',
    description: "Her yıl sabırsızlıkla beklenir, bu kıymetli fasulye için takvimlere not düşülür. Çünkü bu sadece bir fasulye değil… Yörem06’nın atalık mirası: Hanımteni Şeker Fasulyesi. Kabuğu yok gibi incedir. Pişerken dağılmaz, taneleri diri kalır ve ağızda pamuk gibi erir. Aroması ise bambaşkadır; ilk lokmada insanı yıllar önceki o sade ve gerçek sofralara götürür. Atalık tohumdan yetişir, toksitsiz ve ilaçsız üretimle hazırlanır. Doğallığını kaybetmeden sofralara ulaşır. Üstelik her yerde bulunmaz. Az yetişir, bu yüzden bilenler her yıl aynı şeyi söyler: 'Hanımteni zamanı geldi.' Bu yılın hasadı geldi. Sınırlı, doğal ve tertemiz.",
    price: 480,
    unit: '1 KG',
    category: 'Bakliyat',
    images: [
      'https://i.imgur.com/mpJCQFn.jpeg',
      'https://i.imgur.com/mPgBkyf.jpeg',
      'https://i.imgur.com/KY3FBFb.jpeg'
    ]
  },
  {
    id: '5',
    name: 'Gökçe Nohut',
    description: "Bazı nohutlar sadece yemek olur. Bazıları ise sofrada gerçek nohut lezzetini hatırlatır. Ata Tohum Gökçe Nohut, geleneksel yöntemlerle yerli tohumdan yetiştilen bir nohuttur. Küçük üretimle yetişir, doğallığını kaybetmeden sofralara ulaşır. Piştiğinde farkını hemen gösterir. Dağılmaz, düdüklü tencereye gerek kalmadan kolayca pişer, kabuk atma, ayrılmaz ve lezzeti yoğun olur. Üstelik doğru nohutun en çok şikâyet edilen özelliği olan gaz ve şişkinlik problemi yaşamazsınız. İşte bu yüzden birçok kişi ilk kez denediğinde aynı şeyi söyler: 'Bu nohut bildiğimiz nohuta benzemiyor.' Çünkü bu sıradan bir nohut değil. Ata tohumu Gökçe Nohut.",
    price: 195,
    unit: '1 KG',
    category: 'Bakliyat',
    images: [
      'https://i.imgur.com/pDWbaQD.jpeg',
      'https://i.imgur.com/9yCrMCP_d.webp?maxwidth=1520&fidelity=grand'
    ]
  },
  {
    id: '6',
    name: 'Doğal Köy Barbunyası',
    description: "Köy barbunyamız, yerli tohumundan, kimyasal gübre ve ilaç kullanılmadan yetişen gerçek köy mahsulü. Pişerken dağılmayan, kabuğu sertleşmeyen, lokum gibi içi yumuşacık. Protein, lif ve mineral değeri yüksek; çocuklara da gönül rahatlığıyla yedirebileceğiniz kadar temiz. Bir kez tadına bakanlar net söylüyor: 'Market barbunyası değil bu… Köy barbunyası net bir şekilde lezzetinden belli.' Gerçek barbunya arayanlara duyurulur. Yeni mahsul taze hasatı şimdi hazır, tükenmeden hemen sipariş verebilirsiniz.",
    price: 275,
    unit: '1 KG',
    category: 'Bakliyat',
    images: [
      'https://i.imgur.com/JGNrefi.jpeg',
      'https://i.imgur.com/4EUBcU3.jpeg',
      'https://i.imgur.com/t46CiEI.jpeg'
    ]
  },
  {
    id: '7',
    name: 'Yerli Patlatmalık Mısır',
    description: "Yerli Patlatmalık Mısırımız, GDO’suz yerli tohumlardan yetiştirilen doğal bir mısırdır. İthal, eski sezon paketli mısırlardan çok farklıdır. Tavaya girdiğinde farkını hemen gösterir. Kabuğu incedir, patladıktan sonra ağızda rahatsız etmez ve kolayca kaybolur. Her tanesi patlar ve gerçek mısır aromasını ilk lokmada hissedersiniz.",
    price: 95,
    unit: '1 KG',
    category: 'Atıştırmalık',
    images: [
      'https://i.imgur.com/zejjCfR.jpeg',
      'https://i.imgur.com/EUZvr96.jpeg'
    ]
  },
  {
    id: '8',
    name: 'Taş Değirmen Tam Buğday Unu',
    description: "Bazı unlar tam buğday olduğunu zanneder ama; Bizim hakiki tam buğday unumuz ise buğdayın kendisini taşır. Taş Değirmen Tam Buğday Unumuz, buğdayın tamamı kullanılarak geleneksel taş değirmende öğütülür. Yüksek ısıya maruz kalmadan öğütüldüğü için besin değerleri korunur ve buğdayın doğal yapısı kaybolmaz. Buğdayın kabuğundan özüne kadar 11 katmanı bu unun içinde kalır. Kepeği, ruşeymi ve özü ayrılmaz. Bu yüzden hem aroması güçlüdür hem de gerçek tam buğday ununun karakterini taşır. Hamurla buluştuğunda farkını hemen gösterir. Ekmeği, bazlaması, lavaşı daha tok aromalı olur ve mutfağa o eski değirmen kokusu yayılır.",
    price: 425,
    unit: '5 KG',
    category: 'Unlar',
    images: [
      'https://i.imgur.com/gZe9wdB.jpeg',
      'https://i.imgur.com/sDzHOcX.jpeg',
      'https://i.imgur.com/iBWvohq_d.webp?maxwidth=760&fidelity=grand'
    ]
  },
  {
    id: '9',
    name: 'Doğal Beyaz Un',
    description: "İyi bir hamurun sırrı sadece ustasında değildir. Ununda da saklıdır. Doğal Beyaz Unumuz, katkı ve koruyucu içermeyen, rafine işlemlerden geçirilmeden hazırlanan gerçek bir beyaz undur. Buğdayın doğal yapısı korunur, gereksiz işlemlerle özünden uzaklaştırılmaz. Bu yüzden hamurla buluştuğunda farkını hemen gösterir. Kolay yoğrulur, güzel kabarır ve pişerken mutfağı o eski fırın kokusuyla doldurur.\n\n✔ Katkı ve koruyucu içermez\n✔ Doğal ve rafine edilmemiştir\n✔ Hamuru kolay yoğrulur\n✔ Güzel kabarma sağlar\n✔ Ekmek, börek ve hamur işleri için idealdir",
    price: 425,
    unit: '5 KG',
    category: 'Unlar',
    images: [
      'https://i.imgur.com/GYxgJf7.jpeg',
      'https://i.imgur.com/5fdbCP7.jpeg',
      'https://i.imgur.com/bUuwlli.jpeg'
    ]
  },
  {
    id: '10',
    name: 'Yerli Yeşil Mercimek',
    description: "Paketli, ithal eski sezon mercimekle karıştırmayın. Yerli Yeşil Mercimeğimiz, piştiğinde dağılmayan, kabuk atmayan ve tane tane kalan yapısıyla yemeklerinize hem lezzet hem de görüntü katar. Kaynarken mutfağı saran o mis koku vardır ya… İşte o, gerçek mercimeğin kokusudur. Kimyasal yok, GDO yok, koruyucu yok. Sadece toprağın tertemiz bereketi var. Ve işte yıllardır aranan o gerçek yerli yeşil mercimek şimdi sofralarınıza geliyor.",
    price: 250,
    unit: '1 KG',
    category: 'Bakliyat',
    images: [
      'https://i.imgur.com/iUb28Mq_d.webp?maxwidth=1520&fidelity=grand',
      'https://i.imgur.com/b3f3WAL.jpeg',
      'https://i.imgur.com/Pq6aRZG_d.webp?maxwidth=1520&fidelity=grand'
    ]
  },
  {
    id: '11',
    name: 'Köy Cevizi',
    description: "Hakiki Yerli Köy Cevizi. Az miktarda yetişir nasibinde olana ulaşır. Devamı yok. Çünkü bu ceviz bol değil… gerçek. Yağı eline bulaşır. Kırdığında içi dolu dolu çıkar. Bu yılın yeni mahsulü bembeyaz olur. Ne Çin, ne Kore, ne ithal ne de 3-5 sezon eskiden gelme!! Ağzına attığında o yoğun aroma genzine kadar yürür. Market rafındaki solgun cevizlerden değil. Tatlıyı süsleyen aksesuar hiç değil. Bu, tatlıyı tatlı yapan ceviz. Baklavada kendini belli eden, helvada kokusuyla konuşan, atıştırmalıkta yağıyla yoğun aromasıyla parlayan ceviz. Az çünkü hakiki. Az çünkü hile yok. Az çünkü yağlı, yoğun ve gerçek köy cevizi.",
    price: 475,
    unit: '1 KG',
    category: 'Kuruyemiş',
    images: [
      'https://i.imgur.com/eylSjwx_d.webp?maxwidth=1520&fidelity=grand',
      'https://i.imgur.com/IlwlKQm_d.webp?maxwidth=1520&fidelity=grand'
    ]
  },
  {
    id: '12',
    name: 'Yeni Börülce',
    description: "Market raflarında gördüğünüz börülcelerin çoğu aynı görünür. Ama hepsi aynı değildir. Gerçek börülce, piştiğinde anlaşılır. Kabuğunu bırakmaz. Dağılmaz. Ve en önemlisi… mideyi yormaz. Çünkü gerçek olan hızla değil, sabırla yetişir. En güzel tarafı ise lezzetidir. Kendine has, sade ama güçlü bir aroması vardır. Zeytinyağlı yapıldığında sosu emer ama kendi tadını kaybetmez. Salatada diri kalır, ezilmez. Gerçek börülce aceleyle yetişmez. Toprağında olgunlaşır, kurutulduğunda özünü korur. Bu yüzden piştiğinde farkını anlatmaya gerek kalmaz; zaten kendini belli eder.",
    price: 280,
    unit: '1 KG',
    category: 'Bakliyat',
    images: [
      'https://i.imgur.com/FW2igxa_d.webp?maxwidth=1520&fidelity=grand',
      'https://i.imgur.com/FW2igxa.jpeg'
    ]
  }
];

export const REWARDS: Reward[] = [
  { id: 1, label: '1 KG Pilavlık Köy Bulguru', probability: 0.35, color: '#9c8366', productId: '3', quantity: 1 },
  { id: 2, label: '1 KG Bulgur', probability: 0.20, color: '#7d6851', productId: '3', quantity: 1 },
  { id: 3, label: '1 KG Çömlekçatlatan Pirinç', probability: 0.13, color: '#b8a38a', productId: '1', quantity: 1 },
  { id: 4, label: '1 KG Bol Yumurtalı Erişte', probability: 0.12, color: '#718d66', productId: '2', quantity: 1 },
  { id: 5, label: '1 KG Patlatmalık Mısır', probability: 0.12, color: '#58704f', productId: '7', quantity: 1 },
  { id: 6, label: '5 KG Tam Buğday Unu', probability: 0.05, color: '#44563d', productId: '8', quantity: 1 },
  { id: 7, label: 'Ücretsiz Kargo', probability: 0.02, color: '#241d17' },
  { id: 8, label: '300 TL İndirim', probability: 0.01, color: '#f27d26' },
];
