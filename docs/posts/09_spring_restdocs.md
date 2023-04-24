---
title: "[Spring Boot] - Rest Docs, API 자동 문서화"
date: "2023-04-21"
tag: ["Spring Boot", "Spring Rest Docs"]
---

# Spring Boot API 문서 자동화

만든 API 를 클라이언트가 제대로 사용하게 하려면 메뉴얼 제공은 선택이 아닌 필수다. 하지만 문서를 만드는 건 너무나도 귀찮은 일이다.
그리고 사람은 언제나 실수를 하기 때문에 실제 API 의 기능과 작성한 문서 내용이 다를 수 있다는 문제가 항상 발생한다.
문서가 잘못 작성되어 클라이언트가 개발을 잘못한다면 이래저래 피곤한 일이 많이 생길테니 문서 자동화 시스템을 도입해보자.

## Swagger 를 선택하지 않은 이유

API 문서를 자동화 하는 데에 유명한 프레임워크인 Swagger 를 처음에 사용하였다가 이를 포기하였다. Swagger 가 "프레임워크"이기 때문이라는 것이
가장 큰 이유다. 아무래도 프레임워크이다 보니까 실제 output 페이지를 **커스텀 하는 것에 한계**가 있고, 
**실제 제품 코드에 서비스 로직과 관계 없는 코드가 작성되어야 한다**는 점이 이 프레임워크를 사용하지 않게 하는 이유다.

```java
public class UserController {
    @ApiOperation(value = "회원 삭제") // (1)
    @DeleteMapping('/')
    public ResponseEntity<UserDto> userDelete(
        @ApiIgnore  // (2)
        @RequestHeader(value = "Authorization") String authorization,
        @ApiParam(value = "트랜젝션 구분자", required = true, defaultValue = "abcde") // (3)
        @ReqeustHeader(value = "Transaction-ID") String trxId
    ) {
        // do something to delete user
    }
}
```

(1), (2), (3) 코드는 서비스 로직과는 전혀 관계 없는 코드임에도 제품 코드에 자리하고 있다. 주석이라고 생각하고 읽을 수도 있겠지만 저런 코드가
많아질수록 코드를 읽는 데에 피로감이 없다고는 말 못한다. 심지어 저 코드를 제대로 작성하지 않으면 실제 기능과 API 문서가 제대로 동기화 되지 않기 때문에
휴먼 에러가 발생한다는 점은 해결되지 않는다.


## Spring Rest Docs 도입하기

Spring Rest Docs 는 스프링에서 제공하는 라이브러리로 테스트 코드 작성 시 코드에 맞게 Snippets (adoc 파일)을 자동 생성 해준다.
그리고 자동 생성된 Snippets 를 asciidoctor 라이브러리를 이용하여 원하는 화면 구성을 커스텀하여 HTML 파일로 변환 시켜준다.

