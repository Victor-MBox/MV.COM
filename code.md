# MV.COM — документация проекта

Сайт-портфолио Виктора Мацакова (будущий домен victormatsakov.com). Одностраничное React-приложение с клиентским роутингом. Этот файл — опорная точка для дальнейшей работы: архитектура, контент, дизайн-система, соглашения и список незакрытых задач. Обновлять при каждом заметном изменении. Смысловая часть (кому продаём, какие тексты писать, план) — в `content.md`.

Состояние на 20.10.2026: владелец выбрал главной вариант «Portilo, меню в шапке» (ТЗ `docs/design-spec-home4.md`, 19.10.2026) и попросил перевести на его фирменный стиль весь сайт. Главная живёт на `/`, её токены стали базовыми (`_variables.scss`), каркас всех страниц — верхняя шапка `TopHeader` + страница + `SiteFooter`, внутренние страницы переписаны по `docs/design-spec.md` §9 теми же компонентами. Четыре других варианта главной (`/` концепт D, `/home2`, `/home3`, `/home5`), левое меню, старые токены и компоненты удалены — последний коммит с ними `400ddfd`. Этап 3 `content.md` (реальный контент) — за владельцем.

## 1. Стек и команды

| Что | Чем |
|---|---|
| Сборка | Vite 6, `@vitejs/plugin-react-swc` |
| UI | React 19, TypeScript 5 (strict, `verbatimModuleSyntax`, `erasableSyntaxOnly`) |
| Роутинг | react-router-dom 7 (`BrowserRouter`) |
| Анимации | framer-motion (переходы, модалка, аккордеон, галерея, маски строк, слайдер), gsap (счётчики `CountUp`), lenis (плавный скролл, только главная) |
| Стили | SCSS, CSS-переменные, две темы через класс на `body` |
| Линт | ESLint 9 flat config: `@eslint/js`, `typescript-eslint`, `react-hooks`, `react-refresh` |
| Тесты | Vitest 5 (только данные и утилиты, без DOM) |

```bash
npm ci              # зависимости по lock-файлу (Node 22)
npm run dev         # http://localhost:5173
npm run build       # dist/ (в .gitignore)
npm run preview     # прод-сборка локально
npm run lint        # 0 предупреждений — требование
npm run type-check  # tsc --noEmit
npm test            # vitest run
```

## 2. Структура

```
src/
  main.tsx                 BrowserRouter + глобальные стили (assets/style/style.scss)
  app/App.tsx              Каркас: TopHeader + <main class="main"> (AnimatePresence по pathname, <Routes>) + SiteFooter,
                           ContactModalProvider, ScrollToTop. Условий по маршруту нет
  app/routes.ts            ROUTE_PATHS — все пути <Routes>, по ним тест проверяет ссылки шапки
  pages/                   Страницы, по папке на раздел (tsx + scss, классы с префиксом страницы)
    home/                  Главная (docs/design-spec-home4.md): HomePage.tsx (Lenis, класс body.home-intro один раз за сессию,
                           остановка Lenis под модалкой) + sections/ Hero, Services, Work, Faq, Hr, Stats, Final + HomePage.scss
                           (раскладка §6 ТЗ, типографика §3.2, адаптив §8; префикс home). Секции «Как работаю» и «Сколько стоит» —
                           общие компоненты ProcessSteps и PricingBlock
    services/              ServicesPage (/services), OfferPage (/services/:offer)
    portfolio/             PortfolioPage (/portfolio), ProjectPage (/portfolio/:slug)
    about/ blog/ contacts/ AboutPage; BlogPage, PostPage, PostCard (карточка статьи обеих страниц блога); ContactsPage
    NotFoundPage.tsx/.scss 404
  components/              Переиспользуемые блоки, по папке на компонент (tsx + scss) — см. §5
    logo/                  Монограмма «VM.» (Logo.tsx + Logo.scss): один контур currentColor и точка --accent, размер через height
                           родителя; те же контуры — в public/favicon.svg, logo.svg, logo-inverted.svg (править в четырёх местах)
  data/                    Весь контент сайта как TypeScript-данные (§4)
  api/contact.ts           Отправка заявки (сейчас заглушка с задержкой)
  hooks/useTheme.ts        Тема: общее состояние модуля через useSyncExternalStore, localStorage → prefers-color-scheme,
                           класс light/dark на body и color-scheme на html; сохраняется только ручной выбор. До React класс ставит
                           инлайн-скрипт в index.html (без вспышки)
  hooks/useDocumentMeta.ts title, description, og:*, canonical страницы; дефолты для всего сайта — в index.html. Пока не вызывается
                           ни одной страницей (см. §12)
  hooks/useMediaQuery.ts   matchMedia через useSyncExternalStore (MQ.reduced/coarse/hover/tablet/phone), useStagger (60/40 мс)
  hooks/useLenis.ts        Плавный скролл Lenis (§8.2 ТЗ 1.0): живёт, пока смонтирована главная; getLenis() для ScrollToTop,
                           модалки и мобильного меню
  assets/style/            style.scss → _reset, _variables (токены), _main (базовые правила), _system (слой дизайн-системы: ритм,
                           заголовки, .container/.section, skipLink, Lenis, курсор)
  resources/               victor.png и его WebP-экспорт victor.webp (30 КБ, hero), avatar.webp (418px, «Обо мне»),
                           norandoms/ — реальные скриншоты кейса (WebP, обложка 21:9)
  __tests__/               Vitest-тесты данных: data, home, offers, services, leadForm.validation
public/                   Статика как есть: favicon.svg (монограмма, цвета по prefers-color-scheme: #161616/#e63e1f, в тёмной
                          #fefefe/#ff4625), apple-touch-icon.png 180px на фоне #0a0a0a, logo.svg / logo-inverted.svg — знак для
                          тёмного и светлого фона вне сайта (соцсети, документы). vite.svg удалён 20.10.2026
docs/design-spec.md       ТЗ дизайн-системы 1.0 (Portilo + OKC): правила, токены, типографика, компоненты, внутренние страницы (§9),
                          движение, адаптив. Заметка в начале — что изменилось 20.10.2026
docs/design-spec-home4.md ТЗ главной: разбор Portilo, отличия от 1.0, TopHeader, компоненты, секции, движение, адаптив, данные,
                          приёмка; заметка в начале — правки владельца 20.10.2026 и статус «выбран главной»
docs/research/            Отчёты по конкурентам и design-references.md (45 референсов, выбранное направление §3)
Главная - концепт D (Типографика).html, Главная - концепт H (Портрет).html
                          Прототипы из Claude Design (бандлы 2 МБ, не в git) — история, в коде не используются
```

