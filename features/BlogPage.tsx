import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  ChevronDown,
  ChevronRight,
  Calendar,
  Clock,
  User,
  LogIn,
  X,
  Menu,
  Facebook,
  Linkedin,
  Instagram
} from 'lucide-react';
import { COMMON_NAV_LINKS, NAV_CSS_CLASSES, AUTH_BUTTON_TEXT, NAV_FONT_FAMILY } from '../common/navigation';
import CookieConsent from './CookieConsent';

const LOGO_WHITE = "/biele.png";
const LOGO_BLUE = "/landing.png";
const LOGO_MOBIL = "/mobilemenu.png";
const FEATURED_THUMBNAIL = "https://lordsbenison.sk/wp-content/uploads/2026/05/odstupenie-od-zmluvy.png";

interface NavItem {
  name: string;
  href?: string;
  type: 'link' | 'dropdown';
  active?: boolean;
  action?: () => void;
  items?: { name: string; href?: string; action?: () => void; active?: boolean }[];
}

const posts = [
  {
    kind: 'detail' as const,
    slug: 'online-odstupenie-od-zmluvy',
    title: 'Nové povinnosti pre e-shopy (2026)',
    excerpt: (
      <>
        Od <strong>19. júna 2026</strong> budú musieť e-shopy sprístupniť spotrebiteľom jednoduchú online funkciu na odstúpenie od zmluvy. Kde sa má nachádzať nové tlačidlo pre odstúpenie, čo má obsahovať a aký je predmet <strong>novely zákona č. 108/2024 Z.z.</strong> sa dozviete v našom článku.
      </>
    ),
    meta: '25. 5. 2026 • 7 minút',
    thumbnail: FEATURED_THUMBNAIL,
  },
  {
    kind: 'detail' as const,
    slug: 'novela-zakona-108-2024-z-z',
    title: 'Novela zákona 108/2024 Z. z.',
    excerpt: (
      <>
        Od 19. júna 2026 nadobúda účinnosť <strong>novela zákona 108/2024 Z. z.</strong>, zmeny sa dotknú všetkých e-shopov. Prichádzajú nové informačné povinnosti, nutná úprava Obchodných podmienok a Poučenia podľa prílohy č. 3 predmetného zákona či nutná úprava rozhrania e-shopu.
      </>
    ),
    meta: '29. 4. 2026 • 10 minút',
    thumbnail: 'https://lordsbenison.sk/wp-content/uploads/2026/05/zmena-zakona-108.2024-2.png',
  },
  {
    kind: 'detail' as const,
    slug: 'novy-zakon-108-2024',
    title: 'Nový zákon 108/2024 Z.z.',
    excerpt: (
      <>
        Od 1. júla 2024 prichádza <strong>nový zákon č. 108/2024 Z. z. o ochrane spotrebiteľa</strong>, ktorý <strong>nahradí pôvodné predpisy č. 250/2007 Z. z. a č. 102/2014 Z. z.</strong> Pre e-shopy to znamená nutnosť kompletne prepracovať obchodné podmienky & reklamačný poriadok. Významnú novelu získa aj Občiansky zákonník.
      </>
    ),
    meta: '18. 4. 2024 • 10 minút',
    thumbnail: 'https://lordsbenison.sk/wp-content/uploads/2026/05/zakon-108.2024.png',
  },
  {
    kind: 'detail' as const,
    slug: 'gpsr-nove-povinnosti-pre-e-shopy',
    title: 'GPSR: nové povinnosti pre e-shopy',
    excerpt: (
      <>
        Od 13.12.2024 začalo v Európskej únii platiť nariadenie General Product Safety Regulation (GPSR). Nariadenie GPSR predstavuje <strong>nové povinnosti pre prevádzkovateľov e-shopov</strong> z hľadiska zobrazenie produktu a informácii o produkte. VIac sa dočítate v našom článku.
      </>
    ),
    meta: '17. 2. 2025 • 8 minút',
    thumbnail: 'https://lordsbenison.sk/wp-content/uploads/2026/05/nariadenie-GPSR-3.png',
  },
];

const relatedPreviewBySlug: Record<string, string> = {
  'online-odstupenie-od-zmluvy': 'Od 19. júna 2026 budú musieť e-shopy sprístupniť spotrebiteľom jednoduchú online funkciu na odstúpenie od zmluvy.',
  'novela-zakona-108-2024-z-z': 'Od 19. júna 2026 nadobúda účinnosť novela zákona 108/2024 Z. z., ktorá prináša ďalšie nové povinnosti pre e-shopy.',
  'novy-zakon-108-2024': 'Od 1. júla 2024 priniesol nový zákon č. 108/2024 Z. z. zásadné zmeny vo VOP, reklamáciách a informačných povinnostiach.',
  'gpsr-nove-povinnosti-pre-e-shopy': 'Od 13.12.2024 platí GPSR a e-shopy musia doplniť dôležité informácie o bezpečnosti výrobkov a ich identifikácii.'
};

const featuredArticle = {
  slug: 'online-odstupenie-od-zmluvy',
  title: 'Nová povinnosť pre e-shopy od 19.06.2026: spotrebiteľ musí vedieť odstúpiť od zmluvy priamo online',
  date: '25. 5. 2026',
  readTime: '7 minút',
  author: 'Mgr. Ivan Javorčík',
  excerpt: 'S účinnosťou od 19.06.2026 sa mení zákon č. 108/2024 Z. z. o ochrane spotrebiteľa. Novela prináša novú povinnosť pre e-shopy, ktoré uzatvárajú zmluvy so spotrebiteľmi prostredníctvom online rozhrania. Zmena sa dotkne nielen samotného fungovania e-shopu a jeho používateľského rozhrania, ale aj všeobecných obchodných podmienok.',
  intro: 'Do Zákona o ochrane spotrebiteľa sa dopĺňa nové ustanovenie § 20a, ktoré upravuje uplatnenie práva spotrebiteľa na odstúpenie od zmluvy uzavretej na diaľku prostredníctvom online rozhrania:',
  lawCitation: [
    '(1) Obchodník je povinný zabezpečiť, aby spotrebiteľ mohol odstúpiť od zmluvy uzavretej na diaľku prostredníctvom online rozhrania, aj použitím funkcie na odstúpenie od zmluvy; ustanovenie § 20 ods. 6 tým nie je dotknuté.',
    '(2) Funkcia na odstúpenie od zmluvy musí byť označená ľahko čitateľným spôsobom slovným spojením „odstúpiť od zmluvy tu“ alebo obdobnou formuláciou, ktorá jednoznačne vyjadruje, že jej použitím môže spotrebiteľ odstúpiť od zmluvy. Funkcia na odstúpenie od zmluvy musí byť v online rozhraní zreteľne zobrazená a musí byť pre spotrebiteľa ľahko a nepretržite dostupná počas plynutia lehoty na odstúpenie od zmluvy podľa § 20 ods. 1 až 3 alebo podľa osobitných predpisov.69a)',
    '(3) Funkcia na odstúpenie od zmluvy musí umožniť spotrebiteľovi zaslať obchodníkovi oznámenie o odstúpení od zmluvy využitím online rozhrania, ktorým spotrebiteľ poskytne alebo potvrdí',
    'a) meno a priezvisko spotrebiteľa, ktorý uplatňuje právo na odstúpenie od zmluvy,',
    'b) identifikačné údaje zmluvy, ktorej sa odstúpenie od zmluvy týka,',
    'c) adresu elektronickej pošty spotrebiteľa alebo údaje iného prostriedku online komunikácie, ktorým obchodník poskytne spotrebiteľovi potvrdenie o doručení oznámenia o odstúpení od zmluvy.',
    '(4) Ak spotrebiteľ vyplní oznámenie o odstúpení od zmluvy podľa odseku 3, obchodník zabezpečí, aby spotrebiteľ mohol obchodníkovi odoslať oznámenie o odstúpení od zmluvy aktivovaním osobitnej funkcie v online rozhraní, ktorá musí byť označená ľahko čitateľným spôsobom slovným spojením „potvrdiť odstúpenie od zmluvy“ alebo obdobnou formuláciou, ktorá jednoznačne vyjadruje, že jej aktivovaním spotrebiteľ potvrdí odstúpenie od zmluvy.',
    '(5) Ak spotrebiteľ potvrdí odstúpenie od zmluvy podľa odseku 4, obchodník je povinný bezodkladne poskytnúť spotrebiteľovi potvrdenie o doručení oznámenia o odstúpení od zmluvy na trvanlivom médiu, ktoré obsahuje oznámenie o odstúpení od zmluvy a dátum a čas odoslania oznámenia o odstúpení od zmluvy.',
    '(6) Lehota na odstúpenie od zmluvy podľa § 20 ods. 1 až 3 alebo podľa osobitných predpisov69a) sa považuje za zachovanú, ak spotrebiteľ najneskôr posledný deň lehoty odošle oznámenie o odstúpení od zmluvy obchodníkovi podľa odseku 4.“.'
  ],
  sections: [
    {
      heading: 'Nové povinnosti e-shopov od 19.06.2026: tlačidlo na odstúpenie od zmluvy',
      paragraphs: [
        'Z uvedeného vyplýva, že e-shopy budú musieť od 19.06.2026 zabezpečiť novú online funkcionalitu, prostredníctvom ktorej bude môcť spotrebiteľ jednoducho uplatniť svoje právo na odstúpenie od zmluvy. Nepôjde teda len o možnosť stiahnuť si formulár alebo zaslať odstúpenie e-mailom, ale o samostatnú funkciu dostupnú priamo v rozhraní e-shopu.',
        'Táto funkcia má byť označená zrozumiteľne a jednoznačne, napríklad slovným spojením „odstúpiť od zmluvy tu“ alebo obdobnou formuláciou bez úpravy jej významu.',
        'Dôležité je, aby bola v online rozhraní e-shopu viditeľná a ľahko dostupná (napr. v päte rozhrania e-shopu).',
        'Po kliknutí na túto funkciu by sa mal spotrebiteľ dostať do časti, kde bude môcť online vyplniť údaje potrebné na uplatnenie odstúpenia. Pôjde najmä o jeho meno a priezvisko, identifikačné údaje zmluvy (napríklad číslo objednávky) a e-mailovú adresu alebo iný údaj online komunikácie, na ktorý mu obchodník bezodkladne zašle potvrdenie o prijatí žiadosti o odstúpenie.',
        'Po vyplnení týchto údajov musí mať spotrebiteľ možnosť odstúpenie potvrdiť osobitným tlačidlom s označením „potvrdiť odstúpenie od zmluvy“.',
        'Jednoducho povedané, e-shop bude musieť spotrebiteľovi vytvoriť také online prostredie, v ktorom spotrebiteľ zadá potrebné údaje, potvrdí svoje rozhodnutie a tým uplatní odstúpenie od zmluvy bez uvedenia dôvodu.',
        'Po odoslaní odstúpenia bude e-shop povinný spotrebiteľovi bezodkladne zaslať potvrdenie o doručení oznámenia o odstúpení od zmluvy. V praxi pôjde najčastejšie o potvrdenie zaslané na e-mailovú adresu, ktorú spotrebiteľ uviedol pri vypĺňaní formulára.'
      ]
    },
    {
      heading: 'Ako má tlačidlo na odstúpenie od zmluvy vyzerať v praxi?',
      paragraphs: [
        'Praktickým riešením je umiestniť na e-shop jednoduché a viditeľné tlačidlo alebo odkaz s označením „Odstúpiť od zmluvy tu“. Takéto tlačidlo môže byť integrované napríklad do päty webovej stránky. Dôležité je, aby bolo pre spotrebiteľa ľahko dostupné a aby jeho označenie jednoznačne vyjadrovalo, že slúži na uplatnenie práva na odstúpenie od zmluvy.',
        'Po kliknutí na tlačidlo môže byť spotrebiteľ presmerovaný na samostatnú stránku s formulárom na odstúpenie od zmluvy. Alternatívne sa mu môže otvoriť modálne okno priamo v prostredí e-shopu. V oboch prípadoch by mal formulár spotrebiteľovi umožniť vyplniť údaje potrebné na identifikáciu odstúpenia, najmä meno a priezvisko, identifikačné údaje zmluvy alebo objednávky a e-mailovú adresu na doručenie potvrdenia.',
        'Po vyplnení formulára musí mať spotrebiteľ možnosť svoje odstúpenie jednoznačne potvrdiť osobitným tlačidlom, napríklad s textom „potvrdiť odstúpenie od zmluvy“.',
        'Po potvrdení odstúpenia by mal e-shopový systém automaticky odoslať spotrebiteľovi potvrdenie o doručení oznámenia o odstúpení od zmluvy. Toto potvrdenie by malo obsahovať samotné oznámenie o odstúpení, ako aj dátum a čas jeho odoslania.',
        'Samotný následný proces vrátenia tovaru a vrátenia platby spotrebiteľovi sa zásadne nemení. Po technickom odoslaní odstúpenia bude obchodník pokračovať v štandardnom procese vybavenia odstúpenia od zmluvy obdobne ako doteraz.',
        'Zavedenie tejto novej funkcionality však nebude iba technickou úpravou e-shopu. Prevádzkovatelia e-shopov budú musieť zároveň aktualizovať aj svoje všeobecné obchodné podmienky, keďže do nich bude potrebné doplniť nový spôsob uplatnenia práva na odstúpenie od zmluvy prostredníctvom online rozhrania.'
      ]
    },
    {
      heading: 'Na čo si dať pozor pri novej funkcii na odstúpenie od zmluvy?',
      paragraphs: [
        'Pri nastavovaní novej funkcionality je dôležité, aby jej použitie nebolo podmienené registráciou alebo prihlásením do zákazníckeho účtu. Spotrebiteľ musí mať možnosť odstúpiť od zmluvy aj vtedy, ak nakúpil bez registrácie.',
        'Zároveň by funkcia nemala byť skrytá v zložitom menu alebo dostupná až po viacerých krokoch. Zákon vyžaduje, aby bola zreteľne zobrazená, ľahko dostupná a prístupná počas celej lehoty na odstúpenie od zmluvy.',
        'E-shop by mal myslieť aj na automatické potvrdenie doručenia odstúpenia. Potvrdenie musí byť spotrebiteľovi zaslané bezodkladne na trvanlivom médiu, najčastejšie e-mailom, a malo by obsahovať aj dátum a čas odoslania oznámenia.',
        'Dôležité je tiež správne nastavenie obsahu formulára. Spotrebiteľ by nemal byť nútený vypĺňať viac údajov, než je potrebné na identifikáciu zmluvy a vybavenie odstúpenia. Formulár by preto mal byť jednoduchý, prehľadný a zameraný len na údaje požadované zákonom.',
        'A napokon, e-shop by mal zabezpečiť, aby nová funkcionalita korešpondovala s obchodnými podmienkami. Ak bude na webe dostupný nový spôsob odstúpenia od zmluvy, musí byť správne opísaný aj vo všeobecných obchodných podmienkach.'
      ]
    }
  ],
  conclusion: ''
} as const;

