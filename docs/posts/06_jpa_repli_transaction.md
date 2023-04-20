---
title: "[Spring JPA] - Replication 과 Transaction"
date: "2023-04-20"
tag: ["Spring Boot", "Spring Data JPA"]
---

# Spring JPA - Replication 과 Transaction

서비스를 운영하다보면 갑작스럽게 많은 요청이 들어오기도 하고, 아니면 단순히 서비스가 커져서 평균 요청 수가 많아지기도 하고 어쨌든
데이터베이스 성능이 서비스를 감당하지 못하는 순간이 오게 된다. 이 때 단순히 데이터베이스의 성능을 올릴 수도 있고 (수직적 확장),
Sharding, Replication 과 같은 개념을 이용하여 수평적으로 확장할 수도 있다. 

이번 글에서는 `Replication` 개념이 적용된 데이터베이스 구조를 Spring Boot 에 설정하는 방법과 트랜젝션의 성격에 따라 각기 다른 
데이터베이스에 로드되게 하는 법을 정리해보겠다.

## Replication

말 그대로 데이터베이스의 복제다. 데이터베이스 서버가 여러 대 있을 때 하나의 서버에서 수행된 변경 (Write, Update) 을
다른 모든 데이터베이스에 적용하는 기술이다. 위에서 언급한 것처럼 데이터베이스의 수평적 확장이 필요할 때 주로 사용된다.

아래와 같은 장점들이 있지만,

1. 데이터베이스 서버들 중 일부가 중단되더라도 다른 데이터베이스로 요청을 전달하여 서비스를 지속시킬 수 있다.
2. 읽기 요청을 병렬로 처리하도록 하여 응답 시간을 단축할 수 있다.
3. 데이터가 유실되더라도 복구할 수 있다.

아래와 같은 단점도 있기 때문에 서비스의 성격에 따라 도입 여부를 고민할 수 있겠다.

1. 모든 데이터베이스들이 항상 동일한 상태임을 확신할 수 없다.
2. 동시성 문제로 쓰기 작업을 하는 데이터베이스는 하나만 수행 (보통 Master 가 함)
3. 1번 문제로 파생되는 문제로 데이터의 일관성 문제가 발생할 수도 있다.

그러니까 결국은 동기화의 문제인데 사실 한 데이터로 짧은 시간에 많은 쿼리가 동시에 이루어지지 않는 이상 문제 될 게 있을까 싶긴 함.

## Spring Boot 프로젝트에 적용하기

프로젝트에 적용하는 설정법을 알아보자. 우선 목적은 쓰기 성격의 Transaction 은 마스터 인스턴스로, 나머지 읽기 트랜젝션은 슬레이브 인스턴스로 로드시키는 것을
목적으로 설정한다. 읽기 전용 트랜젝션을 마스터 서버로 전혀 보내지 않는 것은 읽기 작업 때문에 쓰기 작업이 누락된다면 대재앙이기 때문이다.
(읽는 것은 실패하면 다시 읽어오면 되지만, 쓰는 건 다시 쓸 수가 없다ㄷㄷ)

실제 데이터베이스 구조는 이미 Replication 작업이 완료되었다고 가정하고, Master 데이터베이스의 url 은 `rdb.localhost`,
Slave 데이터베이스의 url 은 `rdb-ro.localhost`라고 치고, `application.yml` 를 작성해보자.

```yml
spring:
  datasource:
    use-slave: true
    master:
      hikari:
        jdbc-url: jdbc:mariadb://rdb.localhost
        driver-class-name: com.mysql.cj.jdbc.Driver
        read-only: false
        username: root
        password: 1234
    slave:
      hikari:
        jdbc-url: jdbc:mariadb://rdb-ro.localhost
        driver-class-name: com.mysql.cj.jdbc.Driver
        read-only: true
        username: root
        password: 1234
```

이제 스프링부트 프레임워크에서 자동으로 DataSource 를 설정해 줄 수 있는 형태를 벗어났기 때문에 직접 DataSource 설정을 해주어야 한다.

Master 소스 설정.

```java
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

Slave 소스 설정.

```java
@Configuration
public class SlaveDataSourceConfig {

    @Primary
    @Bean(name = "slaveDataSource")
    @ConfigurationProperties(prefix = "spring.datasource.slave.hikari")
    public DataSource slaveDataSource() {
        return DataSourceBuilder.create()
            .type(HikariDataSource.class)
            .build();
    }
}
```

이제 트랜젝션 성격에 따라 다른 `DataSource`로 routing 되도록 설정 해야함. 여기서 스프링에서 제공하는 `AbstractRoutingDataSource` 객체와
`TransactionSynchronizationManager` 객체를 이용한다.

- `AbstractRoutingDataSource` : 데이터베이스 라우팅 기능을 제공하는 추상 클래스. `determineCurrentLookupKey()` 메서드를 통해 `ThreadLocal` 기반 컨텍스트 환경에서 현재 데이터베이스를 식별하는 객체를 반환하도록 구현됨.
- `TransactionSynchronizationManager`: 트랜젝션 동기화를 위한 클래스로 `ThreadLocal` 을 이용하여 현재 트랜젝션과 관련된 리소스에 대한 참조를 확인할 수 있다.

```java
public enum DataSourceType {
    Master, Slave
}
```

```java
public class ReplicationRoutingDataSource extends AbstractRoutingDataSource {

    @Value("${spring.datasource.use-slave:false}")
    private boolean useRdbSlave;

