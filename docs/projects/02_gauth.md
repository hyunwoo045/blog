---
title: "(코맥스) 인증/연동 서버"
date: "2022-04-14"
tag: ["Spring Boot", "Spring Data JPA", "Gitlab Pipeline", "Docker", "AWS ECS"]
---

# 코맥스 클라우드 2.0 인증/연동 서버

마이크로서비스 아키택쳐로 구성되어 있는 코맥스 클라우드 2.0 인프라 내 **인증과 연동**을 담당하는 프로젝트.

## 주요 기능

- 모바일 회원 등록 (이메일 인증)
- 리소스 (월패드, 로비폰 등의 하드웨어) 등록
- 로그인
- 클라이언트 검증 (JWT)
- 클라이언트 검증 용 JWT 발급, 갱신
- QRCode 용 OTP 발급
- 유저 정보 조회, 수정, 삭제
- 리소스 정보 조회, 수정, 삭제
- 모바일 정보 조회, 수정, 삭제
- FCM (Firebase) Token 추가, 삭제
- 그룹 생성 (모바일-리소스 연동)
- 그룹 수정, 삭제
- 그룹 목록 조회

## 기술 스택

- Spring Boot, Spring Data JPA, Spring Rest Docs, JUnit4, MockMVC, Gradle
- MariaDB, DB Replication, Redis
- Gitlab pipeline
- Docker
- AWS EC2 (Target Group, Load Balancer), ECS
- log4j, filebeat, ELK (ElasticSearch, Logstash, Kibana)
- AWS CloudWatch

## 담당 업무

1. Php to Java 언어 마이그레이션
   - 인증/연동 서버 전체 기능을 Java 로 재구현
2. Spring Rest Docs 문서 자동화 시스템 도입
   - 전체 기능 테스트 코드 작성
3. 요청 검증 로직 개선 (비용 절감 목적)
   - Session 기반 인증 방식에서 Token 기반 인증 방식으로 변경
   - JWT 토큰 생성, 검증 메서드 구현
   - Resolver 를 이용한 비즈니스 로직으로부터 검증 로직 분리 구조 개발
   - 전체 클라우드 서버 비용 중 8% 절감
4. OTP 기능 개발
   - OTP 관리 객체 구현 (OTP 생성, 검증 메서드 포함)
   - OTP 관련 데이터베이스 테이블 구조 설계 및 구현
   - OTP 생성 API 신규 개발 및 연동 시 OTP 검증 관련 로직 수정 구현
5. FCM 토큰 추가 및 삭제 API 개발

## 프로젝트 관련 기록물

- [Spring Boot - 기본 개념과 기초 구현](https://hyunwoo045.vercel.app/posts/04_starting_springboot)
- [Spring Boot - JPA 시작하기](https://hyunwoo045.vercel.app/posts/05_sprintboot_jpa)
- [Spring Boot - DB Replication & Transaction](https://hyunwoo045.vercel.app/posts/06_jpa_repli_transaction)
- [Spring Boot - AOP, Resolver](https://hyunwoo045.vercel.app/posts/07_aop_resolver)
- [Spring Boot - Exception Handler](https://hyunwoo045.vercel.app/posts/08_spring_exception)
- [Spring Boot - Rest Docs, API 자동 문서화](https://hyunwoo045.vercel.app/posts/09_spring_restdocs)