---
title: '관리자 페이지 - 운영 관제 시스템'
date: '2023-03-11'
tag: ["Node.js", "React", "Redux", "Express", "ElasticSearch", "Redis", "MariaDB", "Gitlab pipeline", "Docker"]
---

# 코맥스 운영 관제 시스템

## 주요 기능

- AWS OpenSearch (ElasticSearch) 에 적재된 로그 검색
  - Commax Cloud 1.0 서비스 별 로그 검색을 통해 처리 결과 확인
  - 운영 관제 시스템 내 조회 가능한 Cloud1.0 서비스
    - 월패드 로그인
    - 계정 등록
    - 모바일 앱 로그인
    - 기기 등록
    - 기기 제어
    - 3rd Party 앱 연동, 로그인, 제어
    - 단지 공용부 서비스 (입출차, 방문자, 에너지, 주차 위치 확인, 무인 택배, 공지사항, 주민 투표)
- Commax Cloud 1.0 서비스 내 기본 정보 조회
- 월패드 정보 및 계정 초기화
- VoC 담당 부서 가이드라인 제공

## 기술 스택

- Node.js, Express
- React, Redux
- ElasticSearch, MariaDB, Redis
- Gitlab pipeline, Docker

## 담당 업무

- Backend API 서버 프로젝트 초기 설정 구현 (MariaDB, Redis Connection)
- Layered Architecture 디자인 패턴 기본 구조 구현
- ElasticSearch 쿼리 메서드 개발
- RDS Query 생성
- 웹 페이지 디자인 구성 및 구현 (React)

## 프로젝트 관련 기록물
