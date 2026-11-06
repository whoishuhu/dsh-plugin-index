# DSH 플러그인 인덱스 (dsh-plugin 태그)

[English](README.md) | [简体中文](README.zh.md) | [繁體中文](README.zh-TW.md) | [日本語](README.ja.md) | [한국어](README.ko.md)

DeepSeek Harness용 플러그인 인덱스입니다. **`dsh-plugin` 태그가 붙은, 설치 가능한 모든 DSH 플러그인**을 수록합니다.

- [`dsh-plugin` 토픽](https://github.com/topics/dsh-plugin)이 붙은 GitHub 저장소. [공식 README](https://github.com/deepseek-ai/deepseek-harness#community-and-support)가 플러그인 작성자에게 사용하도록 요청하는 태그입니다.
- `dsh-plugin` 키워드가 붙은 npm 패키지.

## 사용 방법

DSH에서 **Plugins → Discover → Add index source**를 열고 다음 주소를 붙여 넣습니다.

```text
https://whoishuhu.github.io/dsh-plugin-index/index.json
```

**Discover** 탭이 보이지 않으면 먼저 **Plugins → Experimental plugins**에서 **Custom plugin index**를 켜세요.

## 생성 방식

GitHub Actions가 매일 02:00(UTC+8)에 실행됩니다.

1. `scripts/collect.mjs`가 `dsh-plugin` 키워드가 있는 npm 패키지와 `dsh-plugin` 토픽이 있는 GitHub 저장소를 모두 나열합니다. 이미 npm에 배포된 저장소는 npm에서 설치합니다. 나머지 저장소는 루트 `package.json`이 `dsh.bundle` 또는 workspace를 선언한 경우에만 남깁니다.
2. [공식 레퍼런스 생성기](https://github.com/deepseek-ai/deepseek-harness/tree/master/apps/plugin-market-generator)(`vendor/generator`에 수정 없이 복사)가 이를 읽습니다. `package.json`에서 `dsh.bundle`을 선언하고 비공개나 지원 중단이 아닌 버전만 수록하며, 플러그인 코드를 설치하거나 실행하지 않습니다.
3. `scripts/finalize.mjs`가 플러그인마다 최신 8개 버전(과 최신 안정 버전)을 남기고, GitHub 스타 수·npm 다운로드 수·최근 업데이트 시각 정렬 키를 추가한 뒤, 공식 `@deepseek-ai/dsh-plugin-market-index` 검증기로 결과를 확인합니다.

게시된 사이트에는 `sources.txt`(읽은 소스)와 `warnings.log`(건너뛴 항목과 그 이유)도 있습니다.

## 내 플러그인 수록하기

따로 신청할 필요가 없습니다. GitHub 저장소에 `dsh-plugin` 토픽을 붙이거나 npm 패키지에 `dsh-plugin` 키워드를 붙이고, `package.json`에 `dsh.bundle`을 선언하세요. 다음 일일 빌드에서 수록됩니다.

## 제한 사항

- **수록은 검토가 아닙니다.** 누구나 `dsh-plugin` 태그를 붙일 수 있습니다. 제목, 설명, 설치 출처는 모두 플러그인이 스스로 밝힌 내용입니다. 설치 전에 확인 대화상자에서 출처를 확인하세요.
- tarball이 64 MiB를 넘는 패키지는 건너뜁니다. 공식 생성기에 내장된 제한입니다.
- 태그는 있지만 DSH 플러그인이 없는 저장소, 그리고 선언한 DSH 버전 범위를 만족하는 DSH 릴리스가 없는 버전은 수록되지 않습니다.

## 라이선스

MIT. `vendor/generator`는 [deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness)(MIT)에서 가져왔습니다. DeepSeek와 관련 없는 독립 커뮤니티 프로젝트입니다.
