# CodexGUI 국제화(i18n) 구현 문서

## 개요

CodexGUI의 국제화(internationalization, i18n) 기능은 다양한 언어 사용자를 위한 접근성과 사용성을 향상시키기 위해 구현되었습니다. 이 문서는 i18n 기능 구현에 대한 세부 사항과 확장 방법을 설명합니다.

## 지원 언어

현재 지원되는 언어 목록:

| 코드 | 언어 | 네이티브 이름 |
|------|------|------------|
| `en` | 영어 | English |
| `ko` | 한국어 | 한국어 |
| `zh-CN` | 중국어 간체 | 简体中文 |
| `ja` | 일본어 | 日本語 |
| `es` | 스페인어 | Español |

향후 추가 예정 언어:
- 독일어 (`de`)
- 이탈리아어 (`it`) 
- 프랑스어 (`fr`)

## 기술 스택

- **i18next**: 기본 국제화 라이브러리
- **react-i18next**: React 통합을 위한 래퍼
- **i18next-browser-languagedetector**: 브라우저 언어 자동 감지
- **i18next-http-backend**: 지연 로딩(lazy loading) 지원
- **i18next-chained-backend**: 여러 백엔드를 체인으로 연결
- **i18next-localstorage-backend**: 로컬 스토리지 캐싱

## 주요 기능

### 1. 지연 로딩 (Lazy Loading)

기본 언어(영어, 한국어)만 즉시 로드되고, 다른 언어는 필요할 때 동적으로 로드되어 초기 로딩 시간과 번들 크기를 최적화합니다.

```typescript
// i18n/index.ts
// 기본 언어만 즉시 로드
import en from './locales/en.json';
import ko from './locales/ko.json';

// 지연 로딩 설정
backend: {
  backends: [
    LocalStorageBackend, // 로컬 스토리지 캐싱
    Backend // HTTP 백엔드
  ],
  backendOptions: [{
    // 로컬 스토리지 옵션
    prefix: 'codexgui_i18n_',
    expirationTime: 7 * 24 * 60 * 60 * 1000, // 7일
    defaultVersion: 'v1.0.0'
  }, {
    // HTTP 백엔드 옵션
    loadPath: '/locales/{{lng}}/{{ns}}.json'
  }]
}
```

### 2. 접근성이 향상된 언어 선택 UI

웹 접근성 가이드라인(WCAG)을 준수하는 언어 선택 컴포넌트로, 키보드 네비게이션과 스크린 리더 지원이 향상되었습니다.

```tsx
// LanguageSelector.tsx
<button
  ref={buttonRef}
  aria-expanded={isOpen}
  aria-haspopup="listbox"
  aria-label={t('settings.languageSelector', 'Select language - Current: {{language}}', { language: getCurrentLanguage().nativeName })}
  aria-controls="language-menu"
>
  {/* 버튼 내용 */}
</button>

{isOpen && (
  <div 
    ref={menuRef}
    id="language-menu"
    role="listbox"
    aria-label={t('settings.languageOptions', 'Available languages')}
    aria-activedescendant={`language-option-${currentLanguage}`}
    onKeyDown={handleMenuKeyDown}
  >
    {supportedLanguages.map((lang) => (
      <button
        id={`language-option-${lang.code}`}
        role="option"
        aria-selected={currentLanguage === lang.code}
        aria-label={`${lang.nativeName} (${lang.name})`}
      >
        {/* 옵션 내용 */}
      </button>
    ))}
  </div>
)}
```

주요 접근성 개선사항:
- 적절한 ARIA 속성 사용 (`aria-expanded`, `aria-haspopup`, `aria-controls` 등)
- 키보드 네비게이션 지원 (Arrow keys, Enter, Escape)
- 스크린 리더 지원을 위한 의미론적 마크업

### 3. 지역화된 포맷팅 유틸리티