const secondArticle = {
  slug: 'novy-zakon-108-2024',
  title: 'Nový zákon o ochrane spotrebiteľa od 1. júla 2024.\nČo to znamená pre e-shopy?',
  date: '18. 4. 2024',
  readTime: '10 minút',
  author: 'Mgr. Ivan Javorčík',
  excerpt: '',
  intro: 'Od 1. júla 2024 je účinný nový zákon č. 108/2024 Z. z. o ochrane spotrebiteľa, ktorý priniesol zásadnú zmenu v oblasti spotrebiteľského práva. Nový zákon nahradil dovtedajšiu právnu úpravu ochrany spotrebiteľa, najmä zákon č. 250/2007 Z. z. o ochrane spotrebiteľa, a výrazne zasiahol aj do pravidiel, ktoré sa týkajú predaja tovaru a poskytovania služieb cez e-shopy.',
  lawCitation: [] as string[],
  sections: [
    {
      heading: 'Čo sa po 1. júli 2024 zmenilo v praxi',
      paragraphs: [
        'Pre prevádzkovateľov e-shopov nejde iba o formálnu legislatívnu zmenu. Nová právna úprava si v praxi vyžiadala prepracovanie všeobecných obchodných podmienok, reklamačných pravidiel, informačných povinností, spôsobu zobrazovania zliav, práce s recenziami, ako aj viacerých interných procesov pri komunikácii so spotrebiteľom.',
        'Významnou zmenou prešiel aj Občiansky zákonník, do ktorého sa po novom presunula a upravila časť pravidiel týkajúcich sa zodpovednosti za vady a uplatňovania práv spotrebiteľa pri vadnom plnení. Inými slovami, oblasť reklamácií už nemožno riešiť iba podľa pôvodných vzorov reklamačných poriadkov – e-shopy musia svoje dokumenty prispôsobiť novej právnej úprave.'
      ]
    },
    {
      heading: 'Prečo bol prijatý nový zákon?',
      paragraphs: [
        'Spotrebiteľské právo bolo pred prijatím nového zákona rozdelené do viacerých právnych predpisov. To spôsobovalo duplicity, terminologické rozdiely a v praxi aj nejasnosti pri výklade jednotlivých povinností. Dôvodová správa k zákonu uvádza, že cieľom novej právnej úpravy bolo odstrániť duplicity, aplikačné problémy, vnútorné rozpory jednotlivých ustanovení a terminologické odlišnosti.',
        'Nový zákon však neznamená, že celé spotrebiteľské právo je odteraz upravené iba v jednom predpise. Aj naďalej zostáva rozdelené medzi viaceré zákony, najmä zákon o ochrane spotrebiteľa, Občiansky zákonník, zákon o alternatívnom riešení spotrebiteľských sporov a ďalšie osobitné predpisy.',
        'Pre e-shopy je preto dôležité nevnímať zákon č. 108/2024 Z. z. izolovane. Pri nastavovaní obchodných podmienok, reklamačného poriadku a predajných procesov je potrebné zohľadniť aj súvisiace zmeny v Občianskom zákonníku.'
      ]
    },
    {
      heading: 'Čo nový zákon znamená pre e-shopy?',
      paragraphs: [
        'Pre e-shopy priniesol nový zákon najmä potrebu zosúladiť predajné dokumenty a používateľské rozhranie s novými pravidlami. Nestačí iba vymeniť číslo zákona v obchodných podmienkach. V mnohých prípadoch je potrebné prepracovať celé časti dokumentácie, najmä tie, ktoré sa týkajú práv spotrebiteľa, odstúpenia od zmluvy, reklamácií, zliav, recenzií a informačných povinností.',
        'E-shop by mal mať po novom správne nastavené najmä:',
        'všeobecné obchodné podmienky,',
        'reklamačný poriadok alebo časť obchodných podmienok týkajúcu sa zodpovednosti za vady,',
        'poučenie o odstúpení od zmluvy,',
        'formulár na odstúpenie od zmluvy,',
        'informácie poskytované spotrebiteľovi pred uzavretím zmluvy,',
        'pravidlá zobrazovania zliav,',
        'informácie o overovaní recenzií,',
        'informácie o alternatívnom riešení spotrebiteľských sporov.'
      ]
    },
    {
      heading: '1. Nové pojmy a zjednotenie terminológie',
      paragraphs: [
        'Jednou zo základných zmien je používanie novej a jednotnejšej terminológie. Nový zákon pracuje s pojmami ako obchodník, spotrebiteľ, produkt, online trh, digitálny obsah, digitálna služba alebo trvanlivé médium. Tieto pojmy nadväzujú na európsku spotrebiteľskú legislatívu a majú odstrániť rozdiely, ktoré vznikali pri používaní starších pojmov ako predávajúci alebo dodávateľ.',
        'Pre e-shopy to znamená, že aj dokumentácia by mala používať správne pojmy. Ak obchodné podmienky stále vychádzajú zo starých vzorov, môžu obsahovať neaktuálne označenia alebo odkazy na už zrušené zákony.'
      ]
    },
    {
      heading: '2. Zmeny v oblasti reklamácií a zodpovednosti za vady',
      paragraphs: [
        'Jednou z najdôležitejších oblastí, ktorú musia e-shopy skontrolovať, sú reklamácie. Nový zákon už neobsahuje reklamačnú úpravu v takej podobe, ako ju poznali e-shopy podľa predchádzajúcej právnej úpravy. Pravidlá týkajúce sa vytknutia vady a uplatňovania práv zo zodpovednosti za vady sú po novom riešené najmä v Občianskom zákonníku.',
        'To má praktický dopad najmä na reklamačné poriadky. Mnohé e-shopy mali doteraz reklamačný poriadok postavený na pojmoch a postupoch podľa starého zákona o ochrane spotrebiteľa. Po 1. júli 2024 je preto potrebné tieto dokumenty prepracovať tak, aby zodpovedali novej právnej úprave.',
        'V praxi sa odporúča skontrolovať najmä:',
        'ako je v dokumentoch upravené vytknutie vady,',
        'aké práva má spotrebiteľ pri vadnom tovare,',
        'aké lehoty sa uvádzajú pri vybavovaní reklamácie,',
        'aké povinnosti má obchodník pri prijatí reklamácie,',
        'či dokumentácia nepoužíva staré alebo nepresné pojmy,',
        'či reklamačný proces zodpovedá ustanoveniam z OZ.'
      ]
    },
    {
      heading: '3. Zľavy a povinnosť uvádzať predchádzajúcu cenu',
      paragraphs: [
        'Veľmi praktickou zmenou je úprava pravidiel pri oznamovaní zníženia ceny. Ak e-shop uvádza zľavu, musí spotrebiteľovi oznámiť aj predchádzajúcu cenu tovaru. Táto predchádzajúca cena sa určuje spravidla ako najnižšia cena, za ktorú obchodník predával alebo poskytoval tovar v období 30 dní pred znížením ceny.',
        'Cieľom tejto úpravy je zabrániť umelému navyšovaniu cien tesne pred zľavovou akciou a následnému prezentovaniu zľavy, ktorá v skutočnosti nie je reálna. Táto téma je dôležitá najmä pri sezónnych výpredajoch, Black Friday kampaniach, vianočných akciách alebo krátkodobých marketingových kampaniach.',
        'Pre e-shopy to znamená, že musia mať správne nastavený systém zobrazovania zliav. Nestačí uviesť iba percento zľavy alebo preškrtnutú cenu. E-shop musí vedieť preukázať, z akej predchádzajúcej ceny zľava vychádza.'
      ]
    },
    {
      heading: '4. Recenzie a hodnotenia produktov',
      paragraphs: [
        'Nová právna úprava sa výrazne dotýka aj recenzií. Ak e-shop zverejňuje spotrebiteľské hodnotenia produktov, musí spotrebiteľa informovať o tom, či a ako zabezpečuje, že zverejnené recenzie pochádzajú od osôb, ktoré si produkt skutočne zakúpili alebo použili.',
        'Problémom teda nie je samotné zverejňovanie recenzií, ale chýbajúca transparentnosť. Spotrebiteľ by mal vedieť, či ide o overené recenzie, neoverené recenzie, alebo aký mechanizmus e-shop používa na kontrolu ich pravosti.',
        'E-shop by mal preto jasne uviesť napríklad:',
        'či recenzie môžu pridávať iba zákazníci, ktorí si produkt zakúpili,',
        'či sa recenzie technicky overujú cez objednávku,',
        'či e-shop zverejňuje aj negatívne recenzie,',
        'či sú recenzie moderované,',
        'či existujú pravidlá pre nezverejnenie recenzie.',
        'Ak e-shop tvrdí, že recenzie sú overené, mal by mať nastavený aj reálny proces ich overovania.'
      ]
    },
    {
      heading: '5. Dvojitá kvalita tovarov ako klamlivá obchodná praktika',
      paragraphs: [
        'Nový zákon reaguje aj na problém tzv. dvojitej kvality tovarov. Za klamlivé konanie sa môže považovať situácia, keď obchodník prezentuje tovar ako identický s tovarom predávaným v iných členských štátoch Európskej únie, hoci má tento tovar podstatne odlišné zloženie alebo vlastnosti, ak takéto rozdiely nie sú odôvodnené legitímnymi a objektívnymi faktormi.',
        'Táto úprava má význam najmä pri produktoch, ktoré sa predávajú pod rovnakou značkou alebo v rovnakom balení vo viacerých krajinách. Pre bežné e-shopy je dôležité najmä to, aby marketingové tvrdenia o produktoch neboli zavádzajúce a aby spotrebiteľ dostal pravdivé informácie o vlastnostiach tovaru.'
      ]
    },
    {
      heading: '6. Predĺženie lehoty na odstúpenie pri nevyžiadanej návšteve alebo predajnej akcii',
      paragraphs: [
        'Nový zákon upravuje aj predĺženie lehoty na odstúpenie od zmluvy pri niektorých špecifických formách predaja. Pri zmluvách uzavretých počas nevyžiadanej návštevy obchodníka alebo na predajnej akcii sa lehota na odstúpenie od zmluvy predĺžila zo 14 dní na 30 dní.',
        'Táto zmena sa týka najmä podomového predaja a predajných akcií, teda situácií, keď spotrebiteľ často robí nákupné rozhodnutie bez predchádzajúceho plánovania alebo pod určitým tlakom. Pre bežné e-shopy nemusí ísť o najčastejší scenár, ale ak obchodník kombinuje online predaj s predajnými akciami, telefonickým predajom alebo inými formami priameho oslovovania spotrebiteľa, mal by si túto oblasť osobitne skontrolovať.'
      ]
    },
    {
      heading: '7. Nové pravidlá pre online predaj a digitálne prostredie',
      paragraphs: [
        'Zákon č. 108/2024 Z. z. reflektuje aj vývoj digitálneho prostredia. Pracuje s pojmami ako online rozhranie, online trh, digitálna služba alebo digitálny obsah, čo má význam najmä pre e-shopy, platformy, marketplace riešenia a predaj digitálnych produktov.',
        'Ak e-shop predáva digitálny obsah alebo digitálne služby, napríklad online kurzy, softvér, elektronické dokumenty, členstvá alebo prístupy do online systémov, mal by mať obchodné podmienky nastavené osobitne. Pri týchto produktoch sa uplatňujú viaceré špecifické pravidlá, najmä pri dodaní obsahu, súhlase so začatím plnenia a odstúpení od zmluvy.'
      ]
    },
    {
      heading: '8. Informačné povinnosti voči spotrebiteľovi',
      paragraphs: [
        'E-shop musí spotrebiteľovi ešte pred uzavretím zmluvy poskytnúť viacero informácií. Ide napríklad o informácie o obchodníkovi, produkte, cene, nákladoch na dopravu, platobných a dodacích podmienkach, práve na odstúpenie od zmluvy, zodpovednosti za vady a možnostiach riešenia sporov.',
        'Nová právna úprava kladie dôraz na to, aby tieto informácie boli spotrebiteľovi poskytnuté jasne, zrozumiteľne a včas. Nestačí, aby boli niekde „ukryté“ v dlhom texte obchodných podmienok. E-shop by mal mať celý nákupný proces nastavený tak, aby spotrebiteľ dostal podstatné informácie pred odoslaním objednávky.'
      ]
    },
    {
      heading: '9. Alternatívne riešenie spotrebiteľských sporov',
      paragraphs: [
        'Obchodné podmienky by mali obsahovať aj správne informácie o možnosti alternatívneho riešenia spotrebiteľských sporov. Spotrebiteľ musí byť informovaný o tom, že v prípade nespokojnosti sa môže obrátiť na príslušný subjekt alternatívneho riešenia sporov.',
        'Aj táto časť obchodných podmienok býva v starších vzoroch často neaktuálna alebo formulovaná podľa predchádzajúcej právnej úpravy. Preto je vhodné ju pri aktualizácii dokumentácie skontrolovať spolu s celým reklamačným procesom.'
      ]
    },
    {
      heading: '10. Prečo nestačí iba upraviť jeden článok obchodných podmienok?',
      paragraphs: [
        'Nový zákon sa premieta do viacerých častí dokumentácie e-shopu. Ak sa upraví iba úvodné ustanovenie alebo len odkaz na číslo zákona, dokumentácia môže zostať obsahovo nesprávna.',
        'Pri kontrole obchodných podmienok je potrebné pozrieť najmä:',
        'definície používaných pojmov,',
        'identifikáciu obchodníka,',
        'informácie o produktoch a cenách,',
        'objednávkový proces,',
        'platobné a dodacie podmienky,',
        'odstúpenie od zmluvy,',
        'výnimky z práva na odstúpenie,',
        'zodpovednosť za vady,',
        'reklamačný postup,',
        'zľavy a akciové ceny,',
        'recenzie,',
        'alternatívne riešenie sporov,',
        'odkazy na právne predpisy.',
        'Práve preto sa pri e-shopoch odporúča kompletné prepracovanie obchodných podmienok a reklamačného poriadku, nie iba jednoduchá jazyková úprava starého dokumentu.'
      ]
    },
    {
      heading: 'Čo by mal e-shop urobiť po prijatí nového zákona?',
      paragraphs: [
        'Ak e-shop ešte stále používa dokumenty pripravené podľa starej právnej úpravy, mal by ich čo najskôr skontrolovať. Staré obchodné podmienky môžu obsahovať odkazy na zrušené zákony, neaktuálne reklamačné pravidlá alebo chýbajúce informácie o nových povinnostiach.',
        'V praxi odporúčame preveriť najmä:',
        'či obchodné podmienky odkazujú na aktuálne právne predpisy,',
        'či reklamačný poriadok zodpovedá novej úprave Občianskeho zákonníka,',
        'či e-shop správne zobrazuje zľavy a predchádzajúce ceny,',
        'či sú pravidlá recenzií transparentné,',
        'či sú informácie o odstúpení od zmluvy úplné a aktuálne,',
        'či sú spotrebiteľovi poskytované všetky povinné informácie pred objednávkou,',
        'či dokumentácia zodpovedá reálnemu fungovaniu e-shopu.'
      ]
    }
  ],
  conclusion: 'Nový zákon č. 108/2024 Z. z. o ochrane spotrebiteľa predstavuje jednu z najvýznamnejších zmien spotrebiteľskej legislatívy za posledné roky. Pre e-shopy nejde iba o zmenu názvu zákona alebo formálnu úpravu dokumentov. Nová právna úprava ovplyvňuje obchodné podmienky, reklamačný poriadok, spôsob zobrazovania zliav, prácu s recenziami, informačné povinnosti aj celkové nastavenie predajného procesu.\n\nKaždý e-shop, ktorý predáva tovar alebo služby spotrebiteľom, by si mal preto overiť, či jeho dokumentácia a nastavenie webu zodpovedajú aktuálnej legislatíve. V opačnom prípade môže používať neaktuálne obchodné podmienky, ktoré už nezodpovedajú právnemu stavu účinnému od 1. júla 2024.'
} as const;

