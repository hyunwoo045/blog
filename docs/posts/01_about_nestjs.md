---
title: "NestJS 시작하기"
date: "2022-03-01"
tag: ["Nest.js", "TypeORM"]
---

# NestJS 시작하기

`Nest.js` 는 TypeScript 를 기반으로 한 서버 사이드 웹 프레임워크이다. 다른 Node.js 웹 프레임워크들과 달리 의존성 주입과 같은
객체 지향적인 언어의 프레임워크들에서나 볼 법한 기능들을 지원하여 객체 지향적인 구현을 할 수 있도록 해주기 때문에
코드 유지보수와 가독성을 향상 시킨다는 장점이 있는 프레임워크이다.

이번 포스트에서는 `Nest.js` 의 일부 개념과 구조를 공부한 것을 간단히 정리해보고자 한다.

## Provider

`Nest.js` 에서 가장 근본이 되는 개념으로 애플리케이션에 필요한 객체를 제공하는 클래스이며 주로 의존성 주입 패턴을 사용하여 관리된다.
거의 대부분의 백엔드 프로젝트는 Client 의 요청을 받고 응답을 내보내는 `Controller`를 가지고 있다. 그리고 코드의 가독성과 재사용성을
위해 핵심 비즈니스 로직, 로깅, 데이터베이스의 CRUD 등의 코드들을 `Controller`로 부터 분리하게 된다. 이 때부터 `Controller` 는 특정 객체로부터
기능(function)을 가져와야 하기 때문에 **'의존성'**이 생길 수 밖에 없게 된다.

의존성 관리는 어렵다. 멋 모르고 막 의존성을 연결하다보면 후에 유지 보수 시에 예기치 못한 곳에서 버그가 발생하기도 한다. 이렇게 생길 수 있는 문제를
미연에 방지하고자 프레임워크들은 기능을 제공해주곤 하는데, Spring 도 그렇고 Nest.js 에서는 의존성 주입을 프레임워크 레벨에서 처리해준다.
그 말인 즉슨 개발자는 그저 `Controller` 에 주입할 객체들을 프레임워크가 정한 대로 구현하기만 하고, 나머지 생명주기(초기화, 소멸 등)에 대해서는
프레임워크가 알아서 관리한다는 것이다.

## Modules

Nestjs 어플리케이션은 `Module`로 통칭하는 Feature 들을 모아서 하나의 큰 `Module` (`Application Module`) 을 구성하는
방식, 일종의 트리 형태로 구성됩니다. 일종의 Root 모듈 역할을 할 `Module`을 생성합니다.

```typescript
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.SERVER_MODE == 'dev' ? '.env.dev' : '.env.local'
    }),
    TypeOrmModule.forRoot({
      type: "mariadb",
      host: process.env.COVAX_DB_HOST,
      port: +process.env.COVAX_DB_PORT,
      database: "covax-db",
      entities: [
        // ...
      ],
      synchronize: true,
    }),
    ResourcesModule,
    CenterModule,
    ReportsModule
  ]
})
export class AppModule {}
```

`@Module` 데코레이터를 확장하는 방식으로 필요한 모듈들을 전부 가져옵니다. 후술할 `TypeOrm` 의 모듈도 환경에 맞는 설정을
입력해주고 가져옵니다.

하위 모듈에서는 실제 기능에 필요한 `Feature` 들을 모은다는 느낌으로 모듈이 구성됩니다.

```typescript
@Module({
  imports: [
    TypeOrmModule.forFeature([
      // 해당 모듈에서 사용될 entity 들을 등록해주어야 함
    ]),
  ],
  controllers: [ResourcesController],
  providers: [
    HistoryService,
    Logger
  ],
})
export class ResourcesModule {
}
```

## Controllers, Providers

`Controller`와 `Provider` 역시 일종의 Feature 로써 모듈에 등록됩니다. 하지만 각각의 역할이 뚜렷하면서도 핵심적이기 떄문에
기타 다른 프레임워크에서도 특별히 다루게 되는 경향이 있는 것 같습니다.

`Controller` 는 HTTP Request 를 받고 Response 를 내보내주는 역할을 합니다.

```typescript
@Controller('resource')
export class ResourcesController {
    constructor(
        private readonly historyService: HistoryService
    ) {
    }

    @Post('/pakcage')
    async createPackageHistory(@Body() reqData: newPackageReqeustDto): Promise<object> {
        const data: object = newPackageRequestDto.data;
        return await this.historyService.create(data);
    }
}
```

`historyService` 라는 `HistoryService` 의 인스턴스 의존성을 주입받고 있습니다. 이는 `ResourcesModule` 에
등록이 되어 있는 `Provider` 임을 알 수 있습니다.

`Provider` 는 서비스, 레파지토리 등과 같은 복잡한 핵심 비즈니스 로직을 
`Controller` 로부터 분리하여 대신 수행해주는 역할을 합니다.

```typescript
@Injectable()
export class HistoryService {
    constructor(
        @InjectEntityManager() private dataSource: DataSource,
        @InjectRepository(PackageDetectHistory) private packageHistoryRepo: Repository<PackageDetectHistory>
    ) {
    }
    
    async newHistory(data: object) {
        const history: PackageDetectHistory = new PackageDetectHistory();
        return await this.packageHistoryRepo.save(history);
    }
}
```