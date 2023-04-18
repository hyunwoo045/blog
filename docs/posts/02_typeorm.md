---
title: "TypeORM 개념 정리 및 사용해보기"
date: "2023-04-18"
tag: ["TypeScript", "Nest.js", "TypeORM"]
---

# TypeORM 개념 정리 및 사용해보기

Nest.js 프로젝트에 TypeORM 을 도입해보자.

참고 문서

- [TypeORM | Nest.js Documentation](https://docs.nestjs.com/recipes/sql-typeorm)

## ORM (Object Relational Mapping)

관계형 데이터베이스의 테이블을 어플리케이션에서 사용하고자 할 때, 객체 지향적인 언어에서는 이를 객체로 표현하고자 하게 된다.

```typescript
export class User {
    id: number;
    name: string;
    age: number;
    address: string;
}
```

하지만 근본적으로 프로그래밍 언어에서 작성한 객체와 데이터베이스의 테이블을 서로 호환되도록 할 것을 고려하고 각각 만들어진 것이 아니기 때문에
필연적으로 불일치가 발생할 수 밖에 없다. 이런 문제를 ORM 은 객체와 관계형 데이터베이스의 테이블을 자동으로 연결시켜주어 불일치를 해결시켜 준다.
그 말은 곧 개발자는 객체를 개발하는 것에 더 집중할 수 있게 되고, 또한 객체 지향적인 코드로 작성되기 때문에 코드 가독성이 올라가고 재사용하기 편하여
유지보수의 편리성이 증가하게 된다. 

물론, 사용하기 편한 것에는 성능에 관한 이슈가 따르기 마련인데 이 역시 프로젝트가 복잡해지면 복잡해질수록
잘못 구현되면 속도 저하를 야기할 수 있다는 것을 주의해야 한다. 또한, 어쨌든 객체지향적 언어와 관계형 데이터베이스는 태생부터 근본이 다르기 때문에
극복이 불가능한 불일치 또한 감안해야 한다. 예를 들어, 여러 객체들로 데이터베이스를 표현한다고 할 때에, 때에 따라서는 (1) RDB의 테이블 수보다
객체가 더 많을 수도 있다는 점과 (2) 상속 개념이 있고 없고의 차이, (3) column 의 일치 여부를 판단할 때에 차이점이 있다는 것과, (4) 관계를 표현하는 방식이
조금 다르다는 점이 있다.

## TypeORM 시작하기

```
$ npm install --save typeorm mysql2
```

필요한 패키지를 설치하였다면, 모듈을 등록해주어야 한다. 직접 `TypeOrmModule` 을 import 시켜주는 방법도 있고,

```typescript
@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: 'mysql',
            host: 'localhost',
            port: 3306,
            username: 'root',
            password: 'root',
            database: 'test',
            entities: [User],
            synchronize: true,
        })
    ]
})
export class AppModule {}
```

여러 DB 설정들이 필요하다면 데이터베이스 설정 전용 `Provider` 를 생성하여 import 시키는 것도 방법이 될 수 있다.

```typescript
export const databaseProviders = [
    {
        provide: 'DATA_SOURCE',
        useFactory: async () => {
            const dataSource = new DataSource({
                type: 'mysql',
                host: 'localhost',
                port: 3306,
                username: 'root',
                password: 'root',
                database: 'test',
                entities: [
                    __dirname + '/../**/*.entity{.ts,.js}',
                ],
                synchronize: true,
            });

            return dataSource.initialize();
        },
    }
]
```

```typescript
@Module({
    providers: [...databaseProviders],
    exports: [...databaseProviders]
})
export class DatabaseModule {}
```

## Repository Pattern

TypeORM 은 한 Entity 마다 그것의 고유 Repository 를 가지게 된다. Repository 들은 DB connection 으로부터 획득이 가능하다.
우선 Entity 를 만들고,

```typescript
@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;
    
    @Column()
    name: string;
    
    @Column()
    age: number;
    
    @Column()
    address: string;
}
```

User Entity 이니까 User Repository 를 만들자.

```typescript
export const UserProviders = [
    {
        provide: 'USER_REPOSITORY',
        useFactory: (dataSource: DataSource) => dataSource.getRepository(User),
        inject: ['DATA_SOURCE']
    }
];
```

이제 Service 에서 해당 Repository 를 사용할 수 있게 된다.

```typescript
@Injectable()
export class UserService {
    constructor(
        @Inject('USER_REPOSITORY') private userRepository: Repository<User>
    ) {
    }
    
    async findAll(): Promise<User[]> {
        return this.userRepository.find();
    }
}
```

최종 Module 의 모습은 이런 형태가 된다.

```typescript
@Module({
    imports: [DatabaseModule],
    providers: [
        ...userProviders,
        UserService
    ]
})
export class UserModule {}
```

---

시간 나면 데이터베이스 구조를 표현하는 방법을 정리해봐야 겠다.