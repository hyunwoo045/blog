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
기능(function)을 가져와야 하기 때문에 **의존성**이 생길 수 밖에 없게 된다.

의존성 관리는 어렵다. 멋 모르고 막 의존성을 연결하다보면 후에 유지 보수 시에 예기치 못한 곳에서 버그가 발생하기도 한다. 이렇게 생길 수 있는 문제를
미연에 방지하고자 프레임워크들은 기능을 제공해주곤 하는데, Spring 도 그렇고 Nest.js 에서는 의존성 주입을 프레임워크 레벨에서 처리해준다.
그 말인 즉슨 개발자는 그저 `Controller` 에 주입할 객체들을 프레임워크가 정한 대로 구현하기만 하고, 나머지 생명주기(초기화, 소멸 등)에 대해서는
프레임워크가 알아서 관리한다는 것이다.

`Provider` 에는 Service, Repository, Factory 등의 하위 개념으로 나눌 수 있다. `Provider` 객체는 `@Injectable` 데코레이터를 붙힘으로써
Nest.js 런타임에 권한을 위임한다.

```typescript
@Injectable()
export class UserService {
    constructor() {}
    
    async getAllUsers(): Promise<User[]> {
        // ...
    }
}
```

```typescript
@Controller('user')
export class UserController {
    constructor(
        private readonly userService: UserService) {
    }
}
```

`Repository`를 생성하고 `Service`에 주입하는 등의 방식처럼 `Provider`에 `Provider`를 주입하는 것도 물론 가능하다.

```typescript
@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>
    ) {
    }
}
```

이러한 방식으로 복잡한 `Provider` 의 구조를 만들 수도 있게 된다.

![Nested Provider](/images/projects/01_03.png)

그림 출처: [Provider | Nest.js Documentation](https://docs.nestjs.com/providers)

`Provider`를 생성하였고, 이를 소모하는 `Consumer`가 있다면 이제 이들을 Nest 에 등록해주는 절차를 거쳐야 한다. `Module` 정의를 수정함으로써
등록할 수 있다.

```typescript
@Module({
    controllers: [UserController],
    providers: [UserService]
})
export class AppModule {}
```

## Controller

`Controller` 는 클라이언트의 요청을 처리하고 응답을 반환하는 역할, 즉 어플리케이션의 최전단에서 클라이언트를 응대하는 기능을 수행한다.
`@Controller()` 데코레이터가 선언된 객체는 Controller 임을 의미하게 되며, 이는 바로 위 코드에서 알 수 있듯이 `Module` 에 등록해야 사용이 가능하다.

```typescript
@Controller('user')
export class UserController {
    constructor(
        private readonly userService: UserService
    ) {
    }
    
    @Get()
    findAllUser(@Req() request: Request): User[] {
        return this.userService.getAllUsers();
    }
}
```

## Module

`Module`은 위에서 언급한 대로 `Provider`와 `Controller`를 등록받고 그들의 구조를 구성하는 기능을 수행한다. 반드시 하나의 "Root Module"을 가지며
일반적으로 `src/app.module.ts` 에 정의된다.

![Nested Mdoule](/images/projects/01_04.png)

위에서 작성한 것처럼 `UserController`와 `UserService`가 있다고 할 때 이를 무분별하게 모두 Root Module 에 등록하지 말고 별도로 타입을 가지는 
모듈을 작성하고 그 모듈을 Root Module 에 연결하는 것을 권장한다.

```typescript
@Module({
    controllers: [UserController],
    providers: [UserService]
})
export class UserModule {}
```

```typescript
@Module({
    imports: [UserModule]
})
export class AppModule {}
```

---

Nest.js 에서 가장 핵심이 되는 개념들을 아주 간략하게 정리해보았다. 이 정도 개념만 알고 있어도 클라이언트와 소통할 수 있는 API 어플리케이션을 만드는
기초 코드를 작성하는데 문제가 없을 것이라 생각된다.