Именование: папка компонента и файл в camelCase/PascalCase (`pageHead/PageHead.tsx`). Стили компонента лежат рядом и импортируются из него.

## 3. Маршруты

| Путь | Страница | Данные |
|---|---|---|
| `/` | HomePage — hero фиксированной высоты 680px с портретом, именем «ВИКТОР / МАЦАКОВ» в две строки, H1-абзацем, одной цифрой «8 лет» и язычком «Обсудить проект»; «Как работаю» (`ProcessSteps` с панелями «Почему со мной»); услуги витриной-переключателем `OfferShowcase`; слайдер работ `WorkSlider` (NoRandoms + два примера-плейсхолдера); «Сколько стоит» (`PricingBlock`); 4 вопроса `DimAccordion`; «Для HR» с бегущей строкой стека; четыре счётчика; финал — инвертированная строка офферов, «Давайте работать», кнопка в модалку, мета-ряд, водяной знак | `home.ts` (NAME, ROLE, WORDMARK, NAV, SOCIAL, HERO_OFFER, HERO_STAT, H2, SHOWCASE_ORDER, PROCESS_WHY, CASE_FACTS, WORK_SLIDES, STATS, FINAL_TITLE, FINAL_META, WATERMARK, STRIP, PRICING_PANEL, PROOF, WHY_ME, HR_BLOCK), OFFERS, PROJECTS, PROCESS, PRICING_MODELS, PRICING, FAQ, STACK_GROUPS, CONTACT_LINKS |
| `/services` | ServicesPage — `PageHead` с кнопкой «Обсудить задачу», 7 офферов карточками `OfferGrid`, `PricingBlock details` (полный блок content.md §4.3), `ProcessSteps` без панелей, все 11 вопросов (`#faq`), `CtaBlock` | OFFERS, PRICING, PRICING_MODELS, PROCESS, FAQ |
| `/services/:offer` | OfferPage — `PageHead` «услуга 0N» с ценой и сроком (`Stat`), «Кому подходит / не подходит», «Что получите» с номерами, «Сколько стоит и от чего зависит» строками, «Примеры» (`WorkCard` по `categories`), `ProcessSteps`, FAQ оффера, аккордеон «Стек и детали» (стек, подуслуги из `SERVICES`, хостинг), `CtaBlock` с `offer.cta`. Нет оффера — 404 | `getOffer`, `getService`, AFTER_LAUNCH, PROJECTS, CASE_FACTS |
| `/portfolio` | PortfolioPage — `PageHead`, фильтры-чипы от 8 проектов (`FILTERS_FROM`), главный кейс `CaseCard wide`, остальные сеткой `CaseCard`, `CtaBlock` | PROJECTS, PROJECT_CATEGORIES |
| `/portfolio/:slug` | ProjectPage — `PageHead` «кейс» (крошка, клиент · год · срок · статус, роль; «Открыть сайт ↗», «Обсудить похожий проект»), обложка, четыре `Stat` из `metrics`, «Задача / Что сделал / Результат», `Gallery`, стек чипами, аккордеон «Как это устроено технически» (`features`, `FlowScheme`, `process`), соседние кейсы, `CtaBlock`. Нет проекта — 404 | `getProject`, `getAdjacentProjects` |
| `/about` | AboutPage — `PageHead` с фото 4:5 (`asideFirst`), «Скачать резюме», «GitHub ↗», «Написать»; «О себе», «Стек» (группы строками с чипами), «Опыт» (`DimAccordion` 01–04), «Принципы», «Главный кейс» (`CaseCard wide`), `CtaBlock` | EXPERIENCE, STACK_GROUPS, HR_BLOCK, HR_LINE, PROJECTS, CONTACT_LINKS; тексты ABOUT и PRINCIPLES — в файле страницы |
| `/blog`, `/blog/:slug` | BlogPage — карточки `PostCard` в две колонки; PostPage — тело статьи в колонке 68ch (p, h2, ul, quote, code), «Ещё в блоге», `CtaBlock`. Блога нет в меню — посты вымышленные | POSTS, formatDate, getPost |
| `/contacts` | ContactsPage — `PageHead` со статусом «Открыт для проектов», каналы строками с копированием, встроенная `LeadForm` в панели, 4 вопроса. CTA-блока нет | CONTACTS, CONTACT_LINKS, `getFaq(CONTACTS_FAQ_KEYS)` |
| `*` | NotFoundPage — «Страницы нет.» кеглем финала, две текстовые ссылки | — |

- Активная ссылка шапки считается в `TopHeader` по `pathname.startsWith(to)`; логотип ведёт на `/` и активен только там.
- `ScrollToTop`: при смене маршрута прокрутка наверх (через `lenis.scrollTo`, если главная подняла Lenis), при `#hash` — к якорю с ожиданием элемента до секунды; `scroll-margin-top` секций учитывает липкую шапку.
- Переход между страницами — `AnimatePresence mode='wait'`, 250 мс.

## 4. Контент как данные (`src/data`)

Весь текст, цены, ссылки и картинки живут здесь. Чтобы изменить контент, править эти файлы, а не компоненты. Правило контента: один факт — одно место на странице; числа только настоящие; технические термины на страницах для бизнеса — только внутри аккордеонов и блока «Для HR». Строки, которые владелец должен утвердить, помечены `// TODO (владелец)`.