의존성을 추가해주자. [Mvn Repository](https://mvnrepository.com/) 사이트에 들어가서 의존성을 가져와줌.
아래 코드를 `dependencies` 에 추가해준다.

```yml
testImplementation group: 'org.springframework.restdocs', name: 'spring-restdocs-mockmvc', version: '3.0.0'
```

이제 Snippets 를 자동 생성할 수 있도록 Test 코드를 작성해주자.

```java
@SpringBootTest
@ExtendWith(RestDocumentationExtension.class)
class UserControllerTest {

    private MockMvc mockMvc;

    @BeforeEach
    public void setup(WebApplicationContext webApplicationContext, RestDocumentationContextProvider restDocumentation) {
        this.mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext)
            .apply(documentationConfiguration(restDocumentation))
            .build();
    }

    @Test
    void getAllUser() throws Exception {
        this.mockMvc.perform(MockMvcRequestBuilders.get("/user")).andExpect(status().isOk())
            .andDo(document("get-user-list", responseFields(
                fieldWithPath("success").type(JsonFieldType.BOOLEAN).description("성공 여부"),
                fieldWithPath("error").type(JsonFieldType.NULL).description("에러 메시지"),
                fieldWithPath("payload").type(JsonFieldType.ARRAY).description("결과"),
                fieldWithPath("payload[].name").type(JsonFieldType.STRING).description("유저 이름"),
                fieldWithPath("payload[].age").type(JsonFieldType.NUMBER).description("유저 나이"),
                fieldWithPath("payload[].address").type(JsonFieldType.STRING).description("유저 주소"),
                fieldWithPath("payload[].school").type(JsonFieldType.STRING).description("다니는 학교 이름")
            )))
            .andReturn();
    }
}
```

테스트 코드다. `@ExtendWith` 어노테이션을 사용하여 restdocs 에서 제공하는 기능들을 사용할 수 있도록 한다.
그리고 `RestDocumentationConfigurer` 를 사용하여 매 테스트 전에 MockMvc 객체를 생성해준다.

실제 테스트 시 `perform()` 메서드를 이용하여 테스트를 할 때 `andDo()` 메서드 안에 `document()` 를 사용하여 문서화를 시킬 내용을 정의해준다.
`document()` 메서드에 아래와 같은 인수를 전달하여 문서화를 수행할 수 있다.

- `requestFields()`: 요청 본문에 대한 필드를 설명
- `responseFields()`: 응답 본문에 대한 필드를 설명
- `pathParameters()`: 경로 변수에 대한 설명을 추가
- `requestParameters()`: 쿼리 매개변수에 대한 설명
- `responseHeaders()`: 응답 헤더에 대한 설명을 추가
- `requestHeaders()`: 요청 헤더에 대한 설명을 추가

테스트 코드를 돌리면 `/build/generated-snippets` 디렉토리 아래에 자동으로 `.adoc` 문서들이 생성된 것으로 볼 수 있다.

![auto generated adocs](/images/posts/09_01.png)

![auto generated adocs_2](/images/posts/09_02.png)

이제 생성된 `.adoc` 문서를 HTML 파일로 자동 변환되도록 작업을 해보자. 이 작업에는 `asciidoctor` 가 필요하다. 
아래 코드를 `build.gradle` 에 추가하여 주자.

```
plugins { 
	id "org.asciidoctor.jvm.convert" version "3.3.2"
}

configurations {
	asciidoctorExt 
}

dependencies {
    asciidoctorExt group: 'org.springframework.restdocs', name: 'spring-restdocs-asciidoctor', version: '3.0.0'
}

ext { 
	snippetsDir = file('build/generated-snippets')
}

test { 
	outputs.dir snippetsDir
}

asciidoctor { 
	inputs.dir snippetsDir 
	configurations 'asciidoctorExt' 
	dependsOn test 
}

bootJar {
  dependsOn asciidoctor
  from ("${asciidoctor.outputDir}/html5") {
    into 'static/docs'
  }
}
```

- `plugins`: `asciidoctor` 플러그인을 적용
- `configurations`: Asciidoctor 를 확장하는 종석성을 위해 `asciidoctorExt` 구성을 선언.
- `dependencies`: `asciidoctorExt` 구성에 `spring-restdocs-asciidoctor` 종속을 추가.
- `ext`: 생성된 snippets 위치를 정의
- `test`: 테스트 디렉토리를 출력으로 추가하도록 테스트 작업 구성
- `asciidoctor`: asciidoctor 작업 구성. 정의한 snippets 위치를 `inputs.dir` 에 구성하고, 확장을 위해 `asciidoctorExt` 을 사용. 마지막으로 `asciidoctor` 기능이 'test' 작업에 의존하도록 함.
- `bootJar`: jar 파일이 빌드되기 전에 `asciidoctor` 에 의존하도록 하고, 자동 생성된 문서는 jar 파일 내 `static/docs` 디렉토리에 복사하도록 함.

이제 `src/docs/asciidoc` 디렉토리를 생성하고 `.adoc` 파일을 생성한다. 그리고 아래 내용을 입력한다.

```adoc
= Demo API documentation

== User (/user)

=== 유저 리스트 조회

유저 리스트를 조회하는 API.

include::{snippets}/get-user-list/http-request.adoc[]
include::{snippets}/get-user-list/response-fields.adoc[]
include::{snippets}/get-user-list/response-body.adoc[]
```

이제 빌드해보자. `$ ./gradlew build`. `build/docs/asciidoc` 디렉토리 아래에 자동 생성된 `sample.html` 파일을 볼 수 있고,
".adoc" 파일에 정의한 형태로 페이지가 잘 나온 것을 볼 수 있다.

![ddd](/images/posts/09_03.png)

자동 생성된 "sample.html" 파일을 열어보면

![ddd](/images/posts/09_04.png)

위와 같은 화면이 나온다.

## 주목할만한 장점

문서를 작성함에 있어 자유도가 보장된다. 단순히 API 정의와 사용법에 대해서만 제공한다면 Swagger 가 훨씬 더 좋을 수 있다.
하지만 일반적으로 문서는 API 정의 뿐 아니라 다른 많은 내용을 포함하고 있을 수 있다.
Swagger 는 프레임워크이기 때문에 정해진 틀이 있어 그런 부가적인 내용을 작성하기 매우 어렵다.
하지만 Spring Rest Docs 는 adoc 파일에 원하는 내용을 작성하면 항상 그 내용이 자동 문서화된 결과물에 포함된다.

```adoc
= Demo API documentation

== Common Response

`success`, `error`, `payload` 는 모든 응답에 포함됩니다.
[source,options="nowrap"]
----
{
    "success": true,
    "error": null,
    "payload": "Hello Demo!"
}
----

[cols="25,10,~". options="header"]
|===
|Name|Type|Description
|success|boolean|응답 성공 여부 성공=true, 실패=false
|error|String or null|success=false 일 시 에러 메시지. +
success=true 면 null
|payload|Object or null|success=true 일 시 요청에 맞는 응답 +
success=false 면 null
|===

== Authorization

모든 요청은 "Basic Authentication" 를 기반으로 검증됩니다.

`Base64(<client-id>:<client-secret>)`

사전에 전달받은 "client-id"와 "client-secret" 을 바탕으로 위 작업을 수행하여 문자열을 생성한 후
`Authorization` 헤더에 문자열을 포함하여 요청하도록 한다.
```

![custom adoc html](/images/posts/09_05.png)

근본이 되는 파일이 adoc 문서이다보니 아주 자유도 높은 문서를 작성할 수 있음.

또한 테스트 코드를 기반으로 작성되다보니, 빌드 과정에서 API 를 `perform()` 하였을 때의 결과가 `andDo()` 내에 정의한 포맷과 다를 경우
에러가 발생되어 빌드가 되지 않아 동기화를 강요받게 된다.

예를 들어 유저 리스트를 조회할 때 "age" 필드는 숫자가 나오도록 되어 있다. `fieldWithPath("payload[].age").type(JsonFieldType.STRING)` 으로
실제 응답과는 다른 타입으로 문서를 정의해본다.

```java
@SpringBootTest
@ExtendWith(RestDocumentationExtension.class)
class UserControllerTest {

    private MockMvc mockMvc;

    @BeforeEach
    public void setup(WebApplicationContext webApplicationContext, RestDocumentationContextProvider restDocumentation) {
        this.mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext)
            .apply(documentationConfiguration(restDocumentation)
            .operationPreprocessors()
            .withRequestDefaults(prettyPrint())
            .withResponseDefaults(prettyPrint()))
            .build();
    }

    @Test
    void getAllUser() throws Exception {
        this.mockMvc.perform(MockMvcRequestBuilders.get("/user")).andExpect(status().isOk())
            .andDo(document("get-user-list", responseFields(
                fieldWithPath("success").type(JsonFieldType.BOOLEAN).description("성공 여부"),
                fieldWithPath("error").type(JsonFieldType.NULL).description("에러 메시지"),
                fieldWithPath("payload").type(JsonFieldType.ARRAY).description("결과"),
                fieldWithPath("payload[].name").type(JsonFieldType.STRING).description("유저 이름"),  // <-- 실제론 NUMBER 지만, STRING 으로 정의해봄
                fieldWithPath("payload[].age").type(JsonFieldType.STRING).description("유저 나이"),
                fieldWithPath("payload[].address").type(JsonFieldType.STRING).description("유저 주소"),
                fieldWithPath("payload[].school").type(JsonFieldType.STRING).description("다니는 학교 이름")
            )))
            .andReturn();
    }
}
```

그리고 `./gradlew build` 해보면 테스트 과정에서 `getAllUser()` 에서 에러가 발생하였다고 한다.

![test error](/images/posts/09_06.png)

심지어 뭐가 안맞는지도 잘 알려줌.

![test error reason](/images/posts/09_07.png)

이런 식으로 빌드 과정에서 에러가 발생하기 때문에 개발자는 제대로 된 테스트 코드를 작성하기를 강요받아 API 문서가 실제 코드와 일치함을 보장할 수 있다.
물론, 특정 API 에 대해 테스트 코드를 아예 작성하지 않는다면 에러가 발생하지 않긴 하다. Spring Rest Docs 를 도입하고 겸사겸사 테스트 코드를 작성하는 것을
습관화 하여 두 마리 토끼를 잡아 보는 것은 어떨까?