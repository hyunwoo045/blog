---
title: "[Spring Boot] 에 대하여, 그리고 시작하기"
date: "2022-04-11"
tag: ["Java", "Spring Boot"]
---

# Spring Boot 정리, 그리고 시작하기

Java 백엔드를 개발함에 있어 이제는 거의 필수로 배워야 할 프레임워크가 되어버린 Spring. 그 것이 무엇인지 정리해보고
어떤 개념을 알아야 했으며, 프로젝트를 시작하는 방법에 대해서 아주 간단하게 정리해보자.

## Spring

스프링은 Java 백엔드 애플리케이션 개발을 편하게 해주는 프레임워크다. 프레임워크 없이 개발을 한다면 **비즈니스 로직** 이 외에 필요한
기술들이 추가로 강요받는 것을 프레임워크가 그 것을 대신 구현해주기 때문에 개발자는 오롯이 애플리케이션에서 요구하는 핵심적인 로직들만
구현하는 데에 집중할 수 있게 해준다.

## Spring Boot

Spring Boot 는 위에서 설명한 Spring framework 를 기반으로 만들어진 프레임워크로 기존 Spring 의 불편하고 어려운 점들을 개선하고자
만들어졌다. Spring 은 다른 프레임워크들에 비해 상대적으로 설정과 구성이 복잡하고, 또한 런타임에 필요한 의존성들을 수동으로 설정해야 한다는 불편함이 있었다.
그러나 Spring Boot 는 기본적인 설정을 자동으로 제공하기 때문에 초기 프로젝트 설정이 쉽고 의존성 관리 또한 편하다. 그리고 Spring 의 경우
별도의 웹 서버를 설치하여 배포하여야 했던 반면 Spring Boot 는 자체적으로 웹 서버가 내정되어 있기 때문에 추후에 Docker Container 를 구성하는 등
빌드, 배포 과정에서 아주 편리하다.

## 프로젝트 시작하기

IntelliJ 에디터에서 `spring initializr` 로 간단히 프로젝트를 시작해 보자.

![Initiating Spring Boot](/images/posts/04_01.png)

언어와 패키지 매니저 타입은 원하는 스팩대로 고르고 Spring Boot 3.0.5 버전에서는 Java 11 버전이 정상적으로 동작하지 않는 듯 하니 17 버전으로 세팅

![Initiating Spring Boot_dependency](/images/posts/04_02.png)

`Spring Web` 을 반드시 의존성에 추가해주고 `Lombok` 정도는 추가하거나 추가하지 않더라도 문제는 없다.

이제 `/src/main/java/com/example/demo` 디렉토리에 `*Application.java` 파일이 생긴 것을 볼 수 있고 main 클래스를 실행시키면
Tomcat 웹서버가 실행되고 어플리케이션이 잘 시작한 것을 볼 수 있다.

![Initiating Application](/images/posts/04_03.png)

간단히 Controller 까지 구현해보자. `/src/main/java/com/example/demo` 디렉토리에 `controller` 라는 디렉토리(패키지)를 만들고 `BaseController.java`
파일을 만들어 아래 코드를 넣어줌.

```java
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController(value = "/")
public class BaseController {

    @GetMapping(value = "/")
    public String sayHello() {
        return "Hello Spring!";
    }
}
```

어플리케이션을 재시작하고 `http://localhost:8080` 에 GET 요청을 날려보면 "Hello Spring!" 이 잘 나온다.

![Controller](/images/posts/04_04.png)

## 제어의 역전과 의존성 주입