- `offers.ts` — **витрина услуг**: `OFFERS` (7 офферов из content.md §4.2). Поля: `key` (URL), `title`, `line`, `forWhom`, `priceFrom`, `priceDetail?`, `term`, `cta` («Обсудить лендинг» — подпись кнопок, винительный падеж), `audience[3]`, `notFor[1–2]`, `outcomes[5–8]`, `priceFactors[3]`, `notIncluded[]`, `afterLaunch?` (иначе `AFTER_LAUNCH`), `faq[3–5]`, `services[]` (ключи из `SERVICES`), `categories[]` (связь с кейсами для блока «Примеры»), `tech { stack[], notes[] }`. Хелперы `getOffer`, `offerPath`.
- `services.ts` — **справочник подуслуг**, не витрина: `SERVICE_GROUPS` и `SERVICES` (32 подуслуги); собственных страниц нет — перечисляются в аккордеоне «Стек и детали» страницы оффера. Каждая входит хотя бы в один оффер (тест). Тип `Faq` объявлен здесь.
- `pricing.ts` — `PRICING_MODELS` (три формата оплаты), `PRICING` (`included`, `factors`, `estimate`, `reading`, `supportExample`, `terms`, `notDoing`), `AFTER_LAUNCH`, `BUDGET_RANGES` (вилки бюджета в форме).
- `faq.ts` — единый `FAQ` (11 вопросов) с ключами; `HOME_FAQ_KEYS`, `CONTACTS_FAQ_KEYS`, `getFaq(keys)`. Ответ про договор и ИП закреплён тестом.
- `home.ts` — данные главной и общие строки: `PROOF` (два настоящих числа), `HR_LINE` (стек, «удалённо»), `WHY_ME`, `WHY_ME_PROOF`, `HR_BLOCK` (текст для HR, путь к резюме `/cv.pdf`); hero — `NAME` «Виктор Мацаков», `NAME_LINES`, `ROLE`, `HERO_SUBTITLE` → `HERO_OFFER` (последняя фраза — акцентной строкой), `HERO_STAT`; шапка — `WORDMARK`, `NAV`, `SOCIAL`; секции — `H2` (заголовки с одним `accent` или `muted`), `SHOWCASE_ORDER`, `PROCESS_WHY` (обещание под шагом), `CASE_FACTS` (индексы `highlights` для карточки), `WORK_PLACEHOLDERS` и `WORK_SLIDES` (лента слайдера: реальные проекты + два примера с векторными обложками), `STATS` (четыре счётчика из `PROOF`, `highlights` и `EXPERIENCE`), `FINAL_TITLE`, `FINAL_META`, `WATERMARK`, `STRIP`, `PRICING_PANEL`.
- `leadForm.ts` — форма заявки: `INTENTS` («Проект / Вакансия или контракт / Вопрос»), `JOB_FORMATS`, `FORM_COPY` (успех, «что будет дальше»).
- `projects.ts` — `PROJECTS`: сейчас один реальный кейс `norandoms` (`featured`). Поля: `tagline`, `line` (без чисел), `highlights[3]`, клиент/год/роль/срок, `stack`, `categories`, `link`, `cover`, `showcase`, `gallery`, `task`/`solution`/`result`, `metrics[4]` (единственное место с числами на странице кейса), `status`, `features[]`, `scheme[]`, `process[]`. `PROJECT_CATEGORIES`, `getProject`, `getAdjacentProjects`.
- `posts.ts` — `POSTS` с контентом блоками (`p | h2 | ul | quote | code`), `cover` необязателен, `formatDate`, `getPost`. Посты вымышленные.
- `experience.ts` — `EXPERIENCE` (опыт, пример), `STACK_GROUPS` (стек группами), `PROCESS` (4 шага — единственный процесс на сайте, content.md §4.4).
- `contacts.ts` — `CONTACTS` и `CONTACT_LINKS` (единственное место с контактами: шапка, соцпанель, CTA, контакты, HR). `location` = «Работаю удалённо» — города и часового пояса на сайте нет (решение владельца от 20.10.2026, закреплено тестом).

Ключи (`key`, `slug`) — латиница и дефисы, попадают в URL. Тесты в `__tests__` проверяют уникальность ключей, ссылки `services[]`, полноту полей офферов, порядок витрины, ленту слайдера (главный кейс первым, примеры ведут на существующие страницы офферов и без чисел), неповторяемость чисел главной, отсутствие Тбилиси/GMT, ссылки шапки по `ROUTE_PATHS`.

## 5. Дизайн-система

Правила — `docs/design-spec.md` §3 (десять правил) и `docs/design-spec-home4.md` §3.3. Коротко: один акцент `--accent` только в ролях «одно слово в заголовке, primary-кнопка, точки-маркеры, цифра hero»; ни одного начертания жирнее 500 (заголовки 500 глобально в `_system.scss`); служебный текст (метки, номера, теги, подписи, даты) — моно 13px; единственный элемент в верхнем регистре — имя в hero и водяной знак; карточка внутри карточки запрещена — списки с разделителями `--border`; иконки либо акцентные, либо никакие; стоковых картинок нет; градиентов, свечений (кроме `Box glow`) и теней (кроме `--shadow-cover`) нет.

### Токены (`_variables.scss`)

Три блока: `:root` (тёмная по умолчанию), `body.light`, `body.dark` — новую переменную, зависящую от темы, добавлять во все три. Значения тёмной — из ТЗ главной (§3.1), светлой — из её же §9.