const thirdArticle = {
  ...featuredArticle,
  slug: 'gpsr-nove-povinnosti-pre-e-shopy',
  title: 'GPSR: nové povinnosti pre e-shopy pri bezpečnosti výrobkov od 13.12.2024',
  date: '17. 2. 2025',
  readTime: '8 minút',
  excerpt: 'E-shopy musia pri produktoch zverejňovať viac informácií o výrobcovi, identifikácii výrobku a bezpečnom používaní.',
  intro: 'Od 13.12.2024 sa v Európskej únii začalo uplatňovať nové nariadenie o všeobecnej bezpečnosti výrobkov, známe ako General Product Safety Regulation, skrátene GPSR. Ide o Nariadenie Európskeho parlamentu a Rady (EÚ) 2023/988, ktoré prináša nové pravidlá pre bezpečnosť spotrebiteľských výrobkov predávaných v Európskej únii. GPSR sa uplatňuje priamo vo všetkých členských štátoch EÚ, bez potreby prijatia osobitného vnútroštátneho zákona.',
  lawCitation: [] as string[],
  sections: [
    {
      heading: 'Čo sa mení od 13.12.2024',
      paragraphs: [
        'Nová právna úprava nahradila doterajšiu smernicu o všeobecnej bezpečnosti výrobkov a reaguje najmä na rast online predaja, cezhraničné dodávky, marketplace platformy a potrebu lepšej vysledovateľnosti výrobkov. Cieľom GPSR je zabezpečiť, aby sa na trh dostávali iba bezpečné výrobky a aby spotrebiteľ už pri online nákupe vedel, kto je za výrobok zodpovedný a aké bezpečnostné informácie sa k nemu viažu.',
        'Pre e-shopy to znamená, že pri produktoch už nestačí uviesť iba názov, cenu, fotografiu a krátky popis. Pri každom výrobku bude potrebné pracovať aj s údajmi o výrobcovi, identifikácii výrobku, prípadnej zodpovednej osobe v EÚ a bezpečnostnými upozorneniami.'
      ]
    },
    {
      heading: 'Čo je GPSR a koho sa týka?',
      paragraphs: [
        'GPSR je všeobecné nariadenie o bezpečnosti výrobkov, ktoré sa vzťahuje na spotrebiteľské výrobky uvádzané alebo sprístupňované na trhu Európskej únie. Týka sa výrobcov, dovozcov, distribútorov, online predajcov, marketplace platforiem a ďalších hospodárskych subjektov v dodávateľskom reťazci.',
        'Nariadenie sa zameriava najmä na výrobky, pri ktorých neexistuje osobitná harmonizovaná právna úprava bezpečnosti, alebo dopĺňa osobitné pravidlá tam, kde konkrétne riziká nie sú dostatočne pokryté inými predpismi.',
        'V praxi sa preto GPSR môže dotknúť veľmi širokého okruhu e-shopov – napríklad e-shopov s domácimi potrebami, elektronikou, oblečením, hračkami, športovým vybavením, doplnkami, nábytkom, dekoráciami, kozmetikou alebo inými spotrebiteľskými výrobkami.'
      ]
    },
    {
      heading: 'Prečo je GPSR dôležité pre e-shopy?',
      paragraphs: [
        'Najväčšia praktická zmena pre e-shopy spočíva v tom, že povinné informácie o bezpečnosti výrobkov sa už netýkajú iba fyzického označenia výrobku, jeho obalu alebo priloženej dokumentácie. Pri online predaji musia byť viaceré údaje zobrazené už priamo v ponuke výrobku na e-shope.',
        'Inými slovami, spotrebiteľ má mať kľúčové informácie k dispozícii ešte pred tým, ako výrobok vloží do košíka a objedná si ho.',
        'GPSR tým výrazne posilňuje transparentnosť online predaja. E-shop by mal pri každom výrobku vedieť jasne identifikovať, o aký výrobok ide, kto je jeho výrobcom, kto je prípadne zodpovednou osobou v EÚ a aké upozornenia alebo bezpečnostné pokyny sa na výrobok vzťahujú.'
      ]
    },
    {
      heading: 'Aké údaje musia byť pri výrobku zverejnené?',
      paragraphs: [
        'Pri predaji výrobkov online stanovuje GPSR osobitné povinnosti pre tzv. predaj na diaľku. Ponuka výrobku musí jasne a viditeľne obsahovať minimálne údaje o výrobcovi, prípadnej zodpovednej osobe v EÚ, identifikácii výrobku a bezpečnostné alebo varovné informácie.',
        'Pre e-shop to v praxi znamená, že pri každom výrobku by mali byť dostupné najmä tieto informácie:'
      ]
    },
    {
      heading: '1. Identifikácia výrobku',
      paragraphs: [
        'Každý výrobok musí byť možné jednoznačne identifikovať. Výrobok má obsahovať údaj umožňujúci jeho identifikáciu, napríklad typ, model, sériové číslo, číslo šarže, EAN kód alebo iný jednoznačný identifikátor.',
        'V e-shope by preto pri produkte mali byť uvedené také údaje, aby bolo možné presne určiť, ktorý konkrétny výrobok je predmetom ponuky.',
        'Dôležité je, aby identifikácia nebola všeobecná alebo nejasná.'
      ]
    },
    {
      heading: '2. Údaje o výrobcovi',
      paragraphs: [
        'E-shop musí pri výrobku zverejniť aj údaje o výrobcovi. V praxi pôjde najmä o:',
        'názov výrobcu alebo obchodné meno,',
        'poštovú adresu,',
        'elektronickú adresu, napríklad e-mail alebo iný elektronický kontakt.',
        'GPSR výslovne vyžaduje, aby pri online ponuke boli uvedené meno, registrované obchodné meno alebo ochranná známka výrobcu a poštová aj elektronická adresa, na ktorej je možné výrobcu kontaktovať.'
      ]
    },
    {
      heading: '3. Zodpovedná osoba v Európskej únii',
      paragraphs: [
        'Ak výrobca nesídli v Európskej únii, pri výrobku musí byť uvedená aj zodpovedná osoba v EÚ.',
        'Pri takýchto produktoch by mal e-shop uvádzať najmä:',
        'názov alebo obchodné meno zodpovednej osoby,',
        'poštovú adresu,',
        'elektronickú adresu.',
        'Ak e-shop predáva výrobky od výrobcov mimo EÚ, táto časť je mimoriadne dôležitá a nemala by sa podceňovať.'
      ]
    },
    {
      heading: '4. Bezpečnostné informácie, upozornenia a pokyny',
      paragraphs: [
        'Každý výrobok, pri ktorom je to potrebné z hľadiska bezpečného používania, musí obsahovať aj príslušné varovania, upozornenia alebo pokyny.',
        'Pri online predaji majú byť tieto informácie zobrazené tak, aby sa s nimi spotrebiteľ vedel oboznámiť ešte pred nákupom.',
        'Pre slovenský e-shop predávajúci slovenským spotrebiteľom to v praxi znamená, že bezpečnostné informácie by mali byť dostupné v slovenskom jazyku.'
      ]
    },
    {
      heading: 'Ako majú byť tieto informácie zobrazené na e-shope?',
      paragraphs: [
        'GPSR vyžaduje, aby boli informácie pri online ponuke uvedené jasne a viditeľne. To znamená, že by nemali byť skryté v obchodných podmienkach, v dokumente na stiahnutie alebo v časti webu, ktorú spotrebiteľ pri bežnom nákupe neuvidí.',
        'Najpraktickejšie riešenie je doplniť do detailu produktu samostatnú sekciu, napríklad „Bezpečnosť výrobku“ alebo „Informácie podľa GPSR“.',
        'Dôležité je, aby e-shop nepristupoval k tejto časti formálne. Pri každom produkte by sa mali uvádzať reálne a konkrétne údaje podľa typu výrobku.'
      ]
    },
    {
      heading: 'Povinnosť sledovania výrobkov a dodávateľského reťazca',
      paragraphs: [
        'GPSR sa netýka iba toho, čo je zobrazené na stránke produktu. E-shopy by mali mať nastavený aj systém vnútornej evidencie výrobkov a dodávateľov.',
        'Prevádzkovateľ e-shopu by mal vedieť spätne dohľadať, od koho výrobok nadobudol, kto je jeho výrobcom, kto je dovozcom alebo distribútorom a komu bol výrobok ďalej dodaný, ak je to relevantné.',
        'Takáto evidencia je dôležitá najmä v situáciách, keď sa dodatočne zistí bezpečnostné riziko výrobku.'
      ]
    },
    {
      heading: 'Interné postupy pri rizikových alebo nebezpečných výrobkoch',
      paragraphs: [
        'Každý e-shop by mal mať pripravený aj interný postup pre situácie, keď sa objaví podozrenie, že výrobok môže byť nebezpečný.',
        'Interný postup by mal riešiť najmä:',
        'ako sa evidujú podnety od zákazníkov týkajúce sa bezpečnosti výrobku,',
        'kto v e-shope posudzuje riziko výrobku,',
        'ako sa komunikuje s dodávateľom, výrobcom alebo dovozcom,',
        'kedy sa výrobok dočasne stiahne z ponuky,',
        'ako sa informujú zákazníci,',
        'ako sa dokumentujú prijaté opatrenia,',
        'ako sa postupuje pri stiahnutí výrobku z trhu alebo pri spätnom prevzatí výrobku od spotrebiteľov.'
      ]
    },
    {
      heading: 'Čo ak e-shop predáva cez marketplace?',
      paragraphs: [
        'GPSR sa významne dotýka aj online trhovísk a predaja cez platformy. Ak e-shop predáva svoje výrobky prostredníctvom marketplace platformy, mal by počítať s tým, že tieto platformy budú od predajcov vyžadovať doplnenie údajov podľa GPSR.',
        'To znamená, že predajca bude musieť mať pripravené údaje o výrobcovi, identifikácii výrobku, zodpovednej osobe v EÚ a bezpečnostných upozorneniach nielen na vlastnom e-shope, ale aj v administrácii marketplace platformy.',
        'Ak tieto údaje chýbajú, platforma môže výrobok zablokovať alebo predajcovi obmedziť možnosť jeho predaja.'
      ]
    },
    {
      heading: 'Najčastejšie chyby e-shopov pri GPSR',
      paragraphs: [
        'Pri zavádzaní GPSR do praxe sa môžu objaviť najmä tieto chyby:',
        'e-shop pri produktoch neuvádza žiadne údaje o výrobcovi,',
        'výrobky nemajú jednoznačný identifikátor,',
        'pri produktoch od výrobcov mimo EÚ chýba zodpovedná osoba v EÚ,',
        'bezpečnostné upozornenia sú iba na obale, ale nie v online ponuke,',
        'upozornenia nie sú dostupné v slovenskom jazyku,',
        'údaje sú skryté v obchodných podmienkach namiesto detailu produktu,',
        'e-shop nemá evidenciu dodávateľov a produktových šarží,',
        'e-shop nemá interný postup pri nebezpečnom výrobku,',
        'rovnaký všeobecný text je vložený ku každému produktu bez reálneho posúdenia,',
        'prevádzkovateľ e-shopu nevie preukázať, odkiaľ výrobok pochádza.'
      ]
    },
    {
      heading: 'Čo by mal e-shop urobiť?',
      paragraphs: [
        'Prevádzkovateľ e-shopu by si mal najskôr prejsť celý sortiment a zistiť, aké údaje má k jednotlivým výrobkom k dispozícii. Následne by mal doplniť produktové karty, upraviť interné evidencie a nastaviť proces riešenia rizikových výrobkov.',
        'Odporúčaný praktický postup:',
        'skontrolovať všetky kategórie výrobkov,',
        'doplniť pri produktoch identifikačné údaje,',
        'doplniť údaje o výrobcovi,',
        'pri výrobcoch mimo EÚ doplniť zodpovednú osobu v EÚ,',
        'doplniť bezpečnostné upozornenia a pokyny,',
        'zabezpečiť slovenský jazyk pri bezpečnostných informáciách,',
        'nastaviť evidenciu dodávateľov a výrobkov,',
        'pripraviť interný postup pri nebezpečnom výrobku,',
        'zosúladiť údaje na e-shope a marketplace platformách,',
        'pravidelne aktualizovať informácie podľa podkladov od dodávateľov.'
      ]
    },
    {
      heading: 'GPSR nie je iba administratívna povinnosť',
      paragraphs: [
        'Na prvý pohľad môže GPSR pôsobiť ako ďalšia administratívna záťaž pre e-shopy. V skutočnosti však ide o pravidlá, ktoré majú zvýšiť bezpečnosť výrobkov a posilniť dôveru spotrebiteľov pri online nákupe.',
        'Ak má spotrebiteľ už pri produkte jasne uvedené, kto je výrobcom, aké sú bezpečnostné upozornenia a kto je kontaktným subjektom v EÚ, zvyšuje sa transparentnosť predaja a znižuje sa riziko problémov pri nebezpečných alebo nejasne označených výrobkoch.',
        'Pre e-shopy je preto vhodné riešiť GPSR systematicky. Nestačí doplniť jednu všeobecnú vetu do obchodných podmienok. Potrebné je pracovať s konkrétnymi údajmi pri konkrétnych produktoch a zároveň mať nastavené interné procesy pre prípad, že sa pri výrobku objaví bezpečnostné riziko.'
      ]
    }
  ],
  conclusion: 'Nariadenie GPSR prinieslo od 13.12.2024 nové povinnosti pre e-shopy, ktoré predávajú spotrebiteľské výrobky v Európskej únii. Keďže ide o nariadenie EÚ, pravidlá sa uplatňujú priamo a sú záväzné pre hospodárske subjekty v členských štátoch.\n\nE-shopy by mali venovať pozornosť najmä produktovým kartám, údajom o výrobcovi, identifikácii výrobkov, bezpečnostným upozorneniam, zodpovednej osobe v EÚ a internej evidencii výrobkov. Správne nastavenie GPSR nie je iba otázkou právnej dokumentácie, ale aj otázkou technického a obsahového nastavenia e-shopu.\n\nAk e-shop tieto povinnosti ešte nezapracoval, mal by čo najskôr skontrolovať svoj sortiment, doplniť chýbajúce údaje a nastaviť interné postupy tak, aby bol pripravený na požiadavky novej európskej úpravy bezpečnosti výrobkov.'
} as const;

