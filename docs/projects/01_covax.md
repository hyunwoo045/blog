---
title: "(사내공모전) Covax 백신 솔루션"
date: "2022-03-01"
tag: ["Nest.js", "TypeORM", "React", "Docker"]
---

# Covax 백신 솔루션

연 1회 실시하는 사내 공모전에 출품한 작품. 2021년 말 가구 내 월패드가 해킹당하여 집 안 영상이 유출된 사건으로 보안에 관한 관심이 많은 시기였기 때문에 이를 주제로 선정하고 작품을 구상하게 되었다.

뉴스 링크: [거실 월패드가 당신을 엿본다... "아파트 700곳 몰카 해킹"](https://n.news.naver.com/mnews/article/023/0003655824?sid=102)


## 주요 기능

핵심 기능은 월패드 내에 **화이트 프로세스 리스트** 를 관리하는 프로그램과 이 프로그램이 주기적으로 리포트를 클라우드 서버로 전송하여 데이터를 수집,
마지막으로 종합 관리 시스템 대시보드까지 제공하는 것을 한 솔루션에 담는다는 목표로 프로젝트를 진행하였다.

전체 솔루션 중 Cloud 파트를 도맡아 개발을 진행하였으며 내용은 아래와 같다.

- Cloud
   - 솔루션 대상 단지 정보 등록
   - 월패드 정보 등록
   - 기타 보안 검사 (Client 인증, 사용자 인증)
   - 비상 알림 (대시보드, 모바일 Push)
   - 종합 정보 제공 (대시보드, 아래 그림 참고)

![covax dashboard](/images/projects/01_01.png)

## 기술 스택

1. 대시보드 파트
   - Node.js
   - React
2. API 서버 파트
   - TypeScript
   - Nest.js
   - TypeORM
   - MariaDB
3. 배포 파트
   - AWS EC2
   - Docker

## 공모전 결과

프로젝트의 주요 내용을 구현한 프로토타입을 결과물로 발표한 후 대상을 수상.

![covax prize](/images/projects/01_02.png)

## 프로젝트 관련 기록물

1. [Nest.js 시작하기](https://hyunwoo045.vercel.app/posts/01_starting_nestjs)
2. [TypeORM 개념 정리 및 사용해보기](https://hyunwoo045.vercel.app/posts/02_typeorm)