| Группа | Переменные |
|---|---|
| Фон и поверхности | `--bg` #0a0a0a / #f4f3f1, `--box` #141414 / #fff (карточки, панели, поля), `--box-hover`, `--box-deep` #0d0d0d / #ebeae7 (подложки внутри карточек: мини-интерфейсы, код, чипы) |
| Текст | `--text` (заголовки, цифры), `--text-body` (абзацы, 0.8), `--text-muted` (подписи, метки), `--text-dim` (пригашённые соседи, неактивные пункты) |
| Линии | `--border` (разделители), `--border-strong` (бордер по ховеру, круг со стрелкой) |
| Акцент | `--accent` #ff4625 / #e63e1f, `--accent-hover`, `--accent-text` (мелкий акцентный текст, контраст ≥ 4.5:1), `--accent-soft` (свечение карточек), `--on-accent` |
| Прочее | `--glass`/`--glass-border` (стекло кнопок, переключателя, курсора), `--ok` (точка «онлайн», успех формы), `--error`, `--ui-plate` (плашки мини-интерфейсов), `--shadow-cover`, `--overlay`, `--glow-rest`, `--hero-line`, `--strip-bg`/`--strip-text` (инвертированная бегущая строка) |
| Шрифты | `--font-title` Geologica (заголовки, цифры), `--font-body` Golos Text, `--font-mono` JetBrains Mono. Подключены в `index.html` (`preconnect` + `<link>`) |
| Движение | `--ease-out` cubic-bezier(.2,.7,.2,1), `--ease-in-out`, `--d-fast` 180, `--d-mid` 240, `--d-base` 360, `--d-reveal` 600, `--d-slow` 700, `--d-dim`/`--d-undim`, `--d-count` 1200, `--stagger` 60 |
| Размеры | `--radius-card` 20, `--radius-field` 12, `--radius-pill`; `--container` 1320, `--gutter` 48 → 32 (≤1200) → 16 (≤768); `--section-y` 128 → 96 → 64; `--header-h` 72 → 56 (≤768); `--z-*` |

Глобальное правило `* { font-family: var(--font-body) }` задаёт шрифт каждому элементу явно, поэтому потомки заголовков, моно-строк и акцентов получают `font-family: inherit` (`_system.scss`: `:is(h1, h2, .display, .accent, .muted) *`; в компонентах — локально, как у `.pageHead__meta *`).

### Типографика

| Элемент | Шрифт / вес | Размер |
|---|---|---|
| Имя в hero (`.display`) | Geologica 500, верхний регистр | `clamp(52px, 6.6vw, 96px)` / 0.92, две строки |
| H1 внутренней страницы (`PageHead` → `h1.sectionHead__title`) | Geologica 500 | `clamp(40px, 4.5vw, 64px)` / 1, одно выделение |
| H2 секции (`SectionHead`) | Geologica 500 | `clamp(32px, 3vw, 44px)` / 1.05, −0.02em, одно выделение (`accent` или `muted`) |
| Заголовок финала и CTA-блока, 404 | Geologica 500 | `clamp(56px, 9vw, 120px)` финал; `clamp(48px, 7vw, 96px)` CTA |
| H3 карточек и строк | Geologica 500 | 20–22px, −0.01…−0.02em |
| Цифры (`Stat`) | Geologica 500, tabular | hero `clamp(40px, 4vw, 64px)`, карточка 32px; счётчики главной `clamp(48px, 5vw, 72px)` |
| Пункт витрины услуг | Geologica 500 | `clamp(28px, 3.4vw, 52px)`, номер «01/» того же кегля |
| Абзац | Golos 400 | 15–17px / 1.6, −0.01em, `--text-body` |
| Служебный слой | JetBrains Mono | 13px (14 в бегущей строке стека), `letter-spacing: 0`, `--text-muted` |
| Кнопки | Geologica 500 (primary/secondary 16px), моно для text-стрелки | — |

### Готовые классы (`_system.scss`)

- `.container` — ширина `--container` + гаттеры; `.section` — `padding-block: calc(var(--section-y) / 2)` (ритм делится между соседями) и `scroll-margin-top: var(--header-h)` для якорей. Все секции страниц строятся как `<section class="section"><div class="container">`.
- `.accent` — акцентное слово; `.muted` — приглушённый хвост заголовка (цвет ставит `SplitLines.scss`); `.mono`.
- `.skipLink` — «К содержанию», первый элемент в DOM у `TopHeader`, виден только по `:focus-visible`.
- `body.has-cursor [data-cursor] { cursor: none }` — пока активен курсор-подпись.
- `html { position: relative }` — для `useScroll({ target })` у `CaseCard wide`.

### Компоненты

