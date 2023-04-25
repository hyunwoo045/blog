---
title: "코맥스 클라우드 2.0 관리자 페이지"
date: "2022-12-17"
tag: ["Spring Boot", "Spring JPA", "Spring Web", "QueryDSL", "Vue.js"]
---

# 코맥스 클라우드 2.0 관리자 페이지

## 주요 기능

- 사용자 관리 (조회, 수정, 삭제)
- 리소스(월패드, 로비폰 등의 코맥스 게이트웨이) 관리
- 그룹 관리 (조회, 수정, 삭제)  *그룹: 모바일 회원과 코맥스 게이트웨이(월패드 등)의 연동
- 사업 대상 단지 관리
- 클라이언트 관리
- 푸시 발송 내역 조회
- 리소스 버전 관리 (OTA, 버전 등록/배포)

## 기술 스택

- Spring Boot, Spring JPA (QueryDSL), Spring Web (Apache Tiles)
- Vue.js
- AWS CLI
- Gitlab Pipeline, Docker, AWS EC2

## 담당 업무

- 리소스 버전 바이너리 파일 등록 페이지 화면 개발
- 리소스 버전 관련 데이터베이스 테이블 구조 설계
- 신규 테이블 JPA 객체 구현 및 쿼리(QueryDSL) 메서드 개발
- 등록된 리소스 버전 조회, 수정, 삭제 API 개발
- AWS S3 버킷에 바이너리 파일을 업로드하는 메서드 구현

## 프로젝트 관련 기록물