    @Override
    protected Object determineCurrentLookupKey() {
        if(useRdbSlave) return TransactionSynchronizationManager.isCurrentTransactionReadOnly() ? DataSourceType.Slave : DataSourceType.Master;
        else return DataSourceType.Master;
    }
}
```

Routing 설정을 마무리하자.

```java
@Configuration
@RequiredArgsConstructor
@EnableJpaRepositories(   // (1)
    basePackages = "com.example.demo.repository",
    entityManagerFactoryRef = "jpaEntityManagerFactory",
    transactionManagerRef = "jpaTransactionManager"
)
public class RoutingDataSourceConfig {
    private final Environment env;

    @Value("${spring.datasource.use-slave:false}")
    private boolean useRdbSlave;

    // (2)
    @Bean(name = "routingDataSource")
    public DataSource routingDataSource(
        @Qualifier("masterDataSource") final DataSource masterDataSource,
        @Qualifier("slaveDataSource") final DataSource slaveDataSource
    ) {
        ReplicationRoutingDataSource routingDataSource = new ReplicationRoutingDataSource();
        Map<Object, Object> dataSourceMap = new HashMap<>();

        dataSourceMap.put(DataSourceType.Master, masterDataSource);
        if(useRdbSlave) dataSourceMap.put(DataSourceType.Slave, slaveDataSource);

        routingDataSource.setTargetDataSources(dataSourceMap);
        routingDataSource.setDefaultTargetDataSource(masterDataSource);

        return routingDataSource;
    }

    // (3)
    @Bean(name = "dataSource")
    public DataSource dataSource(@Qualifier("routingDataSource") DataSource routingDataSource) {
        return new LazyConnectionDataSourceProxy(routingDataSource);
    }

    // (4)
    @Bean(name = "jpaEntityManagerFactory")
    public LocalContainerEntityManagerFactoryBean entityManagerFactory(@Qualifier("dataSource") DataSource dataSource) {
        Map<String, Object> prop = new HashMap<>();
        prop.put("hibernate.physical_naming_strategy", SpringPhysicalNamingStrategy.class.getName());
        prop.put("hibernate.implicit_naming_strategy", SpringImplicitNamingStrategy.class.getName());
        prop.put("hibernate.hbm2ddl.auto", env.getProperty("spring.jpa.hibernate.ddl-auto"));

        LocalContainerEntityManagerFactoryBean em = new LocalContainerEntityManagerFactoryBean();
        em.setJpaVendorAdapter(new HibernateJpaVendorAdapter());
        em.setDataSource(dataSource);
        em.setPackagesToScan("com.example.demo.jpa.entity");
        em.setPersistenceUnitName("jpaEntityManager");
        em.setJpaPropertyMap(prop);

        return em;
    }

    // (5)
    @Bean(name = "jpaTransactionManager")
    public PlatformTransactionManager jpaTransactionManager(EntityManagerFactory entityManagerFactory) {
        JpaTransactionManager transactionManager = new JpaTransactionManager();
        transactionManager.setEntityManagerFactory(entityManagerFactory);
        return transactionManager;
    }
}
```

- (1): `@EnableJpaRepositories` 는 Repository 를 검색하고 Spring Bean 으로 등록하는 데에 사용됨. 코드의 경우 `com.example.demo.repository` 아래에 있는 Repository 들을 등록하도록 되어 있다.
또한 EntityManagerFactory 와 TransactionManager 로 참조할 Bean 또한 등록한다.
- (2): `routingDataSource()` 메서드는 `ReplicationRoutingDataSource` 객체를 생성하고 DataSource 를 매핑할 정보를 입력하여 반환.
- (3): `dataSource()` 메서드는 애플리케이션이 시작된 시점에 커넥션을 풀을 미리 생성하지 않고, 처음으로 커넥션을 요청할 때 까지 대기하도록 하여 불필요한 연결이 없도록 하고, 어플리케이션 초기 구동 속도를 빠르게 한다.
- (4): `entityManagerFactory()` 는 JPA 를 사용하기 위한 EntityManagerFactory 를 설정한다.
- (5): `jpaTransactionManager()` 는 EntityManagerFactory 를 사용하는 JpaTransactionManager 객체를 생성한다.

## @Transactional

`@Transactional` 어노테이션은 트랜젝션을 처리를 위해 사용된다. 메서드 레벨에 사용하여 메서드 시작 전에 트랜젝션을 시작하고, 실행이 끝나면 커밋하는 방식이다.
메서드 실행 도중 예외가 발생하면 트랜젝션은 롤백된다. 여기서 `readOnly` 속성을 통해 트랜젝션이 읽기 전용이어야 하는 가에 대한 여부를 결정 지을 수 있다.

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

    @Transactional   // (1)
    @PostMapping(value = "")
    public ResponseEntity<Void> createUser(
        @RequestBody CreateUserReq request
    ) {
        String name = request.getName();
        int age = request.getAge();
        String address = request.getAddress();

        this.userService.createUser(name, age, address);

        return ResponseEntity.status(HttpStatus.OK).body(null);
    }

    @Transactional(readOnly = true)  // (2)
    @GetMapping(value = "")
    public ResponseEntity<UserListRes> getAllUser() {
        List<User> users = this.userService.findAll();
        UserListRes res = new UserListRes();
        res.toResponse(users);

        return ResponseEntity.status(HttpStatus.OK).body(res);
    }
}
```

- (1): 쓰기 전용 Transaction 임을 알려줌. `readOnly` 는 false 가 default 이다.
- (2): 읽기 전용 Transaction 임을 알려줌.