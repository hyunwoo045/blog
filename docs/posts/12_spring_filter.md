---
title: "[Spring Boot] - Filter"
date: "2023-05-12"
tag: ["Spring Boot"]
---

# Spring Boot - Filter

작업 중 이런 비슷한 요구 사항이 생겨 고민을 많이 했다. ***공용 prefix 를 가지고 있는 url 에 특정 Host (Header)로 들어오는 요청의 경우
다른 Controller 에서 요청을 처리***해야 한다는 요구 사항이다.

예를 들어 `GET /api/user` 라는 API 가 `ApiController` 에 정의되어 있는데

```java
@Controller
@RequestMapping(value = "/api")
public class ApiContrller {
    
    @GetMapping("/user")
    public ResponseEntity<GetUserRes> getUser() {
        // ...
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
}
```

Header: Host 에 `http://www.google.com` 어쩌고에서 요청을 보낸 경우에는 다른 로직을 적용해야 하는 그런 느낌의 요구 사항이다.

```java
@Controller
@RequestMapping(value = "/google")
public class GoogleController {

    @GetMapping("/user")
    public ResponseEntity<GetGoogleUserRes> getUser() {
        //...
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
}
```

왠만하면 이런 요구 사항 자체가 안 생기는 것이 좋았을 텐데, 한 프로젝트에 이해 관계자가 많아지고 심지어 그 관계에서 ***을의 입장***이라면
요구하는 url 포맷을 맞춰 개발을 할 수 밖에 없다. 그렇게 의도하지 않은 API 들이 늘어나다보면 "한 객체 안에 여러 이해 관계자들의 API 코드가
뒤죽박죽 섞여 보기 힘들수도 있겠구나"를 넘어서 위 예시와 같이 "다른 이해 관계자 둘 이상이 같은 url 의 API 를 요청하면 어떡하나"라는 생각도 들어
어떻게 할까 생각을 좀 해보았다.

## Filter

그렇게 찾아낸 하나의 방법이 `Filter` 이다. Filter 는 Servlet 스펙의 일부로 요청, 응답을 가로채어 필터링하고 변경하는 역할을 하기도 하고,
요청이 Dispatcher Servlet (Controller 로의 매핑) 으로 전달되기 전에 수행되는 작업을 정의할 수도 있다. Dispatcher Servlet 으로 전달되기 전에
수행되는 작업이므로 사실 Spring Context 의 밖이고, 실제로 `Filter` 객체는 "톰캣"에 의해 관리되는 객체이다.

현재 요구 사항에 딱 알맞는 기능을 수행하기 때문에 이를 실제 서비스 코드에 적용해보려고 한다.

```java
@Component
public class ApiPrefixFilter implements Filter {

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        String requestUri = httpRequest.getRequestURI();
        if (requestUri.startsWith("/api/")) {
            String host = ((HttpServletRequest) request).getHeader("Host");
            if (host.equals(GoogleDefine.HOST)) {
                String newUri = "/google" + requestUri.substring(4);
                httpRequest.getRequestDispatcher(newUri).forward(request, response);
            } else {
                chain.doFilter(request, response);
            }
        } else {
            chain.doFilter(request, response);
        }
    }
}
```

위와 같이 코드를 구현하면 모든 request 를 가로채어 Request URI 를 검사하여 `/api` 의 prefix 를 가지는 request 의 경우
Header:Host 를 검사하여 특정 조건의 Host 는 다른 uri 로 바꿔치기하여 forward 해버릴 수 있게 된다. 

예시로 치면 `/api/user` uri 로 요청이 들어온 경우 `/google/user` 로 바꿔치기되어 Dispatcher Servlet 으로 던져진 것이니
Controller 로는 `/google/user` 로 매핑되어 요청이 처리되게 된다.