| Компонент | Для чего |
|---|---|
| `TopHeader` | Липкая шапка 72px с отрицательным `margin-bottom` — прозрачная поверх hero и шапок страниц; после 24px прокрутки фон `color-mix` 85% + blur на `::before`. Логотип — монограмма `Logo` («VM.», 22px, aria-label из `WORDMARK`) → `/`, `NAV` (активная — точка под текстом), `ThemeToggle`, «Обсудить проект» (secondary → модалка). На ≤992 — круглая кнопка-меню и полноэкранная панель порталом в `body` (ловушка фокуса, Esc, `lenis.stop()`); соцпанель `SOCIAL` ≥1200 порталом. Интро `body.home-intro [data-intro]` — стаггер 25 мс при первой загрузке главной |
| `ThemeToggle` | Круг 40px на стекле, одна inline-SVG иконка (солнце в тёмной, луна в светлой), поворот и кроссфейд; состояние — `useTheme` |
| `SiteFooter` | Копирайт слева, GitHub / LinkedIn / Telegram справа; города и часов нет |
| `PageHead` | Шапка внутренней страницы (§9 ТЗ): `label` (`// раздел`), `title: Headline`, `lead`, `meta` (моно-строка: крошки, дата), `actions` (кнопки), `aside` (цифры, статус, фото; `asideFirst` — на ≤992 aside под заголовком, до кнопок). Сетка 8/4, линия снизу на всю ширину контейнера, `padding-top` учитывает `--header-h` |
| `SectionHead` | Метка `// слово` (слэши акцентом), действие справа (моно, стрелка), H2/H1 через `SplitLines` с одним выделением (`Headline = { text, accent? \| muted? }`), лид до 56ch |
| `CtaBlock` | Финал внутренних страниц: заголовок в две строки (`FINAL_TITLE` по умолчанию), текст, primary-кнопка в модалку с `topic`, текстовая ссылка в Telegram |
| `ProcessSteps` + `ProcessArt` | Единственный процесс сайта: четыре колонки с разделителями — линейная SVG-иллюстрация шага (штрих `--text-muted`, один акцентный элемент), шаг `PROCESS[i]`, при `withWhy` панель с обещанием `WHY_ME` (`PROCESS_WHY`). На ≤992 — 2×2, на ≤560 — столбик |
| `PricingBlock` + `PriceCard` | Три формата `PRICING_MODELS` карточками (цена `clamp(28px, 2.6vw, 36px)`, «Обсудить →» открывает модалку с темой) и широкая панель «что входит / что влияет»; `details` — строки `dl` (оценка, как читать цифры, условия, пример поддержки, чем не занимаюсь) для `/services` |
| `OfferShowcase` + `MiniUi` | Витрина главной: список-переключатель (ховер с задержкой 60 мс, фокус, тап на тач) и панель активного оффера — номер `01/` маской, срок, мини-интерфейс (семь композиций из HTML-элементов, микроанимации по ховеру контейнера `.miniUiHost`), строки «что это / цена / для кого», «Подробнее →» |
| `OfferGrid` | Семь офферов карточками на `/services`: мини-интерфейс 16:9, номер и срок моно, название, строка, чипы «для кого», цена и круг со стрелкой; 3 → 2 (≤1200) → 1 (≤640) колонки, слот скрыт на ≤640 |
| `Box` | База карточки: фон `--box`, радиус 20, без рамки в покое, по ховеру бордер и подъём 2px; `glow` — свечение в углу; `to`/`href` — вся карточка ссылка; `cursor` — подпись курсора |
| `Button` | `primary` (пилюля, акцент) / `secondary` (стекло) / `text` (текст + стрелка `→ ↗ ↓`); `to`, `href` (внешняя — новая вкладка), `download`, `full`, `disabled` |
| `Chip` | Моно 13px на `--box-deep` с бордером; `dot` — вариант с акцентной точкой; `as='li'` |
| `Stat` | Число + суффикс + подпись моно; числа считаются `CountUp` (gsap) при 30% видимости один раз, строки («Февраль 2026») — как есть; невидимый дубль держит ширину; `size='card'` 32px; `accent` — только hero. `formatStat.ts`: `formatStat`, `NBSP`, `parseStat` («18 000+» → `{ 18000, '+' }`) |
| `WorkCard` + `WorkSlider` + `CoverArt` | Карточка работы по Portilo: чип клиента, строка, обложка 16:10 (скриншот или векторная `CoverArt` у примеров), факты `Stat card`, название и круг со стрелкой. Принимает `item: WorkCardData` (`Project` подходит структурно; `to` — куда ведёт). Слайдер: от двух карточек — лента `drag='x'` с привязкой, стрелки, ромбы-точки, полоса прогресса; `inert` у неактивных слайдов |
| `CaseCard` | Карточка кейса по Zolt (портфолио, «Обо мне»): год · срок · клиент моно, H3, строка, цифры из `highlights`, роль, теги стека; `wide` — обложка справа с параллаксом (`useScroll` с `target` только у широкой) |
| `DimAccordion` | Аккордеон с пригашиванием соседей (OKC): `multiple`, `defaultOpen`, номера `number`, `wide` (тело без 56ch — техника кейса и оффера); панель по высоте 360 мс |
| `Reveal` | Появление блока при прокрутке один раз (opacity, y 24 → 0, 600 мс; `index` — стаггер 60/40 мс до восьмого; `as`) |
| `SplitLines` | Разбивка заголовка по строкам с масками: измерение после `document.fonts.ready`, пересчёт при смене ширины; `lines` — ручная разбивка; `trigger='now'` для hero; `accent`/`muted` |
| `Marquee` | Бегущая строка (стек в блоке HR, офферы в финале), пауза по ховеру, статична при reduced-motion |
| `Watermark` | Водяной знак финала: верхний регистр `clamp(96px, 17vw, 240px)`, opacity .06 |
| `TabCta` | Язычок-трапеция на нижней кромке hero (`clip-path`), на ≤560 — primary на всю ширину |
| `Cursor` | Курсор-подпись 88px над элементами с `data-cursor` («смотреть», «открыть», «читать»); выключен при `pointer: coarse`, reduced-motion и ≤992; портал в `body` |
| `LeadForm` + `ContactModal` | Форма с намерениями (§6.13 ТЗ 1.0): «Проект» — направление (офферы) и бюджет, «Вакансия» — формат, «Вопрос» — только сообщение; валидация `validate.ts`; встроена на `/contacts`, в модалке — `compact`. Модалка: портал, оверлей с блюром, диалог 760px (28/22 на ≤768), Esc, блокировка скролла, `useContactModal().open(topic?)` |
| `Gallery`, `FlowScheme`, `CountUp` | Галерея кейса (кадр 16:9, миниатюры, лайтбокс порталом, клавиатура), схема «узлы → стрелки» в аккордеоне кейса, счётчик на gsap |
| `ScrollToTop` | Прокрутка наверх / к якорю при смене маршрута (см. §3) |

## 6. Адаптив

Брейкпоинты: ≤1200 (гаттер 32, ритм 96, соцпанель скрыта), ≤992 (шапка: ссылки, кнопка и тема скрыты, круглая кнопка-меню; hero в столбик по центру с `height: auto`; сетки страниц в столбик; `PageHead` в столбик, `aside` после кнопок или первым при `asideFirst`), ≤768 (гаттер 16, ритм 64, шапка 56px, панели в столбик, модалка 28/22), ≤640 (`OfferGrid` в одну колонку без слотов), ≤560 (язычок hero — primary на всю ширину, витрина без слота, процесс в столбик, `WorkCard` 100%, `TabCta`).

