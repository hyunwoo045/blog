---
title: "[Spring Boot] - AOP, Resolver"
date: "2023-04-20"
tag: ["Spring Boot"]
---

# Spring Boot - AOP 와 Resolver

착한 개발자들은 항상 읽기 좋은 코드를 작성하기 위해 많은 고민을 한다. 훌륭한 선배님들 덕분에 좋은 프레임워크가 있고,
또한 그 덕분에 개발자들은 핵심 비즈니스 로직에만 집중할 수 있는 좋은 환경이 갖추어졌다.

이번 글의 내용은 필수가 아닌 선택일 수 있다 (개인적인 생각). 하지만 더 읽기 좋은 코드를 만들고 더 착한 개발자가 되기 위해 알아야 할 내용을 정리해본다.

## 관점 지향 프로그래밍 (Aspect-Oriented Programming, AOP)

서비스에 핵심 비즈니스 로직만 존재한다면 얼마나 좋을까. 데이터를 검색해서 달라고 하면 검색해서 주고, 수정해달라고 하면 수정해주기만 하면 얼마나 좋을까.
하지만 그럴 순 없다. "누가 데이터를 검색해서 달라고 했는지" 검증해야 할 필요도 있고 (보안), "수정해달래서 수정했으면 기록"을 해야 할 필요도 있다 (로깅).
그런 기능들은 전체 시스템을 구성하는 여러 기능들의 공통적인 부분이다. 이를 처리하기 위해서는 반복적인 코드 작성이 불가피하다.

```java
@RestController
@RequestMapping("/user")
public class UserController {

    final UserService userService;
    final ClientService clientService;

    Logger logger = new Logger();

    @Autowired
    public UserController(
        UserService userService,
        ClientService clientService
    ) {
        this.userService = userService;
        this.clientService = clientService;
    }

    @PostMapping(value = "")
    public ResponseEntity<Void> createUser(
        @RequestHeader(value = "Authorization") String basicToken,  // (1)
        @RequestBody CreateUserReq request
    ) {
        if (!this.checkBasicToken(basicToken)) {  // (2)
            this.logger.error("Bad Request: Authorization token is not valid");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }

        String name = request.getName();
        int age = request.getAge();
        String address = request.getAddress();
        this.userService.createUser(name, age, address);

        this.logger.info("Success");  // (3)

        return ResponseEntity.status(HttpStatus.OK).body(null);
    }

    @GetMapping(value = "")
    public ResponseEntity<UserListRes> getAllUser(
        @RequestHeader(value = "Authorization") String basicToken
    ) {
        if (!this.checkBasicToken(basicToken)) {
            this.logger.error("Bad Request: Authorization token is not valid");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }

        List<User> users = this.userService.findAll();
        UserListRes res = new UserListRes();
        res.toResponse(users);

        this.logger.info("Success");

        return ResponseEntity.status(HttpStatus.OK).body(res);
    }

    @GetMapping(value = "/{name}/school")
    public ResponseEntity<UserSchoolRes> getUserSchool(
        @PathVariable(name = "name") String name,
        @RequestHeader(value = "Authorization") String basicToken
    ) {
        if (!this.checkBasicToken(basicToken)) {
            this.logger.error("Bad Request: Authorization token is not valid");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }

        School school = this.userService.showSchoolInfo(name);
        UserSchoolRes res = new UserSchoolRes();
        res.setName(school.getName());
        res.setAddress(school.getAddress());

        this.logger.info("Success");

        return ResponseEntity.status(HttpStatus.OK).body(res);
    }

    private boolean checkBasicToken(String token) {
        String s = new String(Base64.getDecoder().decode(token));
        String[] arr = s.split(":");
        if (arr.length > 2) return false;
        String id = arr[0];
        String secret = arr[1];

        return this.clientService.checkClientValid(id, secret);
    }
}
```

(1), (2), (3) 코드가 지속적으로 반복된다. 핵심 비즈니스 로직을 읽는 데에 거슬리기도 하고, 추가 기능을 작성할 때에 실수로 보조 로직 작성을
누락할 수도 있기에 개선이 필요하다.

관점 지향 프로그래밍 (AOP)는 이런 반복적인 코드 작성을 줄이기 위한 기법이다. 핵심 비즈니스 로직과 그의 외관(Aspect)를 분리하여 개발하는 방식으로,
핵심 로직에서 공통적으로 발생하는 보조 로직을 모듈화하여 관리할 수 있다.