날짜, 시간, 숫자, 통화 등 다양한 데이터를 현재 선택된 언어에 맞게 포맷팅하기 위한 유틸리티 함수를 제공합니다.

```typescript
// 사용 예시
import { formatDate, formatNumber, formatPercent } from '../utils/formatters';

// 일반 사용
formatDate(new Date(), { dateStyle: 'full' });  // '2025년 4월 20일 일요일' (ko)
formatNumber(1234567.89);                      // '1,234,567.89' (en)
formatPercent(0.7568);                         // '75.68%' (en)

// React 컴포넌트에서 훅 사용
import { useFormatters } from '../hooks/useFormatters';

function MyComponent() {
  const { formatDate, formatNumber } = useFormatters();
  
  return (
    <div>
      <p>날짜: {formatDate(new Date())}</p>
      <p>금액: {formatNumber(12345.67)}</p>
    </div>
  );
}
```

### 4. 언어 자동 감지

사용자의 브라우저 언어 설정을 감지하여 적절한 언어로 자동 전환하는 기능을 제공합니다.

```typescript
// i18n/index.ts
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .init({
    // ...
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'codexgui-language',
      caches: ['localStorage']
    }
  });
```

## 테스트

국제화 기능은 Vitest를 사용하여 자동화된 테스트를 통해 검증됩니다.

```typescript
// i18n.test.tsx
describe('i18n config', () => {
  test('should initialize with default language', () => {
    expect(i18n.language).toBe('en');
  });

  test('should change language', async () => {
    await i18n.changeLanguage('ko');
    expect(i18n.language).toBe('ko');
  });
});

describe('Formatting utilities', () => {
  test('should format dates according to locale', () => {
    const testDate = new Date(2025, 3, 20);
    expect(formatDate(testDate, { dateStyle: 'short' }, 'en-US'))
      .toMatch(/4\/20\/2025|4\/20\/25/);
  });
});
```

## 새 언어 추가 방법

1. 새 언어 JSON 파일 생성 (`src/i18n/locales/{언어코드}.json`)
2. `supportedLanguages` 배열에 새 언어 추가 (`src/i18n/index.ts`)

```typescript
// i18n/index.ts
export const supportedLanguages = [
  // 기존 언어...
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
];
```

3. [선택적] 필요한 경우 지역화 포맷팅 유틸리티 확장

## 디렉토리 구조

```
src/
├── i18n/
│   ├── index.ts              # 기본 설정 및 초기화
│   └── locales/              # 언어별 번역 파일 
│       ├── en.json           # 영어 (기본)
│       ├── ko.json           # 한국어
│       ├── zh-CN.json        # 중국어 간체
│       ├── ja.json           # 일본어
│       └── es.json           # 스페인어
├── components/
│   └── ui/
│       └── LanguageSelector.tsx  # 언어 선택 컴포넌트
├── utils/
│   └── formatters/           # 지역화 포맷팅 유틸리티
│       └── index.ts
└── hooks/
    └── useFormatters.ts      # 포맷팅 유틸리티 훅
```

## 성능 최적화

- 지연 로딩으로 초기 번들 크기 최소화
- 로컬 스토리지 캐싱으로 언어 파일 재다운로드 방지
- 기본 언어만 즉시 로드하여 초기 렌더링 속도 향상

## 향후 개선 사항

1. **RTL(Right to Left) 언어 지원** - 아랍어, 히브리어 등 RTL 언어 지원
2. **번역 관리 도구 통합** - Crowdin, Lokalise 등 번역 관리 플랫폼 통합
3. **자동 번역 API 연동** - 부분적인 자동 번역 지원
4. **커스텀 언어 팩** - 사용자 정의 언어 및 용어 지원

## 참고 자료

- [i18next 공식 문서](https://www.i18next.com/)
- [react-i18next 가이드](https://react.i18next.com/)
- [Web Content Accessibility Guidelines (WCAG)](https://www.w3.org/WAI/standards-guidelines/wcag/)
- [Intl API MDN 문서](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl)