Адаптив каждой страницы и компонента лежит в их SCSS (общего файла медиазапросов нет). Проверка: ширина 390 — `scrollWidth === innerWidth` на всех маршрутах (скрипт `overflow.mjs`, §9). Бегущим строкам — `overflow: hidden` на обёртке; `.projectPage` и `.home` — `overflow-x: clip` (слайды галереи и водяной знак шире окна).

## 7. Соглашения по коду

- Табы, одинарные кавычки, без точек с запятой, JSX-атрибуты в одинарных кавычках.
- Типы импортировать через `import type` (`verbatimModuleSyntax`). Без `enum` и параметров-свойств конструктора.
- Файл с компонентом экспортирует только компоненты (`react-refresh/only-export-components`): хуки и контексты — в отдельные `.ts` (`ContactModalContext.ts` + `ContactModalProvider.tsx`).
- Нельзя вызывать `setState` синхронно в `useEffect` (`react-hooks/set-state-in-effect`): измерения — в `document.fonts.ready.then` / `ResizeObserver` (как `SplitLines`, `WorkSlider`), подписки — через `useSyncExternalStore` (`useMediaQuery`, `useTheme`); сброс формы по новому пропу — через `key`.
- SVG-атрибуты в JSX в camelCase; декоративные SVG — `aria-hidden='true'`; у интерактивных элементов `aria-label`; картинки вне первого экрана — `loading='lazy'`.
- Анимации: framer-motion для появления и переходов (`App` в `<MotionConfig reducedMotion='user'>` + глобальное правило `prefers-reduced-motion`), gsap для чисел. Ховер-подъём карточек, которые анимирует framer, — через `whileHover`, не CSS `transform`.
- Контактные данные и ссылки — только из `data/contacts.ts`; тексты — из `data/*`, в страницах остаются только строки, относящиеся к одной странице (ABOUT, PRINCIPLES, CHANNELS, H1 и H2 с `TODO (владелец)`).
- Новые страницы: `PageHead` → секции `.section > .container` с `SectionHead` → `CtaBlock`; только токены 1.0 и компоненты §5; старых классов (`.btn`, `.card`, `.titlerow`) и токенов (`--bg-primary`, `--accent-blue`) в проекте нет — не возвращать.
- Тема: `useTheme` — единый стор (`useSyncExternalStore`); `localStorage.theme` пишется только при ручном выборе; тот же алгоритм продублирован инлайн-скриптом в `index.html` — при изменении ключа или правил менять оба места.
- Lenis поднимает только главная (`useLenis()`); пока открыта модалка или мобильное меню — `lenis.stop()`; `lenis.scrollTo(element)` сам вычитает `scroll-margin-top`.
- `backdrop-filter` делает элемент containing block для `position: fixed` потомков — у `TopHeader` фон и блюр на `::before`, панель меню, соцпанель, модалка, курсор и лайтбокс рендерятся порталом в `body`.
- У `motion.div` пропы `onDragStart`/`onDragEnd` — колбэки жеста; нативный DnD ссылок и картинок внутри drag-ленты гасится через `addEventListener('dragstart', preventDefault)` (`WorkSlider`).
- `useScroll({ target })` требует смонтированного `target` и не-static контейнера: у `CaseCard` опции передаются только при `wide`, `html { position: relative }` в `_system.scss`.
- Вложенный селектор `&__x` внутри медиазапроса компилируется в ту же специфичность, что и базовое правило ниже по файлу, — для переопределений в медиазапросах добавлять родителя (`&__actions &__theme`).
- Правило `:is(h1, h2, …) * { font-weight: inherit }` не включает h3/h4: иначе UA-bold утекал бы в `.dimAcc__title` внутри `h3.dimAcc__head`; заголовкам явно задан вес 500.

## 8. Форма и модалка

`LeadForm` валидирует имя, контакт (e-mail / телефон / @ник), сообщение и согласие (`components/leadForm/validate.ts`, тест `leadForm.validation.test.ts`), показывает ошибки по полям, состояние отправки и экран успеха (`FORM_COPY.success`). Намерение уходит в `ContactPayload.topic` («Вакансия: контракт», «Вопрос» или выбранный оффер); `open(topic)` с темой не из списка офферов добавляет её отдельной опцией. Отправка — `submitContact` в `src/api/contact.ts`, сейчас имитация с задержкой 900 мс и `console.info` в dev; для боевого режима заменить тело функции на `fetch` к своему endpoint или сервису форм, интерфейс `ContactPayload` не менять.

Модалка (`ContactModal`): одна на сайт, открывается из шапки, hero, карточек форматов, CTA-блоков и страниц офферов с темой; Esc закрывает, скролл блокируется, фокус уходит в первое поле; exit-анимация пружинная (~0.8 с), в автотестах ждать не меньше секунды. Встроенная форма — только на `/contacts`.

## 9. Как проверять

1. `npm run type-check && npm run lint && npm test && npm run build`.
2. `npm run dev` (или `preview`) и прогон в браузере: `/` (интро hero один раз за сессию — повтор по `sessionStorage.removeItem('home-intro-played')`; витрина переключается ховером/тапом; слайдер работ — стрелки, ромбы, свайп; аккордеон FAQ открывает несколько; обе бегущие строки на паузе по ховеру; курсор «смотреть» над карточкой кейса; язычок и кнопка шапки открывают модалку), `/services` (карточки, полный блок цен, `#faq`), `/services/web-service` (примеры есть) и `/services/support` (примеров нет), `/portfolio`, `/portfolio/norandoms` (галерея, лайтбокс, аккордеон техники), `/about`, `/blog`, `/blog/gsap-scrolltrigger-60fps` (код, список, цитата), `/contacts` (форма — три намерения, 4 ошибки на пустой отправке, экран успеха; копирование каналов), несуществующий адрес. Модалка: отправить пустую (4 ошибки), заполнить и отправить, закрыть Esc; со страницы оффера — тема подставлена.
3. Переключить тему (кнопка в шапке, на ≤992 — в мобильном меню) и просмотреть те же страницы; при `prefers-reduced-motion` — без Lenis, масок, счётчиков и курсора.
4. Ширина 390: нет горизонтального скролла, меню открывается и закрывается (Esc, фокус возвращается на кнопку).
5. В консоли нет ошибок и предупреждений React/framer.
6. Чек-лист `content.md` §9: числа не повторяются, ярлыков в верхнем регистре нет (кроме имени и водяного знака), стоковых картинок нет, одна primary-кнопка на экран.