## AOP 어노테이션

### @Before("...")

지정한 메서드들이 실행되기 전에 동작

### @After("...")

실행된 후에 동작

### @Around("...")

메서드 실행 전, 후에 모두 동작. 반드시 `Object` 를 반환하여야 한다.

## Pointcut 표현식

AOP 어노테이션에 쓰는 "패턴"으로 어느 부분에 AOP 메서드를 실행시킬 지를 지정하는 방법이다.

- execution: 메서드 실행 지점을 가리키는 키워드. ex) `execution(*com.example..get(..))` - com.example 패키지에 있는 메서드 중 이름이 "get"으로 시작하는
  메서드
- within: 특정 타입 내부의 메서드에 적용. ex) `within(com.example.UserController)` - UserController 내부의 모든 메서드
- annotation: 특정 어노테이션이 있는 메서드에 적용. ex) `annotation(com.example.demo.aop.annotation.Example)` - `@Example` 어노테이션이 붙은 모든
  메서드
- args: 특정 인자가 전달되는 메서드에 적용. ex) `args(java.lang.String)` - String 인자를 받는 모든 메서드
- bean: 특정 이름을 가진 빈에 적용. ex) `bean("userService")` - userService 라는 이름을 가진 빈

예시

```java
// com.example.demo.controller 아래 있는 모든 메서드들에 대해 Aspect 를 적용

@Aspect
@Component
public class GlobalAspect {

    @Around("within(com.example.demo.controller..*)")
    public Object controllerAspectProcessor(ProceedingJoinPoint joinPoint) throws Throwable {
        System.out.println("Request In");

        Object returnObject = joinPoint.proceed();

        System.out.println("Process Done");

        return returnObject;
    }
}
```

`http://localhost:8080/user` 를 돌린 결과

![around aspect result](/images/posts/07_01.png)

이런 방식으로 로깅 로직을 분리시킬 수 있다.

이런 방식을 통해 보안 기능 (위 예시에서 Basic 토큰 검사하는 것)도 분리가 가능하겠지만, AOP 를 사용하게 되면 분리 로직으로부터 필요한 값을 받는 것이 어렵다.
예시에서 만약 client 정보를 핵심 로직에서 사용해야 한다면 어떻게 전달할 수 있을까? 예전의 난 이런식으로 해결하기도 했었다.

```java
public class ThreadConst {
    public static ThreadLocal<Client> client = new ThreadLocal<>();
}
```

```java
@Aspect
@Component
public class GlobalAspect {
    @Autowired
    ClientService clientService;

    @Around("within(com.example.demo.controller..*)")
    public Object controllerAspectProcessor(ProceedingJoinPoint joinPoint) throws Throwable {
        HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.getRequestAttributes()).getRequest();
        String token = request.getHeader("Authorization");

        String s = new String(Base64.getDecoder().decode(token));
        String[] arr = s.split(":");
        String id = arr[0];
        String secret = arr[1];
        
        ThreadConst.client.set(this.getClient(id, secret));
        
        /* ... */
    }
}
```

```java
@RestController
@RequestMapping("/user")
public class UserController {
    
    @GetMapping(value = "")
    public ResponseEntity<UserListRes> getAllUser(
        @RequestHeader(value = "Authorization") String basicToken
    ) {
        Client client = ThreadConst.client.get();
        /* ... */
    }
}
```

`ThreadLocal` 을 이용하여 전역 변수로 사용하는 방법이다. 하지만 어떤 프로그래밍 언어든 전역 변수의 사용은 지양하도록 되어 있다. 스프링 프레임워크에서도
ThreadLocal 을 사용하는 일부 기능이 있는 만큼 잘못 사용해서 예측하지 못한 버그를 일으키는 것보단 다른 방법을 이용하는 것이 좋겠다.

그래서 AOP 랑은 조금 거리가 있긴 하지만 나쁘지 않은 방법을 소개해본다.

## Resolver

일반적으로 Resolver 는 어떤 문제를 해결하기 위해 필요한 정보나 값을 제공하는 역할을 하는 객체나 메서드를 말한다. 다양한 종류가 있으며,

