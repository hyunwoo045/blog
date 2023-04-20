---
title: "Spring Boot JPA 사용해보기"
date: "2023-04-20"
tag: ["Spring Boot", "Spring JPA"]
---

# Spring Boot JPA 사용해보기

이번 포스트는 실제 업무에 JPA 를 사용하기 위해 공부한 내용을 간단히 정리한다.

JPA 는 자바 진영에서 사용하는 ORM 기술의 표준이다. ORM 기술이 무엇이고 어떤 점이 좋은 지 이 전에 포스트에서 아주 간단히 적어본 적이
있다. ([보러 가기](https://hyunwoo045.vercel.app/posts/02_typeorm))
이를 구현한 인터페이스가 여러 가지가 있지만 이번에는 `Hibernate` 로 구현한다.

## Dependency 추가

필요한 Dependency 를 [MVN REPOSITORY](https://mvnrepository.com/) 에서 가져와준다.
아래 줄들을 `build.gradle` 파일에 `dependencies` scope 안에 입력해줌.

```text
implementation group: 'org.springframework.boot', name: 'spring-boot-starter-data-jpa', version: '3.0.5'
implementation group: 'org.mariadb.jdbc', name: 'mariadb-java-client', version: '3.1.3'
```

그리고 `application.properties` 에 관련하여 설정을 추가해준다.

```text
spring.datasource.url=jdbc:mariadb://localhost:3306/demo
spring.datasource.username=root
spring.datasource.password=1234
spring.datasource.driver-class-name=org.mariadb.jdbc.Driver

spring.jpa.show-sql=true
spring.jpa.hibernate.ddl-auto=validate
```

`spring.datasource` 의 설정을 넣어주면 스프링이 알아서 데이터베이스와 연결하여 커넥션 풀을 만들어준다.

`spring.datasource.driver-class-name` 은 어떤 클래스가 데이터베이스와의 연결을 수행해 줄 것인지에 대한 정의이므로, `build.gradle` 에
의존성에 추가했던 `org.mariadb.jdbc` 그룹에서 `Driver` 를 명시해준다.

`spring.jpa.show-sql` 를 `true`로 설정해두면 메서드로 어떤 쿼리가 실행되는지 콘솔 로그로 확인이 가능하다.

`spring.jpa.hibernate.ddl-auto` 는 개발자가 객체로 표현한 Entity 구조가 실제 데이터베이스와 다를 시 어떤 액션을 취할 것이냐에 대한 설정이다.

- `create`: 기존 테이블을 삭제하고 다시 생성
- `create-drop`: 기존 테이블을 삭제하고 다시 생성, 어플리케이션 종료 시점에 삭제
- `update`: 변경된 부분만 반영
- `validate`: 객체와 테이블이 일치하는지 확인. 틀리면 어플리케이션이 실행되지 않음

4가지 옵션이 있지만, 가급적 그 어떤 환경에서든, 심지어 로컬이라도 `validate` 옵션을 사용하는 것이 좋은 것 같다. 나머지 옵션들은 대형 사고를 내기 딱 좋음.

## Entity 만들기

이런 테이블을 만들었다고 해보자.

```sql
create table demo.tbl_user
(
    idx     int auto_increment
        primary key,
    name    varchar(10)  not null,
    age     int          not null,
    address varchar(255) not null
)
```

이 테이블을 자바 객체로 매핑하기 위해서는 `@Entity` 어노테이션을 사용한다.

```java
@Entity
@Table(name = "tbl_user")
@Getter @Setter
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idx;
    
    private String name;
    private int age;
    private String address;
}
```

`@Table` 어노테이션으로 실제 DB에 테이블이 명이 뭔지 전달해줌. `@Id` 어노테이션으로 필드가 Primary key 임을 알려주고,
`@GeneratedValue` 로 Auto Increment 설정임을 알려줌.

객체를 만들었다면 쿼리 메서드를 사용할 수 있도록 레파지토리 인터페이스를 생성한다.

```java
public interface UserRepository extends JpaRepository<User, Integer> {}
```

겨우 하나의 객체와, 하나의 인터페이스를 만들었을 뿐인데 CRUD 를 할 준비를 마쳤다. 쿼리 메서드를 사용해보자.

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

    public void createUser(String name, int age, String address) {
        User user = new User();
        user.setName(name);
        user.setAge(age);
        user.setAddress(address);
        this.userRepo.save(user);  // (1)
    }

    public List<User> findAll() {
        return this.userRepo.findAll();  // (2)
    }
}
```

`(1), (2)` 코드에서 쿼리 메서드를 사용한다. 아주 간단한 쿼리라면 인터페이스에서 기본적으로 제공하는 메서드로도 충분히 데이터를 처리할 수 있다.

## 관계 설정하기

이런 테이블도 만들었다고 해보자.

```sql
create table demo.tbl_school
(
    idx     int auto_increment
        primary key,
    name    varchar(20)  not null,
    address varchar(255) not null
);
```

유저가 다니는 학교를 명시할 것이기 때문에 이전에 만든 `tbl_user` 테이블은 `tbl_school` 과 N:1 의 관계가 되도록 수정. 그래서 각각 테이블은
아래 그림과 같은 모양이 된다.

![tbl_user](/images/posts/05_01.png)

![tbl_school](/images/posts/05_02.png)

데이터베이스 구조가 완성되었으니 이를 자바 객체로 매핑해보자.

`tbl_school` 은 아래와 같이 구현된다.

```java
@Entity
@Table(name = "tbl_school")
@Getter @Setter
public class School {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idx;

    private String name;
    private String address;
}
```

`tbl_user`:`tbl_school`= N:1 관계이므로 `tbl_user` 에는 `@ManyToOne` 어노테이션을 활용해줌.

```java
@Entity
@Table(name = "tbl_user")
@Getter
@Setter
public class User {
    @Id
    @GeneratedValue(
        strategy = GenerationType.IDENTITY
    )
    private Integer idx;

    private String name;
    private int age;
    private String address;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "school", referencedColumnName = "idx")
    private School school;
}
```

`FetchType` 은 관계 엔티티를 가져올 때의 전략을 지정하는 것이다. `LAZY` 는 예시에서 `School` 객체를 실제로 사용될 때까지 로딩을 지연한다는 의미이다.
외에 `EAGER` 가 있는데, LAZY 와 반대로 관계를 항상 join 하여 즉시 로딩하며 이는 성능 이슈를 발생시킬 수 있기 때문에 정말 필요한 경우가 아니면
사용하지 않는 것이 좋다.

데이터를 가져와보자

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

    public List<User> findAll() {
        return this.userRepo.findAll();
    }
}
```

```java
@RestController
@RequestMapping("/user")
public class UserController {

    final UserService userService;

    @Autowired
    public UserController(
        UserService userService
    ) {
        this.userService = userService;
    }

    @GetMapping(value = "")
    public ResponseEntity<UserListRes> getAllUser() {
        List<User> users = this.userService.findAll();
        UserListRes res = new UserListRes();
        res.setUsers(users);

        return ResponseEntity.status(HttpStatus.OK).body(res);
    }
}
```

```java
@Getter
@Setter
public class UserListRes {

    List<UserInfo> users = new ArrayList<>();

    public void setUsers(List<User> list) {
        for (User user : list) {
            UserInfo u = new UserInfo(
                user.getName(),
                user.getAge(),
                user.getAddress(),
                user.getSchool().getName()
            );
            this.users.add(u);
        }
    }

    @AllArgsConstructor
    @Getter @Setter
    private static class UserInfo {
        String name;
        int age;
        String address;
        String schoolName;
    }
}
```

```json
//GET http://localhost:8080/user 의 결과

{
  "users": [
    {
      "name": "hwkim",
      "age": 17,
      "address": "Yong-In Gi-Heung",
      "schoolName": "Seoul"
    },
    {
      "name": "mjyang",
      "age": 17,
      "address": "Yong-In Gi-Heung",
      "schoolName": "Seoul"
    },
    {
      "name": "teddy bear",
      "age": 1,
      "address": "Yong-In Gi-Heung",
      "schoolName": "Korea"
    },
    {
      "name": "relolo",
      "age": 20,
      "address": "Yong-In Gi-Heung",
      "schoolName": "Korea"
    }
  ]
}
```

원하는 결과가 잘 나왔다.

`tbl_school` 에는 별 다른 관계를 설정하지 않았다. 하지만 만약 예를 들어 "학교 내 학생 리스트"를 필요로 한다고 하면 1:N 의 관계를 설정할 필요가 있다.
`@OneToMany` 어노테이션을 사용하여 관계를 표현해보자.

```java
@Entity
@Table(name = "tbl_school")
@Getter @Setter
public class School {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idx;

    private String name;
    private String address;

    @OneToMany(
        mappedBy = "school"
    )
    private List<User> users;
}
```

`@OneToMany` 어노테이션에 mappedBy 필드는 양방향 관계를 설정할 때 사용하는 것이며, 실제 데이터베이스 테이블에는 해당 관계가 나타나지 않을 때
사용한다. 값은 관계를 관리하는 객체에 정의되어 있는 필드명을 입력한다. `User` 객체에 `@ManyToOne` 어노테이션으로 `School school` 필드가
있으므로 "school" 를 입력해줌.

이제 데이터를 가져와보자.

```java
@Service
@RequiredArgsConstructor
public class SchoolService {

    private final SchoolRepository schoolRepo;

    public List<User> getStudentList(String name) {
        School s = this.schoolRepo.findByName(name);

        return s.getUsers();
    }
}
```

```java
@RestController
@RequestMapping(value = "/school")
public class SchoolController {

    final SchoolService schoolService;

    @Autowired
    public SchoolController (
        SchoolService schoolService
    ) {
        this.schoolService = schoolService;
    }

    @GetMapping("/{name}/students")
    public ResponseEntity<StudentListRes> getStudents(
        @PathVariable(name = "name") String name
    ) {
        List<User> users = schoolService.getStudentList(name);
        StudentListRes res = new StudentListRes();
        res.setStudents(users);

        return ResponseEntity.status(HttpStatus.OK).body(res);
    }
}
```

```java
@Getter @Setter
public class StudentListRes {

    List<StudentInfo> students = new ArrayList<>();

    public void setStudents(List<User> list) {
        for (User user : list) {
            StudentInfo info = new StudentInfo();
            info.setName(user.getName());
            info.setAge(user.getAge());
            info.setAddress(user.getAddress());
            students.add(info);
        }
    }

    @Getter
    @Setter
    private static class StudentInfo {
        private String name;
        private int age;
        private String address;
    }
}
```

```json
// http://localhost:8080/school/Seoul/students 의 결과

{
  "students": [
    {
      "name": "hwkim",
      "age": 17,
      "address": "Yong-In Gi-Heung"
    },
    {
      "name": "mjyang",
      "age": 17,
      "address": "Yong-In Gi-Heung"
    }
  ]
}
```