Скриншоты и проверки в сессиях 19–20.10.2026 делались скриптами на Chrome DevTools Protocol (headless Chrome `/Applications/Google Chrome.app` с `--remote-debugging-port=9222` + Node 22 `WebSocket`, без зависимостей; скрипты живут в scratchpad сессии и пишутся заново по этому описанию): `cdp.mjs` — клиент (`/json/new` → `Page.navigate` → `Runtime.evaluate` → `Page.captureScreenshot`, сбор ошибок консоли); `clip.mjs --path --sel --width --theme --h --eval --click --full` — кадр секции: страница загружается при 900px, секция измеряется, затем страница перезагружается во вьюпорте высоты секции, прокручивается до неё и снимается вьюпорт (ресайз вьюпорта после загрузки даёт чёрный кадр, а `captureBeyondViewport` рисует липкую шапку не на месте); `overflow.mjs` — обход всех маршрутов на 390 с проверкой `scrollWidth === innerWidth` и консоли; `drag.mjs` — свайп слайдера мышью (`mousePressed` → шаги `mouseMoved` с `buttons: 1` → `mouseReleased`). Параллельные запуски делят профиль Chrome: тему надёжнее ставить через `--eval "document.body.classList.add('light')"`, кадры снимать последовательно. Якорь с `#hash` на тот же документ не даёт `Page.loadEventFired` — переходить через `about:blank`.

## 10. Принятые решения

- Две аудитории (бизнес и HR) на одном сайте: бизнес-язык по умолчанию, техника на уровень глубже — аккордеоны «Как это устроено технически» / «Стек и детали», блок «Для HR» на главной, «Обо мне» как страница для найма.
- Витрина услуг — 7 офферов, два уровня `/services` → `/services/:offer`; 32 подуслуги — справочник внутри аккордеона. 1С-Битрикс — одна строка в оффере поддержки. Цены и формулировки офферов — ориентировочные (content.md §4.2), владелец правит в `offers.ts` и `pricing.ts`.
- «Один факт — одно место»: `8 лет` только в hero; `18 000+` и «Февраль 2026» только в карточке работы; `6 000+`, `500+`, `92%`, `20+` только в счётчиках; `3 500 ₽` и `25 000 ₽` только в ценах; «30 минут» и «два дня» — в тексте шага 01 (на `/services` ещё в строке «оценка» полного блока цен — так в content.md §4.3).
- Один процесс работы на сайт (`PROCESS`, `ProcessSteps`): главная с панелями «Почему со мной», `/services` и офферы без них. На «Обо мне» процесса нет.
- Кейс NoRandoms (norandoms.team) — реальный собственный продукт Виктора; вымышленные кейсы удалены. Пока проект один, портфолио показывает его широкой карточкой без фильтров (от 8 проектов), а слайдер главной работает на двух примерах-плейсхолдерах с векторными обложками (`WORK_PLACEHOLDERS`, чип «Пример», ссылка на страницу оффера, факты без чисел) — убрать, когда появится второй реальный кейс.
- Фото: портрет в hero главной (`victor.webp`) и `avatar.webp` на «Обо мне»; второго фото на главной нет.
- Картинки только свои; посты блога вымышленные — блог скрыт из меню, страницы доступны по ссылке.
- Решения владельца по главной (19–20.10.2026): акцент «горячий» `#ff4625`, фон `#0a0a0a`, карточки #141414; имя «Виктор Мацаков» в две строки кеглем 96px (а не «Виктор» 136px); без статус-пилюли и без статуса «Беру проекты с …»; hero фиксированной высоты 680px, а не 100svh; номер витрины в кегле пункта списка (а не 114px); в «Как работаю» линейные SVG-иллюстрации шагов; модалка 760px; города (Тбилиси), страны и часового пояса на сайте нет нигде — аудитория Россия и СНГ, город остаётся в резюме (`FINAL_META` «Работаю удалённо», футер без часов, `HR_LINE.place` «удалённо», `CONTACTS.location` «Работаю удалённо»).
- 20.10.2026 владелец выбрал вариант Portilo главной и единым стилем сайта. Сделано: `/` = бывший `/home4`; варианты D, H, `/home3`, `/home5` удалены вместе со своими компонентами, данными, тестами и ресурсами (`bg_01.gif`, иконки меню); `LeftMenu`, `ThemeButton` (CSS-рестайл) заменены `TopHeader` + `ThemeToggle`; условия по маршруту (`isV2Route`, `isTopHeaderRoute`…) убраны; скоуп `body.v2` снят, `_v2.scss` стал `_system.scss`, токены главной — базовые, старые токены и партиалы (`_button`, `_glow`, `_responsive`, `_themes`, зерно `body::after`) удалены; данные главных слиты в `home.ts`, `parseStat` переехал в `components/stat/formatStat.ts`, данные формы — в `leadForm.ts`, `validate.ts` — рядом с `LeadForm`; модалка везде с `LeadForm`, `ContactForm` удалён.
- 20.10.2026: знак сайта — векторная монограмма «VM.» (`components/logo`, `public/favicon.svg`, `apple-touch-icon.png`, `logo*.svg`): Swiss-геометрия Black-веса в юнитах высоты букв 100 (по скрину-референсу владельца от 20.10.2026) — стойки 27, диагонали с наклоном 0,44, V 112 и M 124 с одинаковым счётчиком 52 и плоскими вершинами 24, правый штрих V входит в левую стойку M на 8, коралловая точка 32 (треть высоты) с зазором 7 на базовой линии — единственный цвет; без полей, подложек, обводок. Слово-логотип «Victor Matsakov.» из шапки убран, `WORDMARK` остался именем знака для aria-label. Favicon переключает цвета по `prefers-color-scheme`, а не по теме сайта (вкладка не знает класс `body`); Safari SVG-иконку не показывает — ему apple-touch-icon.
- Внутренние страницы переписаны по ТЗ 1.0 §9 на общих компонентах; из главной вынесены `ProcessSteps` и `PricingBlock`, добавлены `PageHead`, `CtaBlock`, `OfferGrid`, `PostCard`; `Gallery` и `FlowScheme` перерисованы на токенах (API прежние); `DimAccordion` получил `wide`, `PageHead` — `asideFirst`, `CaseCard` — `useScroll` только у широкой карточки (иначе падение в сетке от двух проектов). Старые `PageHeader`, `FooterBanner`, `Accordion`, `ProcessList`, `OfferCard`, `FeaturedProject`, `ProjectCard`, `ServiceIcon`, `TitleRow`, `Card`, `OfferIllustration` удалены.
- Решения исполнителя по страницам: цифры в шапке оффера (`Stat`) уменьшены до кегля цены карточки формата и стоят столбиком — «от 15 000 ₽ за задачу» не помещается в 4 колонки aside; над колонками «для кого» подписи «подходит / не подходит»; на «Обо мне» статус «Открыт для проектов» один раз — под фото; на `/contacts` H2 панели формы меньше (32px) — 44px внутри карточки выглядел тяжело; карточкам блога оставлено свечение `glow` (ТЗ 1.0 §7.6 просило без — вопрос владельцу).
- Полностраничные CDP-скриншоты (`captureBeyondViewport`) ненадёжны для страниц с липкой шапкой — приёмка по секциям (`clip.mjs`).
- `dist/` не коммитится. Коммиты и пуш — только по явной просьбе.