const fourthArticle = {
  ...featuredArticle,
  slug: 'novela-zakona-108-2024-z-z',
  title: 'Od 19. júna 2026 pribudnú pre e-shopy ďalšie nové povinnosti. Čo znamená novela spotrebiteľského zákona v praxi?',
  date: '29. 4. 2026',
  readTime: '10 minút',
  author: 'Mgr. Ivan Javorčík',
  excerpt: 'Od 19. júna 2026 nadobúda účinnosť novela zákona 108/2024 Z. z., zmeny sa dotknú všetkých e-shopov. Prichádzajú nové informačné povinnosti, nutná úprava Obchodných podmienok a Poučenia podľa prílohy č. 3 predmetného zákona či nutná úprava rozhrania e-shopu.',
  intro: 'E-shopy čakajú ďalšie zmeny v spotrebiteľskej legislatíve; **nestačí upraviť len obchodné podmienky**.\n\nČo sa mení od roku 2026 a čo musia internetové obchody skontrolovať?\n\nInternetové obchody si v roku 2024 prešli veľkou zmenou spotrebiteľskej legislatívy. Od 1. júla 2024 nadobudol účinnosť zákon č. 108/2024 Z. z. o ochrane spotrebiteľa, ktorý nahradil dovtedajší zákon o ochrane spotrebiteľa aj osobitnú úpravu zmlúv uzatváraných na diaľku. Mnohé e-shopy si preto v roku 2024 aktualizovali svoje obchodné podmienky, reklamačný poriadok, poučenia a formuláre.\n\nTým sa však povinnosti e-shopov nekončia. Zákon č. 108/2024 Z. z. bol následne novelizovaný a v roku 2026 nadobúdajú účinnosť ďalšie zmeny, ktoré sa dotknú nielen znenia obchodných podmienok, ale aj samotného rozhrania internetového obchodu.',
  lawCitation: [] as string[],
  sections: [
    {
      heading: 'Najdôležitejšie zmeny',
      paragraphs: [
        'Najdôležitejšie zmeny sa týkajú najmä:',
        'online funkcie na odstúpenie od zmluvy,',
        'nových informačných povinností pred uzavretím objednávky,',
        'harmonizovaného oznámenia o zákonnej záruke súladu,',
        'harmonizovaného označenia obchodnej záruky životnosti,',
        'informácií o opraviteľnosti tovaru, náhradných dieloch a aktualizáciách,',
        'environmentálnych tvrdení a recenzií,',
        'a technického nastavenia objednávkového procesu.',
        'Tieto zmeny sú dôležité najmä preto, že niektoré z nich sa nedajú splniť iba tým, že sa upravia všeobecné obchodné podmienky. V mnohých prípadoch bude potrebné upraviť aj samotný e-shop.'
      ]
    },
    {
      heading: '1. Nová online funkcia na odstúpenie od zmluvy',
      paragraphs: [
        'Jednou z najpraktickejších zmien je zavedenie novej povinnosti obchodníka umožniť spotrebiteľovi odstúpiť od zmluvy uzavretej na diaľku prostredníctvom online rozhrania aj cez osobitnú online funkciu.',
        'Inými slovami: ak spotrebiteľ nakúpil cez e-shop, musí mať možnosť uplatniť odstúpenie od zmluvy aj priamo cez e-shop.',
        'Zákon vyžaduje, aby táto funkcia bola označená ľahko čitateľným spôsobom, napríklad slovným spojením „odstúpiť od zmluvy tu“ alebo obdobnou formuláciou, z ktorej bude jasné, že jej použitím môže spotrebiteľ odstúpiť od zmluvy. Funkcia musí byť v online rozhraní zreteľne zobrazená a musí byť pre spotrebiteľa ľahko a nepretržite dostupná počas plynutia lehoty na odstúpenie od zmluvy.',
        'Online funkcia musí umožniť spotrebiteľovi poskytnúť alebo potvrdiť najmä:',
        'meno a priezvisko spotrebiteľa,',
        'identifikačné údaje zmluvy alebo objednávky,',
        'e-mail alebo iný online komunikačný údaj, na ktorý obchodník zašle potvrdenie o doručení odstúpenia.',
        'Po vyplnení oznámenia musí mať spotrebiteľ možnosť potvrdiť jeho odoslanie cez samostatnú funkciu označenú napríklad „potvrdiť odstúpenie od zmluvy“.',
        'Po potvrdení odstúpenia musí obchodník bezodkladne poskytnúť spotrebiteľovi potvrdenie o doručení oznámenia o odstúpení od zmluvy na trvanlivom médiu, najčastejšie e-mailom. Potvrdenie musí obsahovať samotné oznámenie o odstúpení a dátum a čas jeho odoslania.',
        'Čo to znamená pre e-shop?',
        'Nestačí mať vo VOP uvedený e-mail na odstúpenie od zmluvy. E-shop bude musieť technicky zabezpečiť aj online funkciu na odstúpenie.',
        'Prakticky to môže byť napríklad:',
        'samostatná podstránka „Odstúpenie od zmluvy“,',
        'formulár v zákazníckom účte,',
        'online formulár dostupný cez pätičku webu alebo zákaznícku zónu,',
        'alebo iné riešenie, ktoré bude spĺňať požiadavky zákona.',
        'Dôležité je, aby išlo o funkciu dostupnú počas lehoty na odstúpenie a aby po jej použití spotrebiteľ dostal potvrdenie na trvanlivom médiu.'
      ]
    },
    {
      heading: '2. Zmeny v obchodných podmienkach nestačia, treba upraviť aj rozhranie e-shopu',
      paragraphs: [
        'Novela mení aj to, ako má byť spotrebiteľ informovaný ešte pred odoslaním objednávky.',
        'Zákon už dnes vyžaduje, aby spotrebiteľ dostal pred uzavretím zmluvy jasné a zrozumiteľné informácie o obchodníkovi, cene, dodaní, platbe, zodpovednosti za vady, odstúpení od zmluvy a ďalších podstatných údajoch. Nové znenie však tieto informačné povinnosti rozširuje.',
        'Z pohľadu e-shopu je dôležité najmä to, že nie všetky informácie stačí uviesť iba vo VOP. Niektoré informácie majú byť zobrazené priamo pri produkte, v košíku alebo pred odoslaním objednávky.',
        'Typickým príkladom je:',
        'informácia o zákonnej zodpovednosti za vady,',
        'harmonizované oznámenie o zákonnej záruke súladu,',
        'prípadná obchodná záruka životnosti,',
        'opraviteľnosť tovaru,',
        'dostupnosť náhradných dielov,',
        'aktualizácie pri digitálnych produktoch alebo veciach s digitálnymi prvkami.'
      ]
    },
    {
      heading: '3. Harmonizované oznámenie o zákonnej záruke súladu',
      paragraphs: [
        'Nová úprava zavádza povinnosť informovať spotrebiteľa o existencii a hlavných informáciách o zákonnej zodpovednosti obchodníka za vady tovaru vrátane dĺžky jej trvania, a to zreteľným spôsobom aspoň v podobe a rozsahu podľa osobitného predpisu upravujúceho harmonizované oznámenie.',
        'Týmto osobitným predpisom je Vykonávacie nariadenie Komisie (EÚ) 2025/1960 z 25. septembra 2025 o dizajne a obsahu harmonizovaného oznámenia o zákonnej záruke súladu a harmonizovaného označenia obchodnej záruky životnosti.',
        'Musí to mať každý e-shop?',
        'Áno, ak e-shop predáva tovar spotrebiteľom, musí počítať s tým, že harmonizované oznámenie o zákonnej záruke súladu bude potrebné spotrebiteľovi zobraziť pred uzavretím zmluvy.',
        'Nejde iba o text vo VOP. V praxi bude vhodné, aby e-shop zobrazil oznámenie napríklad:',
        'pri produkte,',
        'v košíku,',
        'v poslednom kroku objednávky,',
        'alebo cez jasne viditeľný odkaz či informačný blok v nákupnom procese.'
      ]
    },
    {
      heading: '4. Harmonizované označenie obchodnej záruky životnosti',
      paragraphs: [
        'Druhou novinkou je harmonizované označenie obchodnej záruky životnosti.',
        'Toto sa však netýka každého produktu. Použije sa len vtedy, ak sú splnené určité podmienky.',
        'Obchodník musí spotrebiteľa informovať o existencii a dĺžke trvania spotrebiteľskej záruky na životnosť tovaru vtedy, ak ju výrobca alebo dovozca:',
        'poskytuje bezplatne,',
        'poskytuje na celý tovar,',
        'poskytuje na dobu dlhšiu ako dva roky,',
        'a tieto informácie sprístupnil obchodníkovi.'
      ]
    },
    {
      heading: '5. Opraviteľnosť tovaru, náhradné diely a údržba',
      paragraphs: [
        'Nové znenie zákona rozširuje informačné povinnosti aj o opraviteľnosť tovaru.',
        'Obchodník má pred uzavretím zmluvy informovať spotrebiteľa o bodovom hodnotení opraviteľnosti tovaru, ak sa na daný tovar takéto hodnotenie vzťahuje. Ak bodové hodnotenie opraviteľnosti nie je poskytnuté, zákon počíta s informáciami o dostupnosti, predpokladaných nákladoch a postupe objednania náhradných dielov, pokynoch potrebných na opravu a údržbu tovaru a o obmedzeniach opravy, ak tieto informácie výrobca alebo dovozca sprístupnil obchodníkovi.',
        'E-shop by preto mal skontrolovať, či mu výrobcovia alebo dovozcovia poskytujú údaje o:',
        'opraviteľnosti,',
        'náhradných dieloch,',
        'údržbe,',
        'návodoch,',
        'obmedzeniach opravy.'
      ]
    },
    {
      heading: '6. Aktualizácie pri digitálnych produktoch a veciach s digitálnymi prvkami',
      paragraphs: [
        'Nové informačné povinnosti sa dotýkajú aj vecí s digitálnymi prvkami, digitálneho obsahu a digitálnych služieb.',
        'Ak e-shop predáva tovar s digitálnymi prvkami alebo digitálne plnenia, môže byť potrebné informovať spotrebiteľa o:',
        'funkčnosti,',
        'kompatibilite,',
        'interoperabilite,',
        'dostupných technických ochranných opatreniach,',
        'a minimálnej dobe poskytovania bezplatných aktualizácií vrátane bezpečnostných aktualizácií.'
      ]
    },
    {
      heading: '7. Recenzie a hodnotenia produktov',
      paragraphs: [
        'Povinnosti týkajúce sa recenzií a hodnotení produktov nie sú novinkou pripravovanou až na rok 2026. Tieto pravidlá priniesol už zákon č. 108/2024 Z. z. o ochrane spotrebiteľa, ktorý je účinný od 1. júla 2024.',
        'Ak obchodník poskytuje spotrebiteľom prístup k hodnoteniam produktov, musí spotrebiteľa informovať, či a akým spôsobom zabezpečuje, že hodnotenia pochádzajú od spotrebiteľov, ktorí produkt skutočne kúpili alebo použili.',
        'Aj túto povinnosť v článku pripomíname preto, že mnohé e-shopy ju síce formálne poznajú už od roku 2024, ale v praxi ju stále nemajú správne zapracovanú. Nesprávne alebo nepreukázateľné tvrdenia o recenziách môžu byť problémom najmä pri kontrole alebo pri posudzovaní nekalých obchodných praktík.'
      ]
    },
    {
      heading: '8. Environmentálne tvrdenia a greenwashing',
      paragraphs: [
        'Novela dopĺňa nové pojmy a pravidlá týkajúce sa environmentálnych tvrdení, značiek udržateľnosti a certifikačných systémov.',
        'E-shop by preto mal byť opatrný pri používaní výrazov ako:',
        'eko,',
        'ekologický,',
        'udržateľný,',
        'šetrný k prírode,',
        'recyklovateľný,',
        'klimaticky neutrálny,',
        'zelený produkt,',
        'zodpovedná výroba.'
      ]
    },
    {
      heading: '9. Objednávkové tlačidlo a informácie pred odoslaním objednávky',
      paragraphs: [
        'E-shopy musia venovať pozornosť aj samotnému checkoutu, teda poslednému kroku objednávky.',
        'Povinnosť správne označiť objednávkové tlačidlo pritom nie je novinkou. Túto požiadavku poznali e-shopy už podľa predchádzajúcej právnej úpravy, najmä podľa zákona č. 102/2014 Z. z. o zmluvách uzatváraných na diaľku. Nový zákon č. 108/2024 Z. z. na túto požiadavku nadväzuje a nič sa nemení na tom, že spotrebiteľ musí pred odoslaním objednávky jasne vedieť, že odoslaním objednávky mu vzniká povinnosť zaplatiť cenu.',
        'Ak spotrebiteľ odosiela objednávku cez online rozhranie, tlačidlo alebo funkcia na odoslanie objednávky musí byť označená jednoznačnou formuláciou, z ktorej vyplýva povinnosť zaplatiť. Typickou a bezpečnou formuláciou je:',
        '„objednávka s povinnosťou platby“',
        'Prípustná môže byť aj iná obdobná formulácia, ak jednoznačne vyjadruje, že spotrebiteľ sa odoslaním objednávky zaväzuje zaplatiť cenu. Naopak, všeobecné označenia ako „objednať“, „odoslať“, „pokračovať“ alebo „potvrdiť“ môžu byť problémové, ak z nich nie je jasné, že ide o objednávku spojenú s povinnosťou platby.',
        'Túto povinnosť v článku spomíname preto, že v praxi ju stále veľa e-shopov nemá správne nastavenú. Ide pritom o jednoduchú technickú úpravu, ktorej nesplnenie môže viesť k zbytočným problémom pri kontrole zo strany Slovenskej obchodnej inšpekcie.',
        'Okrem samotného označenia tlačidla je dôležité aj to, aby spotrebiteľ pred odoslaním objednávky jasne videl najmä hlavné vlastnosti objednávaného tovaru, konečnú cenu vrátane daní, dopravy a poplatkov, zvolený spôsob platby a dodania a ďalšie podstatné informácie potrebné na informované rozhodnutie.'
      ]
    },
    {
      heading: '10. Čo treba upraviť vo VOP',
      paragraphs: [
        'V obchodných podmienkach bude potrebné skontrolovať najmä predzmluvné informácie, článok o odstúpení od zmluvy, reklamačný poriadok a poučenia/formuláre.',
        'Odporúčame doplniť najmä:',
        'harmonizované oznámenie o zákonnej záruke súladu,',
        'obchodnú záruku životnosti,',
        'opraviteľnosť tovaru, náhradné diely, údržbu a aktualizácie,',
        'online funkciu na odstúpenie od zmluvy.'
      ]
    },
    {
      heading: '11. Čo treba upraviť priamo v e-shope',
      paragraphs: [
        'Niektoré povinnosti sa nedajú splniť len textom vo VOP.',
        'E-shop musí technicky vyriešiť najmä:',
        'online funkciu na odstúpenie od zmluvy,',
        'potvrdzovacie tlačidlo na odoslanie odstúpenia,',
        'automatické potvrdenie doručenia odstúpenia e-mailom alebo iným trvanlivým médiom,',
        'harmonizované oznámenie o zákonnej záruke súladu,',
        'harmonizované označenie obchodnej záruky životnosti pri vybraných produktoch,',
        'zobrazenie informácií o opraviteľnosti, náhradných dieloch a údržbe, ak sú relevantné.'
      ]
    },
    {
      heading: '12. Hrozia sankcie?',
      paragraphs: [
        'Áno. Zákon č. 108/2024 Z. z. obsahuje sankčné ustanovenia a porušenie povinností obchodníka môže byť predmetom kontroly zo strany Slovenskej obchodnej inšpekcie alebo iného príslušného orgánu dohľadu.',
        'Riziko však nie je len v pokute. Nesprávne alebo neúplné obchodné podmienky môžu spôsobiť aj to, že niektoré ustanovenia budú voči spotrebiteľovi neúčinné.'
      ]
    },
    {
      heading: '13. Praktický kontrolný zoznam pre e-shop',
      paragraphs: [
        'E-shop by si mal položiť najmä tieto otázky:',
        'Máme obchodné podmienky aktualizované podľa zákona č. 108/2024 Z. z.?,',
        'Zohľadňujú obchodné podmienky novelu účinnú v roku 2026?,',
        'Máme online funkciu „odstúpiť od zmluvy tu“?,',
        'Máme potvrdzovaciu funkciu „potvrdiť odstúpenie od zmluvy“?,',
        'Posielame potvrdenie o doručení odstúpenia na trvanlivom médiu?,',
        'Zobrazujeme harmonizované oznámenie o zákonnej záruke súladu?'
      ]
    }
  ],
  conclusion: ''
} as const;