의존성 주입에 대해서는 정리한 적이 있다. [보러 가기 <---](https://hyunwoo045.vercel.app/posts/03_dependency_injection)

여기서 주입될 객체, 스프링에서는 **Bean** 이라고 표현하는데 Bean 들을 스프링 프레임워크가 어플리케이션이 시작되는 시점에 컨테이너 내에 등록시키고
의존성 관계를 스프링이 직접 관리하게 된다. 이러한 기술을 **제어의 역전**이라고 표현한다.

빈은 두 가지 방법으로 생성이 가능하다. (1) `@Bean` 어노테이션을 선언하는 방법과 (2) `@Component` 어노테이션을 선언하는 방법이다.
간단한 둘의 차이점은 `@Bean` 은 메서드 레벨에 사용되며, 일반적으로 `@Configuration` 어노테이션이 지정된 클래스 내에서 사용되고, 
`@Component`는 클래스 레벨에서 사용된다. ((((둘의 자세한 차이점은 나중에 꼭 리서치 해보기))))

- `@Bean` 어노테이션의 예시 : `application.properties`에 정의되어 있는 `spring.datasource.master.hikari` 설정을 객체에 바인딩시켜
`build()` 호출될 때 설정을 참조하여 `DataSource` 객체를 생성하는 코드. `@Configuration` 어노테이션으로 선언된 객체 내에 `@Bean` 메서드를
정의하는 예시이다.

```java
import com.zaxxer.hikari.HikariDataSource;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;

@Configuration
public class MasterDataSourceConfig {

    @Primary
    @Bean(name = "masterDataSource")
    @ConfigurationProperties(prefix = "spring.datasource.master.hikari")
    public DataSource masterDataSource() {
        return DataSourceBuilder.create()
            .type(HikariDataSource.class)
            .build();
    }
}
```

- `@Component` 어노테이션의 예시

```java
@Component
public class TOTP {
    public String generateTOTP(int returnDigits, String algorithm) { /* ... */ }
}
```

의존성을 주입하는 방법도 알아보자. 메서드 레벨로 생성된 `@Bean` 의 경우 지정한 빈의 이름을 `@Qualifier` 어노테이션로 선언하여 가져올 수 있다.

```java
@Configuration
public class RoutingDataSourceConfig {
    @Bean(name = "routingDataSource")
    public DataSource routingDataSource(
        @Qualifier("masterDataSource") final DataSource masterDataSource
    ) { /* ... */ }
}
```

또한 `@Autowired` 어노테이션을 통해 가져올 수 있다.

```java
@Controller
public class BaseController {
    @Autowired
    public TOTP totp;
}
```

위와 같은 "Field Injection" 은 권장되지 않는다. 의존 관계가 정상적으로 설정되지 않더라도 컴파일 단계에서 오류가 검출되지 않고,
Immutable 한 상태로 만들 수 없다 (`final` 로 선언 불가능). 또한, 가장 와닿을 문제는 스프링과의 강한 결합이 발생하기 떄문에
스프링의 외부에서는 동작할 수 없는 코드가 된다는 점이다. 

위 코드의 `totp` 에 `TOTP` 컴포넌트를 주입할 수 있는 건 오로지 스프링 뿐이다. 이 말은 테스트 코드를 작성할 때 `BaseController` 에
`TOTP` 객체를 전달할 방법이 없다는 뜻. 장점이라고는 생각나지 않는 주입 방법이기 때문에 가급적이면 "생성자 주입"을 하도록 한다.
"Setter 주입"도 있긴 하고 나쁜 방법은 아니지만 객체 생성 과정에 드러나지 않는 숨겨져 있는 주입 방식이기 때문에 의존성이 필수적이라면
생성자 주입을 사용하고 Optional 하게 의존성을 주입해야 하는 상황이라면 Setter 주입을 이용하도록 한다.

```java
@Controller
public class BaseController {
    
    TOTP totp;
    
    @Autowired
    public BaseController(TOTP totp) {
        this.totp = totp;
    }
}
```

Lombok 라이브러리를 사용하고 있다면 아래와 같은 코드로 주입할 수도 있음.

```java
@RequiredArgsConstructor
@Controller
public class BaseController {
    final TOTP totp;
}
```

## Controller, Service

일반적으로 백엔드 어플리케이션에서 Controller 와 Service 는 보통 아래와 같은 역할을 한다.

- Controller: 클라이언트의 요청을 받아 필요한 로직을 수행하고 응답을 보내주는 역할
- Service: Controller 에서 필요로 하는 핵심 비즈니스 로직을 수행

이 역할들을 하는 객체를 스프링 프레임워크에서는 아주 간단히 만들 수 있다. 컨트롤러는 `@Controller` 어노테이션을 선언하고,
서비스는 `@Service` 어노테이션을 선언한다. 두 어노테이션 모두 `@Component` 어노테이션의 확장 어노테이션이기 때문에
스프링 프레임워크가 컴파일되는 시점에 역시 Bean 으로 스프링 컨테이너에 등록되어 스프링의 제어 아래 들어간다. 따라서 개발자는
오롯이 로직 개발에만 집중할 수 있다.

```java
@Service
public class BaseService {
    
    public String sayHello() {
        return "Hello Spring!";
    }
}
```

```java
@Controller
public class BaseController {
    
    final BaseService baseService;
    
    @Autowired
    public BaseController(
        BaseService baseService
    ) {
        this.baseService = baseService;
    }

    @GetMapping(value = "/hello")
    public String hello() {
        return this.baseService.sayHello();
    }
}
```

## 입력 받기

- Query String : `@RequestParam`

```java
// GET http://localhost:80/hello?name=hwkim

@Controller
public class BaseController {

    @GetMapping(value = "/hello")
    public String hello(
        @RequestParam String name
    ) {
        return "Hi: " + name;
    }
}
```

- Path Parameter : `@PathVariable`

```java
// GET http://localhost:80/hello/hwkim

@Controller
public class BaseController {
    
    @GetMapping(value = "/hello/{name}")  // <-- (1) { } 안에 parameter 명
    public String hello (
        @PathVariable(name = "name") String name  // <-- (2) @PathVariable 어노테이션에 name 필드로 parameter 명 넘겨줌
    ) {
        return "Hi: " + name;
    }
}
```

- Request Body : `@RequestBody`

Request Body 의 경우 별도의 객체를 생성하여 입력을 매핑 받아야 한다.

```java
public class HelloReq {
    private String name;
    
    public String getName() {
        return this.name;
    }
}
```

별도의 JSON 에서 자바 객체로 변환하는 코드를 작성하지 않더라도, `@RestController` 나 `@Controller` 로 작성된 컨트롤러 내에
`@RequestBody` 어노테이션이 사용된 객체로 JSON 데이터를 자바 객체로 매핑할 수 있도록 스프링에서 `Jackson` 라이브러리를 통해 지원한다.

```java
@Controller
public class BaseController {
    
    @GetMapping(value = "/hello")
    public String hello (
        @RequestBody HelloReq request
    ) {
        return "Hi: " + request.getName();
    }
}
```

## 응답 내보내기

일반적으로 `HttpEntity<T>` 를 확장한 `ResponseEntity<T>` 객체를 사용하여 응답을 내보낸다. `status()` 메서드를 이용하여 응답 코드를,
`body()` 메서드를 이용하여 응답 body 를 구성한다.

```java
@Controller
public class BaseController {
    
    @GetMapping(value = "/hello")
    public ResponseEntity<String> hello (
        @RequestBody HelloReq request
    ) {
        return ResponseEntity.status(HttpStatus.OK).body("Hi: " + request.getName());
    }
}
```

물론 JSON 포맷의 응답을 내보낼 때도 스프링의 도움을 받을 수 있다. 아래와 같은 객체 또한 별도의 JSON 으로의 매핑 코드를 작성할 필요 없이
스프링이 알아서 JSON 포맷으로 직렬화하여 응답을 보내준다.

```java
public class HelloRes {
    private String message;
    
    public String getMessage() {
        return this.message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
}
```

```java
@Controller
public class BaseController {
    
    @PostMapping(value = "/")
    public ResponseEntity<HelloRes> hell(
        @RequestBody HelloReq request
    ) {
        HelloRes response = new HelloRes();
        response.setMessage("Hi: " + requeste.getName());
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }
}
```