## 11. Заглушки, которые нужно заменить

- `data/contacts.ts`: e-mail, Telegram, WhatsApp, LinkedIn, Instagram — плейсхолдеры (GitHub — `Victor-MBox`).
- Резюме: кнопки «Скачать резюме» (блок HR на главной, «Обо мне») ведут на `/cv.pdf` (`HR_BLOCK.cv`), файла в `public/` нет.
- `data/pricing.ts`: `notDoing` — три пункта-заглушки, `supportExample` — формула поддержки на подтверждение.
- `data/experience.ts`: места работы и периоды — правдоподобный пример; `STACK_GROUPS` без Docker, с 1С-Битрикс в CMS.
- Тексты «Кому подходит / не подходит», «Что получите», факторы цены и FAQ офферов написаны по правилам content.md §4 и §9 — владелец сверяет с практикой.
- Посты блога вымышленные, без обложек; `PostCard`/`PostPage` обложки не выводят — добавить блок при появлении реальных статей.
- `api/contact.ts` — имитация отправки. Ссылок на политики в футере нет (и страниц политик тоже).
- `data/home.ts`: `H2` секций, подписи `STATS`, `PRICING_PANEL`, `FINAL_TITLE`, `WATERMARK` — плейсхолдеры из ТЗ (`TODO (владелец)`); `WORK_PLACEHOLDERS` — два примера кейсов до второго реального. `data/leadForm.ts`: подписи намерений и тексты формы.
- Строки внутренних страниц с `TODO (владелец)`: H1 и лиды `/services`, `/portfolio` (H1 и лид повторяют «в цифрах» — переписать одну из строк), `/blog`, `/contacts`; H2 секций «Обо мне», кейса и оффера; текст под заголовком `CtaBlock`.

## 12. Бэклог

- Этап 3 content.md §8 (за владельцем): реальные кейсы (минимум 3, шаблон §4.7; при NDA — «Не публикуем») — тогда удалить `WORK_PLACEHOLDERS` и `CoverArt`, проверить слайдер и сетку портфолио на тач-девайсе; реальный опыт; файл резюме; контакты; подтверждение формулы поддержки и «чем не занимаюсь»; отзывы с именем и должностью (поле `testimonial` в `Project`); фото «Обо мне» крупнее 418px для ретины.
- SEO: `useDocumentMeta` есть, но не вызывается — подключить на страницах с данными офферов, кейсов и статей; затем `sitemap.xml` и, желательно, пререндер (SSG) маршрутов офферов и кейсов, чтобы H1 и тексты были в HTML без JavaScript. Хлебные крошки в JSON-LD, `BreadcrumbList`/`Service`.
- Страницы политик (конфиденциальность, cookies, согласие) и ссылки на них из футера и чекбокса формы.
- Реальный backend формы, защита от спама, уведомление в Telegram. Аналитика (Метрика/GA) и цели на отправку формы.
- Code-splitting по маршрутам: бандл 596 КБ (предупреждение Vite о чанке > 500 КБ) — `React.lazy` на страницы.
- Возможные доработки компонентов по итогам переноса: `PageHead` — проп ширины `aside` (сейчас 4 колонки, цифры оффера пришлось уменьшить); `Stat` — `prefix` (есть в `ProjectMetric`) и перенос длинных строковых значений; `DimAccordion` — слот `meta` в строке заголовка (период опыта сейчас первой строкой содержимого); `Button text` — стрелка «←» для ссылок «назад»; седьмая карточка `OfferGrid` одна в последнем ряду трёхколоночной сетки.
- `ProjectMetric.prefix` на странице кейса показывается строкой без счётчика (у NoRandoms префиксов нет).
- `useDocumentMeta`, `useTheme` и инлайн-скрипт темы — общие; при изменении ключа `localStorage.theme` менять оба места.
- Lighthouse ≥ 90 / 95 не замерялся (нет CLI); тач-жесты (витрина, слайдер, меню) проверены эмуляцией CDP, на реальном устройстве — нет.
- Таблица «Было / стало» для кейсов с измеримым до/после (content.md §4.7 п.5) — компонент появится вместе с первым таким кейсом.
- Если понадобится блог побольше — вынести посты в Markdown/MDX вместо объектов и вернуть пункт в меню (`NAV` в `home.ts`).
