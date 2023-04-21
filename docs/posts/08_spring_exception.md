---
title: "[Spring Boot] - Exception Handler"
date: "2023-04-21"
tag: ["Spring Boot"]
---

# Spring Boot - Exception Handler

그 어떤 서비스던 모든 요청에 대해 정상 응답을 내려줄 수는 없다. 로그인에 실패하였다거나, 클라이언트 검증에 실패하였다다거나 하는 문제가 항상 있다.
그런 문제가 있을 때 마다 아래와 같은 응답을 보내줄 수는 없다.

```json
{
    "timestamp": "2023-04-20T23:30:16.906+00:00",
    "status": 500,
    "error": "Internal Server Error",
    "path": "/user"
}
```

클라이언트 입장에서는 위 응답이 무엇을 의미하는지 알 수 없다. 에러가 발생하더라도 왜 에러가 발생하였는지를 알려줄 필요가 있어보인다. 
아래와 같은 응답 포맷을 만들어보자.

```json
{
    "success": false,
    "error": "Invalid Authorization Token",
    "payload": null
}
```

기본 응답 포맷 코드 구현

```java
@Getter
@SuperBuilder
public abstract class DefaultResponse {

    protected boolean success = true;
    protected String error = null;
    protected Object payload = null;
}
```

이 객체를 확장하여 각 요청에 맞는 응답 객체를 생성하여 구현하면 됨.

```java
@SuperBuilder
public class UserListRes extends DefaultResponse {

    public static ResponseEntity<UserListRes> toResponseEntity(
        boolean success, String error, List<User> list
    ) {
        List<Map<String, Object>> users = new ArrayList<>();
        for (User user : list) {
            Map<String, Object> u = new HashMap<>();
            u.put("name", user.getName());
            u.put("age", user.getAge());
            u.put("address", user.getAddress());
            u.put("school", user.getSchool().getName());
            users.add(u);
        }

        return ResponseEntity.status(HttpStatus.OK).body(
            UserListRes.builder()
                .success(success)
                .error(error)
                .payload(users)
                .build()
        );
    }
}
```

이제 이를 이용하여 예외 처리 코드를 작성해보자. 우선 생각나는 대로 써보자면

```java
@Service
public class UserService {

    final UserRepository userRepo;

    @Autowired
    public UserService(
        UserRepository userRepo
    ) {
        this.userRepo = userRepo;
    }

    public User findUser(String name) {
        return this.userRepo.findByName(name).orElse(null);
    }

    public School showSchoolInfo(String name) {
        User user = this.userRepo.findByName(name).orElse(null);

        if (user == null) return null;
        return user.getSchool();
    }
}
```

```java
@RestController
@RequestMapping("/user")
public class UserController {

    final UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping(value = "/{name}")
    public ResponseEntity<UserInfoRes> getUserInfo(
        @PathVariable(value = "name") String name,
        @BasicToken Client client
    ) {
        User user = this.userService.findUser(name);

        if (user == null) {
            return UserInfoRes.toResponseEntity(false, name + " is not exists", null);
        }

        return UserInfoRes.toResponseEntity(true, null, user);
    }

    @GetMapping(value = "/{name}/school")
    public ResponseEntity<UserSchoolRes> getUserSchool(
        @BasicToken Client client,
        @PathVariable(name = "name") String name
    ) {
        School school = this.userService.showSchoolInfo(name);

        if (school == null) {
            return UserSchoolRes.toResponseEntity(false, "School not found", null, null);
        }

        return UserSchoolRes.toResponseEntity(true, null, school.getName(), school.getAddress());
    }
}
```

오류가 있음을 안 순간에 바로 메서드를 정리하지 못하고, NULL 넘기고 Null Check 해서 null 이면 Response 객체 말아서 보내주는 질질 끌리는 작업이 필요하고
그 과정 또한 중복 코드로 계속 작성될 가능성이 매우 높아 보인다.

## @ControllerAdvice

`@ControllerAdvice` 어노테이션은 컨트롤러에서 발생하는 예외를 처리하는 공통 기능을 정의할 수 있도록 해주는 어노테이션이다.
이 어노테이션을 사용한 객체에서는 `@ExceptionHandler` 를 붙힌 메서드를 정의할 수 있게 되며, 전역에서 발생하는 특정 exception 에 대한 공통 로직을 정의할 수 있다.

예시

```java
@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<DefaultResponse> handle(RuntimeException ex) {
        return ResponseEntity.status(HttpStatus.OK).body(
            DefaultResponse.builder()
                .success(false)
                .error(ex.getMessage())
                .payload(null)
                .build()
        );
    }
}
```

컨트롤러에서 발생하는 `RuntimeException` 을 처리하는 예시이다.

```java
@RestController
@RequestMapping("/user")
public class UserController {

    final UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping(value = "/{name}")
    public ResponseEntity<UserInfoRes> getUserInfo(@PathVariable(value = "name") String name) {
        User user = this.userService.findUser(name);
        return UserInfoRes.toResponseEntity(true, null, user);
    }

    @GetMapping(value = "/{name}/school")
    public ResponseEntity<UserSchoolRes> getUserSchool(@PathVariable(name = "name") String name) {
        School school = this.userService.showSchoolInfo(name);
        return UserSchoolRes.toResponseEntity(true, null, school.getName(), school.getAddress());
    }
}
```

```java
@Service
public class UserService {

    final UserRepository userRepo;

    @Autowired
    public UserService(
        UserRepository userRepo
    ) {
        this.userRepo = userRepo;
    }

    public User findUser(String name) {
        return this.userRepo.findByName(name).orElseThrow(() -> new RuntimeException("User " + name + " not found"));
    }

    public School showSchoolInfo(String name) {
        User user = this.userRepo.findByName(name).orElseThrow(() -> new RuntimeException("School " + name + " not found"));
        return user.getSchool();
    }
}
```

코드가 확실히 읽기 좋게 바뀌었다는 것이 느껴진다.

## 알아두면 좋은 Exception

우리가 직접 `throw` 하는 exception 외에 컴파일러 혹은 스프링 프레임워크에서 직접 던지는 exception 들이 있는데, 알아두면 좋은 것들을 기록한다.

### HttpMessageNotReadableException

스프링 프레임워크에서 Request body, 일반적으로 JSON 형식의 데이터를 객체로 변환하려는 과정에서 데이터가 객체의 필드와 일치하지 않는다거나,
JSON 형식이 올바르지 않다거나, 데이터가 정의된 필드의 타입과 호환되지 않는 경우 발생할 수 있다.

### MissingRequestHeaderException

HTTP 요청 헤더에 필수로 입력하도록 명시한 헤더 필드가 누락되었을 때 발생한다. 예를 들어 `Authorization` 필드를 입력하도록 정의하였는데,
헤더에 해당 필드가 존재하지 않는다면 exception 이 발생한다.

### MissingServletRequestParameterException

클라이언트 요청에 필요한 path parameter 가 누락되었을 때 발생한다. 예를 들어 `/user/{name}` 이라는 URL 패턴이 있는데, "name" 를 전송하지
않은 경우 예외가 발생한다.

### HttpRequestMethodNotSupportedException

요청된 HTTP Method 가 지원되지 않을 때 발생한다. 예를 들어 `POST /user` 만 정의되어 있는데 `GET /user` 가 들어온다면 발생하게 된다.