1. `ViewResolver`: View 이름을 참조하여 실제로 렌더링 될 뷰를 찾아주는 역할
2. `LocaleResolver`: 클라이언트의 로케일 정보를 해석하여 적절한 언어와 지역 설정 제공 가능
3. `HandlerMethodArgumentResolver`: 핸들러 메서드가 요구하는 인자를 전달해주는 역할
4. `HandlerMethodReturnValueHandler`: 핸들러 메서드의 리턴 값을 처리

이 중에서 `HandlerMethodArgumentResolver` 를 이용하여 보안 기능을 분리해보자.

```java
@Component
@RequiredArgsConstructor
public class TokenArgumentResolver implements HandlerMethodArgumentResolver {

    private static final String AUTHORIZATION_HEADER = "Authorization";

    private final BasicTokenParser parser;

    @Override
    public boolean supportsParameter(MethodParameter parameter) {
        return parameter.getParameterAnnotation(BasicToken.class) != null;
    }

    @Override
    public Object resolveArgument(MethodParameter parameter, ModelAndViewContainer mavContainer, NativeWebRequest webRequest, WebDataBinderFactory binderFactory) throws Exception {
        String token = null;
        String authHeader = webRequest.getHeader(AUTHORIZATION_HEADER);
        if (StringUtils.hasText(authHeader)) {
            token = authHeader;
        }

        if (token != null) {
            Client client = parser.checkClient(token);

            if (client == null) throw new Exception("Invalid Authorization");

            return client;
        } else {
            throw new Exception("Invalid Authorization");
        }
    }
}
```

Resolver 빈을 생성해준다. `HandlerMethodArgumentResolver` 의 구현체는 `supportsParameter()` 와 `resolveArgument()` 를 필수로 구현해야 한다.
`supportsParamter()` 메서드를 통해 `@BasicToken` 어노테이션이 붙은 인자값에 대해 Resolver 를 적용할 수 있도록 하고,
`resolveArgument()` 메서드를 통해 해당 인자값에 전달할 값을 반환한다. 토큰 파싱에 실패하면 Exception 을 던지게 하면 토큰 검증과 동시에 핵심 로직으로
인자값을 넘겨줄 수 있게 된다.

```java
@Component
public class BasicTokenParser {

    final ClientService clientService;

    @Autowired
    public BasicTokenParser(
        ClientService clientService
    ) {
        this.clientService = clientService;
    }

    public Client checkClient(String token) {
        String s = new String(Base64.getDecoder().decode(token));
        String[] arr = s.split(":");
        if (arr.length != 2) return null;
        String id = arr[0];
        String secret = arr[1];

        if (this.clientService.checkClientValid(id, secret)) {
            return this.clientService.getClient(id, secret);
        } else return null;
    }
}
```

```java
@RestController
@RequestMapping("/user")
public class UserController {

    final UserService userService;
    final ClientService clientService;

    @Autowired
    public UserController(
        UserService userService,
        ClientService clientService
    ) {
        this.userService = userService;
        this.clientService = clientService;
    }

    @PostMapping(value = "")
    public ResponseEntity<Void> createUser(
        @BasicToken Client client,
        @RequestBody CreateUserReq request
    ) {
        System.out.println(">>> Client is " + client.getClientId());
        
        String name = request.getName();
        int age = request.getAge();
        String address = request.getAddress();
        this.userService.createUser(name, age, address);

        return ResponseEntity.status(HttpStatus.OK).body(null);
    }

    @GetMapping(value = "")
    public ResponseEntity<UserListRes> getAllUser(
        @BasicToken Client client
    ) {
        System.out.println(">>> Client is " + client.getClientId());
        
        List<User> users = this.userService.findAll();
        UserListRes res = new UserListRes();
        res.toResponse(users);

        return ResponseEntity.status(HttpStatus.OK).body(res);
    }

    @GetMapping(value = "/{name}/school")
    public ResponseEntity<UserSchoolRes> getUserSchool(
        @BasicToken Client client,
        @PathVariable(name = "name") String name
    ) {
        System.out.println(">>> Client is " + client.getClientId());
        
        School school = this.userService.showSchoolInfo(name);
        UserSchoolRes res = new UserSchoolRes();
        res.setName(school.getName());
        res.setAddress(school.getAddress());

        return ResponseEntity.status(HttpStatus.OK).body(res);
    }
}
```

로깅 로직과 검증 로직 분리 완!

![result](/images/posts/07_02.png)