const articlesBySlug = {
  [featuredArticle.slug]: featuredArticle,
  [secondArticle.slug]: secondArticle,
  [thirdArticle.slug]: thirdArticle,
  [fourthArticle.slug]: fourthArticle
} as const;

export const BlogPage: React.FC<{
  initialArticleSlug?: string;
  onBack: () => void;
  onNavigate: (view: string, path: string, params?: { blogSlug?: string }) => void;
  onAuth: () => void;
  onRegister: () => void;
}> = ({ initialArticleSlug, onBack, onNavigate, onAuth, onRegister }) => {
  const isKnownArticleSlug = (slug?: string | null): slug is keyof typeof articlesBySlug =>
    !!slug && Object.prototype.hasOwnProperty.call(articlesBySlug, slug);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeArticle, setActiveArticle] = useState<string | null>(
    isKnownArticleSlug(initialArticleSlug) ? initialArticleSlug : null
  );
  const [postsOffset, setPostsOffset] = useState(0);
  const [slideDirection, setSlideDirection] = useState<'next' | 'prev'>('next');
  const particlesInitRef = useRef(false);
  const activeArticleData = activeArticle ? articlesBySlug[activeArticle as keyof typeof articlesBySlug] : null;
  const relatedPosts = posts.filter((post) => post.slug && post.slug !== activeArticle).slice(0, 4);
  const visibleCards = 2;
  const maxPostsOffset = Math.max(0, (Math.ceil(posts.length / visibleCards) - 1) * visibleCards);
  const visiblePosts = posts.slice(postsOffset, postsOffset + visibleCards);

  const openArticle = (slug?: string) => {
    if (!isKnownArticleSlug(slug)) return;
    setActiveArticle(slug);
    onNavigate('blog', `/blog/${slug}`, { blogSlug: slug });
  };

  const handlePrevPosts = () => {
    setPostsOffset((prev) => {
      if (prev === 0) return prev;
      setSlideDirection('prev');
      return Math.max(0, prev - visibleCards);
    });
  };

  const handleNextPosts = () => {
    setPostsOffset((prev) => {
      if (prev >= maxPostsOffset) return prev;
      setSlideDirection('next');
      return Math.min(maxPostsOffset, prev + visibleCards);
    });
  };

  const renderHighlightedText = (text: string) => {
    const boldPattern = /\*\*(.*?)\*\*/g;
    const normalized = text.replace(boldPattern, (_match, group) => `<b>${group}</b>`);
    const matches = normalized.match(/„odstúpiť od zmluvy tu“|„potvrdiť odstúpenie od zmluvy“|<b>.*?<\/b>/g);
    if (!matches) return text;
    const parts = normalized.split(/(„odstúpiť od zmluvy tu“|„potvrdiť odstúpenie od zmluvy“|<b>.*?<\/b>)/g);
    return parts.map((part, idx) => (
      part === '„odstúpiť od zmluvy tu“' || part === '„potvrdiť odstúpenie od zmluvy“'
        ? <strong key={`hl-${idx}`} className="font-bold text-[#002b4e]">{part}</strong>
        : part.startsWith('<b>') && part.endsWith('</b>')
          ? <strong key={`md-${idx}`} className="font-bold">{part.replace(/^<b>|<\/b>$/g, '')}</strong>
          : <React.Fragment key={`tx-${idx}`}>{part}</React.Fragment>
    ));
  };

  const renderIntroText = (text: string) => (
    <div className="space-y-4 text-[15px] md:text-[16px] leading-8 text-slate-700">
      {text.split(/\n{2,}/).map((paragraph) => (
        <p key={paragraph}>{renderHighlightedText(paragraph)}</p>
      ))}
    </div>
  );

  const isBulletLine = (text: string, index?: number, lines?: string[]) => {
    const line = text.trim();
    const prevLine = typeof index === 'number' && lines && index > 0 ? lines[index - 1]?.trim() : '';
    const isContextBulletTail =
      !!prevLine &&
      (prevLine.endsWith(',') || /^(a\)|b\)|c\))/.test(prevLine)) &&
      (line.endsWith('.') || line.endsWith('?'));

    return (
      line.endsWith(',') ||
      isContextBulletTail ||
      line === 'informácie o alternatívnom riešení spotrebiteľských sporov.' ||
      line === 'či reklamačný proces zodpovedá ustanoveniam z OZ.' ||
      line === 'či existujú pravidlá pre nezverejnenie recenzie.' ||
      line === 'odkazy na právne predpisy.' ||
      line === 'či dokumentácia zodpovedá reálnemu fungovaniu e-shopu.' ||
      line === 'elektronickú adresu, napríklad e-mail alebo iný elektronický kontakt.' ||
      line === 'elektronickú adresu.' ||
      line === 'ako sa postupuje pri stiahnutí výrobku z trhu alebo pri spätnom prevzatí výrobku od spotrebiteľov.' ||
      line === 'prevádzkovateľ e-shopu nevie preukázať, odkiaľ výrobok pochádza.' ||
      line === 'pravidelne aktualizovať informácie podľa podkladov od dodávateľov.' ||
      /^(a\)|b\)|c\))/.test(line)
    );
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = activeArticleData ? `${activeArticleData.title} | Blog | LORD'S BENISON` : "Blog | LORD'S BENISON";

    const setMeta = (name: string, content: string) => {
      let tag = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute("name", name);
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", content);
    };

    setMeta(
      "description",
      activeArticleData
        ? activeArticleData.excerpt
        : "Blog LORD'S BENISON prináša články o GDPR, VOP podľa zákona č. 108/2024 Z. z., AML a školeniach zamestnancov."
    );

    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);

    if (!particlesInitRef.current && (window as any).tsParticles) {
      const headerConfig = {
        fullScreen: { enable: false },
        fpsLimit: 60,
        interactivity: {
          events: { onHover: { enable: true, mode: "repulse" }, resize: true },
          modes: { repulse: { distance: 100, duration: 0.4 } }
        },
        particles: {
          color: { value: ["#ffffff", "#F7941D"] },
          links: { color: "#ffffff", distance: 120, enable: true, opacity: 0.15, width: 1 },
          move: { enable: true, speed: 0.8, direction: "none", outModes: { default: "bounce" } },
          number: { density: { enable: true, area: 800 }, value: 150 },
          opacity: { value: 0.5 },
          shape: { type: "circle" },
          size: { value: { min: 1, max: 2.5 } }
        },
        detectRetina: true
      };
      (window as any).tsParticles.load("blog-header-particles", headerConfig);
      particlesInitRef.current = true;
    }

    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeArticle, activeArticleData]);

  useEffect(() => {
    if (isKnownArticleSlug(initialArticleSlug)) {
      setActiveArticle(initialArticleSlug);
      return;
    }
    setActiveArticle(null);
  }, [initialArticleSlug]);

  const navLinks: NavItem[] = COMMON_NAV_LINKS.WITH_HREF(onNavigate, onRegister, 'blog') as NavItem[];

  return (
    <div className="min-h-screen bg-slate-50 font-sans overflow-x-hidden selection:bg-brand-orange/30">
      <div className={`fixed inset-x-0 z-[2000] flex justify-center transition-all duration-700 ${scrolled ? 'lg:top-4 lg:px-6 top-0 px-0' : 'top-0 px-0'}`}>
        <nav
          className={`w-full transition-all duration-700 relative overflow-visible ${
            scrolled
              ? 'lg:bg-white/95 lg:backdrop-blur-md lg:max-w-[95%] lg:h-16 lg:rounded-full lg:shadow-[0_20px_50px_rgba(0,0,0,0.12)] lg:border lg:border-slate-100 bg-[#002b4e] lg:h-24 h-16 border-b border-white/5'
              : 'w-full lg:h-24 h-16 border-b border-white/5 bg-[#002b4e]'
          }`}
        >
          <div id="blog-header-particles" className={`absolute inset-0 z-0 pointer-events-none transition-all duration-700 ${scrolled ? 'opacity-0 invisible' : 'opacity-100 visible'}`}></div>

          <div className={`mx-auto h-full flex items-center justify-between px-10 relative z-10 transition-all duration-700 ${scrolled ? 'max-w-full' : 'max-w-7xl'}`}>
            <div className="flex items-center group cursor-pointer" onClick={onBack}>
              <div className="flex items-center justify-center transition-all duration-500 overflow-hidden">
                <img src={scrolled ? LOGO_BLUE : LOGO_WHITE} alt="Lord's Benison" className={`w-auto object-contain transition-all duration-500 hidden lg:block ${scrolled ? 'h-10' : 'h-14'}`} />
                <img
                  src={LOGO_MOBIL}
                  alt="Lord's Benison"
                  style={{ border: 'none', outline: 'none', boxShadow: 'none', borderRadius: '0', padding: '0', margin: '0' }}
                  className="w-auto object-contain transition-all duration-300 lg:hidden h-14"
                />
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map(link => (
                <div key={link.name} className="relative group/parent">
                  {link.type === 'dropdown' ? (
                    <button className={`${NAV_CSS_CLASSES.DESKTOP_BUTTON} ${scrolled ? 'text-brand-navy hover:text-brand-orange' : 'text-white/90 hover:text-brand-orange'}`} style={{ fontFamily: NAV_FONT_FAMILY }}>
                      {link.name} <ChevronDown size={14} className="group-hover/parent:rotate-180 transition-transform" />
                    </button>
                  ) : (
                    <a
                      href={link.href}
                      onClick={(e) => { if (link.action) { e.preventDefault(); link.action(); } }}
                      className={`${NAV_CSS_CLASSES.DESKTOP_LINK} ${link.active ? 'text-brand-orange' : (scrolled ? 'text-brand-navy hover:text-brand-orange' : 'text-white/90 hover:text-white')}`}
                      style={{ fontFamily: NAV_FONT_FAMILY }}
                    >
                      {link.name === 'Platforma Complyo' ? (
                        <>
                          <span style={{ textTransform: 'none' }}>PLATFORMA</span>&nbsp;<span className="text-brand-orange italic text-base" style={{ textTransform: 'none' }}>Complyo</span>
                        </>
                      ) : (
                        link.name
                      )}
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-orange transition-all duration-300 group-hover/nav:w-full"></span>
                    </a>
                  )}

                  {link.type === 'dropdown' && (
                    <div className="absolute top-full left-0 pt-4 opacity-0 translate-y-2 pointer-events-none group-hover/parent:opacity-100 group-hover/parent:translate-y-0 group-hover/parent:pointer-events-auto transition-all duration-300 z-[2001]">
                      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 p-4 min-w-[240px] flex flex-col gap-1 overflow-hidden">
                        {link.items?.map(item => (
                          <a
                            key={item.name}
                            href={item.href || '#'}
                            onClick={(e) => { if (item.action) { e.preventDefault(); item.action(); } }}
                            className={NAV_CSS_CLASSES.DROPDOWN_ITEM}
                            style={{ fontFamily: NAV_FONT_FAMILY }}
                          >
                            {item.name}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <button onClick={onAuth} className={NAV_CSS_CLASSES.DESKTOP_AUTH_BUTTON} style={{ fontFamily: NAV_FONT_FAMILY }}>
                <LogIn size={14} /> {AUTH_BUTTON_TEXT}
              </button>
            </div>

            <button className="lg:hidden p-2 transition-colors text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </nav>
      </div>

      <div className={`lg:hidden fixed inset-0 z-[1999] transition-all duration-500 ${mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-[#002b4e] via-[#003d6d] to-[#002b4e]">
          <div className="flex flex-col h-full p-6 pt-24 gap-8 overflow-y-auto">
            <div className="space-y-2">
              {navLinks.map(link => (
                <div key={link.name}>
                  {link.type === 'dropdown' ? (
                    <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-base font-bold text-brand-orange">{link.name}</span>
                        <ChevronDown size={20} className="text-white/60" />
                      </div>
                      <div className="space-y-3">
                        {link.items?.map(item => (
                          <a
                            key={item.name}
                            href={item.href || '#'}
                            onClick={(e) => {
                              if (item.action) { e.preventDefault(); item.action(); }
                              setMobileMenuOpen(false);
                            }}
                            className="block w-full text-left px-3 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all cursor-pointer text-sm"
                          >
                            {item.name}
                          </a>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <a
                      href={link.href || '#'}
                      onClick={(e) => {
                        if (link.action) { e.preventDefault(); link.action(); }
                        setMobileMenuOpen(false);
                      }}
                      className="block w-full text-left bg-white/5 backdrop-blur-md rounded-2xl px-5 py-3 text-base font-semibold text-white/90 hover:text-white hover:bg-white/10 border border-white/10 transition-all cursor-pointer"
                      style={{ fontFamily: NAV_FONT_FAMILY }}
                    >
                      {link.name === 'Platforma Complyo' ? (
                        <>
                          Platforma&nbsp;<span className="text-brand-orange italic text-base">Complyo</span>
                        </>
                      ) : (
                        link.name
                      )}
                    </a>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-auto pt-8">
              <button
                onClick={() => { onAuth(); setMobileMenuOpen(false); }}
                className="w-full bg-gradient-to-r from-brand-orange to-orange-600 text-white py-4 rounded-2xl font-bold uppercase text-sm tracking-widest shadow-2xl flex items-center justify-center gap-3 hover:from-orange-600 hover:to-brand-orange transition-all"
              >
                <LogIn size={20} /> {AUTH_BUTTON_TEXT}
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="relative bg-slate-50">
        {activeArticleData ? (
          <section className="relative overflow-hidden min-h-[calc(100vh-6rem)] pt-24 lg:pt-28 bg-[linear-gradient(180deg,#f3f6fb_0%,#eef3f9_38%,#f7f9fc_100%)] text-slate-900">
            <div className="pointer-events-none absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(circle at 15% 8%, rgba(247,148,29,0.14) 0%, rgba(247,148,29,0) 36%), radial-gradient(circle at 86% 18%, rgba(0,43,78,0.10) 0%, rgba(0,43,78,0) 42%)' }}></div>

            <div className="max-w-[1240px] mx-auto px-5 sm:px-6 lg:px-10 py-14 md:py-20 relative z-10">
              <article className="rounded-[2rem] border border-slate-200/80 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.08)] overflow-hidden">
                <header className="px-6 md:px-12 pt-10 md:pt-14 pb-8 border-b border-slate-100 text-center">
                  <p className="text-[11px] md:text-xs uppercase tracking-[0.18em] text-brand-orange font-semibold">Blog / Článok</p>
                  <h1 className="mt-4 max-w-5xl mx-auto whitespace-pre-line text-[26px] md:text-[38px] font-black text-[#002b4e] leading-[1.12] tracking-tight">
                    {activeArticleData.title}
                  </h1>

                  <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                    <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
                      <Calendar size={14} />
                      Dátum pridania: {activeArticleData.date}
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
                      <Clock size={14} />
                      Čas čítania: {activeArticleData.readTime}
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
                      <User size={14} />
                      Autor: {activeArticleData.author}
                    </span>
                  </div>

                  <p className="mt-8 max-w-4xl mx-auto text-[16px] md:text-[18px] leading-8 text-slate-600">
                    {activeArticleData.excerpt}
                  </p>
                </header>

                <div className="px-6 md:px-12 py-8 md:py-10">
                  <div className="max-w-4xl mx-auto rounded-[1.5rem] bg-slate-50 border border-slate-100 px-5 md:px-7 py-6">
                    {renderIntroText(activeArticleData.intro)}
                  </div>

                  {activeArticleData.lawCitation.length > 0 && (
                    <div className="mt-8 max-w-4xl mx-auto rounded-[1.5rem] border border-[#002b4e]/20 bg-[#f9fbff] px-5 md:px-7 py-6 md:py-7 shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
                      <div className="inline-flex items-center rounded-full border border-[#002b4e]/20 bg-white px-4 py-1.5 shadow-sm">
                        <p className="text-[12px] md:text-[13px] tracking-[0.08em] text-[#002b4e] font-extrabold uppercase">Znenie nového § 20a</p>
                      </div>
                      <div className="mt-4 space-y-4 text-[15px] md:text-[16px] leading-8 text-slate-800 italic">
                        {activeArticleData.lawCitation.map((item, idx) => (
                          <p key={`${idx}-${item.slice(0, 16)}`}>{renderHighlightedText(item)}</p>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-10 max-w-4xl mx-auto space-y-9">
                    {activeArticleData.sections.map((section) => (
                      <section key={section.heading}>
                        <h2 className="text-[24px] md:text-[30px] font-black tracking-tight text-[#002b4e] leading-tight">
                          {section.heading}
                        </h2>
                        <div className="mt-4 space-y-4 text-[15px] md:text-[16px] text-slate-700">
                          {section.paragraphs.map((paragraph, paragraphIndex, paragraphLines) => (
                            isBulletLine(paragraph, paragraphIndex, paragraphLines) ? (
                              <p key={paragraph} className="leading-6 flex items-start gap-3">
                                <span className="text-brand-orange mt-[2px] leading-none">◆</span>
                                <span>{renderHighlightedText(paragraph.replace(/,\s*$/, ''))}</span>
                              </p>
                            ) : (
                              <p key={paragraph} className="leading-7">{renderHighlightedText(paragraph)}</p>
                            )
                          ))}
                        </div>
                      </section>
                    ))}
                  </div>

                  {activeArticleData.conclusion && (
                    <div className="mt-10 max-w-4xl mx-auto rounded-[1.5rem] border border-slate-200 bg-white px-6 md:px-8 py-7 md:py-8 shadow-[0_10px_28px_rgba(15,23,42,0.05)]">
                      <div className="inline-flex items-center rounded-full bg-[#002b4e] px-4 py-1.5 text-white">
                        <h2 className="text-[12px] md:text-[13px] font-extrabold tracking-[0.08em] uppercase">Záver</h2>
                      </div>
                      <p className="mt-5 leading-8 text-[15px] md:text-[16px] text-slate-700 whitespace-pre-line">
                        {activeArticleData.conclusion}
                      </p>
                    </div>
                  )}

                  <div className="mt-8 max-w-4xl mx-auto rounded-[1.5rem] border border-[#002b4e]/20 bg-[#f7fbff] px-6 md:px-8 py-7">
                    <h3 className="text-[20px] md:text-[24px] font-black tracking-tight text-[#002b4e]">Potrebujete pomoc s e-shop povinnosťami?</h3>
                    <p className="mt-3 text-[15px] md:text-[16px] leading-8 text-slate-700">
                      Vieme vám pomôcť s úpravou obchodných podmienok aj reklamačného poriadku podľa zákona č. 108/2024 Z. z.
                      Zároveň môžete využiť našu bezplatnú kontrolu povinností e-shopu v roku 2026.
                    </p>
                    <button
                      type="button"
                      onClick={() => onNavigate('contact', '/kontakt')}
                      className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#002b4e] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#003b6b] transition-colors"
                    >
                      Prejsť na kontaktný formulár
                      <ChevronRight size={14} />
                    </button>
                  </div>

                  {relatedPosts.length > 0 && (
                    <section className="mt-10 max-w-4xl mx-auto">
                      <div className="h-px w-full bg-gradient-to-r from-transparent via-[#002b4e]/30 to-transparent mb-6" />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {relatedPosts.map((post) => (
                          <button
                            key={`related-${post.slug}`}
                            type="button"
                            onClick={() => post.slug && openArticle(post.slug)}
                            className="group text-left rounded-[1.4rem] border border-slate-200/80 bg-white overflow-hidden shadow-[0_10px_28px_rgba(15,23,42,0.07)] hover:shadow-[0_16px_40px_rgba(15,23,42,0.12)] hover:-translate-y-0.5 transition-all"
                          >
                            <img
                              src={post.thumbnail}
                              alt={post.title}
                              className="w-full h-[129px] object-cover"
                            />
                            <div className="p-4 md:p-5">
                              <p className="text-[17px] font-black leading-tight text-[#002b4e] group-hover:text-brand-orange transition-colors">
                                {post.title}
                              </p>
                              <p
                                className="mt-2 text-[14px] leading-6 text-slate-600"
                                style={{
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden'
                                }}
                              >
                                {post.slug ? relatedPreviewBySlug[post.slug] : ''}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </section>
                  )}
                </div>
              </article>
            </div>
          </section>
        ) : (
          <section className="relative overflow-hidden min-h-[calc(100vh-6rem)] pt-24 lg:pt-28 bg-white text-slate-900">
            <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-10 py-14 md:py-20 relative z-10">
              <div className="mx-auto">
                <div className="mb-6 hidden lg:flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={handlePrevPosts}
                    disabled={postsOffset === 0}
                    className="h-11 w-11 inline-flex items-center justify-center rounded-full border border-[#002b4e]/30 bg-white text-[#002b4e] shadow-sm disabled:opacity-35 disabled:cursor-not-allowed hover:bg-[#002b4e] hover:text-white transition-colors"
                    aria-label="Posunúť články doľava"
                  >
                    <ChevronRight size={18} className="rotate-180" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextPosts}
                    disabled={postsOffset >= maxPostsOffset}
                    className="h-11 w-11 inline-flex items-center justify-center rounded-full border border-[#002b4e]/30 bg-white text-[#002b4e] shadow-sm disabled:opacity-35 disabled:cursor-not-allowed hover:bg-[#002b4e] hover:text-white transition-colors"
                    aria-label="Posunúť články doprava"
                  >
                    <ChevronRight size={18} />
                  </button>
                  <span className="text-sm font-semibold text-[#002b4e] ml-1">Posun na ďalší článok</span>
                </div>

                <div className="grid grid-cols-1 gap-8 items-stretch lg:hidden">
                  {posts.map((post) => (
                    <article
                      key={`mobile-${post.title}`}
                      className="group h-full flex flex-col bg-white border border-slate-100 rounded-[2rem] overflow-hidden shadow-[0_16px_40px_rgba(15,23,42,0.08)] hover:shadow-[0_22px_55px_rgba(15,23,42,0.14)] transition-all"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          if (post.kind === 'detail' && post.slug) openArticle(post.slug);
                        }}
                        className="overflow-hidden bg-slate-50 text-left"
                        aria-label={`Otvoriť článok: ${post.title}`}
                      >
                        <img
                          src={post.thumbnail}
                          alt="Nová povinnosť pre e-shopy od 19.06.2026"
                          className="w-full h-auto object-contain"
                        />
                      </button>
                      <div className="p-6 md:p-8">
                        <div className="text-[12px] md:text-[13px] uppercase tracking-[0.16em] text-slate-600 font-semibold flex items-center gap-2 mb-3">
                          <Clock size={12} />
                          {post.meta}
                        </div>
                        <h2 className="text-2xl font-black leading-tight tracking-tight text-[#002b4e]">
                          {post.title}
                        </h2>
                        <p className="mt-4 text-sm leading-relaxed text-slate-500">
                          {post.excerpt}
                        </p>
                        <button
                          type="button"
                          className="mt-6 inline-flex items-center gap-2 text-[#f7941d] hover:text-[#df7f06] font-semibold text-sm transition-colors"
                          onClick={() => {
                            if (post.kind === 'detail' && post.slug) openArticle(post.slug);
                          }}
                        >
                          Čítať článok
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    </article>
                  ))}
                </div>

                <div className="hidden lg:block overflow-visible">
                  <AnimatePresence initial={false} mode="wait">
                    <motion.div
                      key={`desktop-cards-${postsOffset}`}
                      className="grid lg:grid-cols-2 gap-8 items-stretch pb-2"
                      initial={{ opacity: 0, x: slideDirection === 'next' ? 46 : -46, scale: 0.99 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: slideDirection === 'next' ? -46 : 46, scale: 0.99 }}
                      transition={{ duration: 0.62, ease: [0.25, 0.1, 0.25, 1] }}
                    >
                      {visiblePosts.map((post) => (
                    <article
                      key={post.title}
                      className="group h-full flex flex-col bg-white border border-slate-100 rounded-[2rem] overflow-hidden shadow-[0_16px_40px_rgba(15,23,42,0.08)] hover:shadow-[0_22px_55px_rgba(15,23,42,0.14)] transition-all"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          if (post.kind === 'detail' && post.slug) openArticle(post.slug);
                        }}
                        className="overflow-hidden bg-slate-50 text-left"
                        aria-label={`Otvoriť článok: ${post.title}`}
                      >
                        <img
                          src={post.thumbnail}
                          alt="Nová povinnosť pre e-shopy od 19.06.2026"
                          className="w-full h-auto object-contain"
                        />
                      </button>
                      <div className="p-6 md:p-8">
                        <div className="text-[12px] md:text-[13px] uppercase tracking-[0.16em] text-slate-600 font-semibold flex items-center gap-2 mb-3">
                          <Clock size={12} />
                          {post.meta}
                        </div>
                        <h2 className="text-2xl font-black leading-tight tracking-tight text-[#002b4e]">
                          {post.title}
                        </h2>
                        <p className="mt-4 text-sm leading-relaxed text-slate-500">
                          {post.excerpt}
                        </p>
                        <button
                          onClick={() => {
                            if (post.kind === 'detail' && post.slug) openArticle(post.slug);
                          }}
                          className="inline-flex items-center gap-2 mt-6 text-sm font-bold uppercase tracking-[0.18em] text-brand-orange hover:text-orange-600 transition-colors"
                        >
                          {'Čítať článok'}
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    </article>
                      ))}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </section>
        )}

        <footer id="footer-info" className="bg-[#001c36] text-white py-12 relative overflow-hidden border-t border-white/5 text-center lg:text-left">
          <div className="max-w-7xl mx-auto px-6 lg:px-10 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-10">
              <div className="lg:col-span-4 space-y-6 text-left">
                <div className="flex flex-col items-center gap-6">
                  <div className="flex items-center justify-center text-brand-orange border-white/10 overflow-hidden">
                    <img src={LOGO_WHITE} alt="Lord's Benison" className="h-14 w-auto object-contain" />
                  </div>
                  <div className="flex gap-3 justify-center">
                    <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-brand-orange transition-all">
                      <Facebook size={18} />
                    </a>
                    <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-brand-orange transition-all">
                      <Linkedin size={18} />
                    </a>
                    <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-brand-orange transition-all">
                      <Instagram size={18} />
                    </a>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4 space-y-5 pl-0 lg:pl-12 text-center lg:text-left">
                <div className="text-brand-orange font-bold text-xs uppercase tracking-wider text-center lg:text-left">PRÍSTUP DO PORTÁLU</div>
                <div className="flex flex-col space-y-3 items-center lg:items-start">
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      onAuth();
                    }}
                    className="text-sm font-bold text-white/40 hover:text-white transition-colors cursor-pointer text-center lg:text-left"
                  >
                    Prihlásenie
                  </a>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      onRegister();
                    }}
                    className="text-sm font-bold text-white/40 hover:text-white transition-colors cursor-pointer text-center lg:text-left"
                  >
                    Registrácia
                  </a>
                </div>
              </div>

              <div className="lg:col-span-4 space-y-5 text-center lg:text-left">
                <h4 className="font-bold text-xs uppercase tracking-wider text-brand-orange text-center lg:text-left">RÝCHLE ODKAZY</h4>
                <div className="flex flex-col space-y-3 items-center lg:items-start">
                  <a
                    href="/kontakt"
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate('contact', '/kontakt');
                    }}
                    className="text-sm font-bold text-white/40 hover:text-white transition-colors cursor-pointer text-center lg:text-left"
                  >
                    Kontakt
                  </a>
                  <a
                    href="/skolenia#pricing"
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate('trainings_info', '/skolenia#pricing');
                    }}
                    className="text-sm font-bold text-white/40 hover:text-white transition-colors cursor-pointer text-center lg:text-left"
                  >
                    Cenník
                  </a>
                  <a
                    href="/zasady-ochrany-osobnych-udajov-gdpr.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-bold text-white/40 hover:text-white transition-colors cursor-pointer text-center lg:text-left"
                  >
                    Zásady ochrany osobných údajov
                  </a>
                  <a
                    href="/podmienky-pouzivania.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-bold text-white/40 hover:text-white transition-colors cursor-pointer text-center lg:text-left"
                  >
                    Podmienky používania
                  </a>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-white/5 flex flex-col lg:flex-row justify-between items-center gap-8">
              <div className="flex flex-col gap-2 text-center lg:text-left">
                <p className="text-xs font-bold uppercase tracking-wider text-brand-orange">LORD'S BENISON S.R.O. | Váš partner vo svete podnikania</p>
                <div className="flex gap-4 justify-center lg:justify-start">
                  <a href="https://www.lordsbenison.sk" target="_blank" rel="noopener noreferrer" className="text-xs text-white/60 hover:text-white transition-colors hover:underline">
                    www.lordsbenison.sk
                  </a>
                  <span className="text-xs text-white/40">|</span>
                  <a href="https://www.moja-stavba.sk" target="_blank" rel="noopener noreferrer" className="text-xs text-white/60 hover:text-white transition-colors hover:underline">
                    www.moja-stavba.sk
                  </a>
                </div>
              </div>
              
              <div className="flex flex-col gap-2 text-center lg:text-right">
                <div className="flex gap-4 justify-center lg:justify-end">
                  <a href="/kontakt" className="text-xs font-bold uppercase tracking-wider text-brand-orange hover:text-white transition-colors">
                    Napíšte nám
                  </a>
                </div>
                <div className="flex gap-4 justify-center lg:justify-end">
                  <a href="tel:+421948225713" className="text-xs text-white/60 hover:text-white transition-colors hover:underline">
                    +421 948 225 713
                  </a>
                  <span className="text-xs text-white/40">|</span>
                  <a href="mailto:sluzby@lordsbenison.eu" className="text-xs text-white/60 hover:text-white transition-colors hover:underline">
                    sluzby@lordsbenison.eu
                  </a>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </main>
      <CookieConsent />
    </div>
  );
};


