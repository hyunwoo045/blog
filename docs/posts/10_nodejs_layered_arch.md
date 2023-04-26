---
title: "[Node.js] Express 로 Layered Architecture 구현하기"
date: "2023-04-25"
tag: ["Node.js", "Express"]
---

# Express 로 Layered Architecture 구현하기

Express 는 프레임워크임에도 불구하고 생각보다 구현 자유도가 상당히 높다는 생각이 든다. 지금까지 여러 `Node.js` 프로젝트를 보면서 느낀 점은
정말 다양한 구조로 프로젝트를 구성할 수 있구나 라는 점이었다. 이번 포스트에서는 "코맥스 클라우드 운영 관제 시스템" 프로젝트에서 구성한 프로젝트 구조를
기록해보려 한다.

프로젝트 구조를 설계할 때 중요하게 생각한 것은 Layered Architecture (Controller, Service, Repository) 로 구성해야겠다는 점이었다.
Layer 를 나누지 않고 Controller 만 작성한다고 했을 때, 문제가 될만한 예시를 간단히 들어보자면

```javascript
import {Router} from "express";
import {mysqlPool} from '../../lib/database.js';

const router = Router();

router.get("/api/user", async function (req, res) {
    const {id} = req.query;
    let conn;
    let user;
    try {
        conn = await pool.getConnection();
        user = await conn.query("SELECT * FROM tbl_user WHERE id = ?", [id]);
    } catch (err) {
        throw err;
    } finally {
        // 대충 응답으로 유저 정보 반환하기~
    }
});

router.post("/api/user", async function (req, res) {
    const {id} = req.query;
    let conn;
    let user;
    try {
        conn = await pool.getConnection();
        user = await conn.query("SELECT * FROM tbl_user WHERE id = ?", [id]);
    } catch (err) {
        throw err;
    } finally {
        // 대충 유저가 이미 존재하면 등록 skip 하고 존재하지 않으면 등록하고 200 응답 보내기~
    }
});

router.delete("/api/user", async function (req, res) {
    const {id} = req.query;
    let conn;
    let user;
    try {
        conn = await pool.getConnection();
        user = await conn.query("SELECT * FROM tbl_user WHERE id = ?", [id]);
    } catch (err) {
        throw err;
    } finally {
        // 대충 유저가 존재하면 삭제하고 아니면 404 응답 보내기~
    }
});
```

유저를 검색하던, 등록하던, 삭제하던 기존 유저가 존재하는지 확인을 한다고 예를 들 때 위와 같이 유저 검색을 하는 코드를 복붙하여 쓰고 있는 모습이다.
예시는 한 눈에 보이니까 "에이~ 누가 저렇게 코딩해" 라고 할 수 있겠지만 서비스가 계속 커지고 파일이 많아지다보면 알게 모르게 예시와 같은 반복 코드가 생긴다.
만약 테이블의 column 명이 `id` 에서 `user_id`로 바뀐다면? 예시에서는 세 군데의 코드를 직접 수정해야 한다. 서비스가 크다면 재앙이다.

그래서 프로젝트 구조를 몇 단계의 레이어로 구분하는 것이 좋다. 이런 디자인 패턴을 **Layered Architecture** 혹은 **n-Tier Architecture** 라고 부른다.
위 예시 코드를 한 단계만 나누어보자.

```javascript
// user.service.js
import {mysqlPool} from '../../lib/database.js';

export default class UserService {
    constructor() {
    }

    // 특정 유저 정보를 가져오는 로직을 분리함
    getUserInfo = async (id) => {
        let conn;
        let user = null;
        try {
            conn = await pool.getConnection();
            user = await conn.query("SELECT * FROM tbl_user WHERE id = ?", [id]);
        } catch (err) {
            throw err;
        }

        if (user === null) throw new Error("user not found");
        else return user;
    }
}
```

```javascript
import {UserService} from './user.service.js';

const router = Router();
const userService = UserService();

router.get("/api/user", async function (req, res) {
    const {id} = req.query;
    try {
        userService.getUserInfo(id);
    } catch (err) {
        console.error(err);
    }
});

router.post("/api/user", async function (req, res) {
    const {id} = req.query;
    try {
        userService.getUserInfo(id);
    } catch (err) {
        console.error(err);
    }
});

router.delete("/api/user", async function (req, res) {
    const {id} = req.query;
    try {
        userService.getUserInfo(id);
    } catch (err) {
        console.error(err);
    }
});
```

이제 만약 특정 유저를 조회하는 비즈니스 로직이 변경되더라도 UserService 에 작성한 코드만 수정하면 된다.

## 4-Tier Architecture

"Layered Architecture" 는 구조를 구성하는 레이어의 숫자를 따로 명시하지 않아 "n-Tier Architecture" 라고 부르기도 하지만,
일반적인 경우 4개의 레이어로 구성한다.

- Presentation Layer: 사용자 인터페이스와 상호작용. 직접 요청을 받고 응답하는 역할
- Business Layer: 비즈니스 로직(규칙)을 적용하고 처리.
- Persistence Layer: 데이터베이스와의 상호작용.
- Database Layer: 실제 데이터베이스. 소프트웨어 구조와 연관이 없기 때문에 이를 제외하고 3-Tier Architecture 로 부르기도 하는 듯.

위 설계 방식이 항상 고정인 것은 아니니 소프트웨어의 특성에 맞는 설계를 하는 것이 좋겠다. 레이어가 너무 적으면 기능들의 재사용성이 떨어질 수 있고,
레이어가 너무 많으면 레이어간 의존성이 꼬일 수 있다는 점을 항상 고려하면서 적절한 구조를 설계해야 한다.

## Express App 구성

Express App 을 구성하는 객체를 만들어준다. 그리고 의존성을 추가하는 메서드들을 생성한다. 예시에서는 Controller 의존성만 주입하도록 함.

```javascript
// app.js
import express, {Router} from 'express';

class app {
    app;
    
    constructor(controllers) {
        this.app = express();
        
        this.initializeController(controllers);
    }
    
    listen() {
        const port = process.env.PORT || 3000;
        this.app.listen(port, () => {
            console.log(`App Listening on the port ${port}`)
        });
    }
    
    initializeController(controllers) {
        const router = Router();
        
        controllers.forEach(controller => {
            router.use(controller.router);
        });
        
        this.app.use('/api', router);
    }
}

export default app;
```

App class 를 인스턴스화하여 서버를 가동시킨다.

```javascript
// index.js
import App from './app.js';

(async function startServer() {
    const app = new App([
        // controller 들이 들어갈 자리
    ]);
    
    app.listen();
})().then(() => {
    console.log("Server started!");
})
```

## Presentation Layer (Controller)

Controller 를 생성하여 의존성을 추가해주자. Controller 는 클라이언트의 요청을 전달받아 데이터를 분석하고 검증하는 일을 수행할 것이며,
비즈니스 로직을 실행하여 그 처리 결과를 응답으로 반환하는 역할을 할 것이다.

```javascript
// user.controller.js

export default class UserController {
    path = "/user";
    
    router;
    
    constructor() {
        this.router = Router();
    }
    
    initializeRouter() {
        const router = Router();
        router.get('/', this.getUserInfo);
        
        this.router.use(this.path, router);
    }
    
    getUserInfo = async (req, res) => {
        res.send("Getting User");
    }
}
```

```javascript
import App from './app.js';
import UserController from './controller/user.controller.js';

(async function startServer() {
    const app = new App([
        new UserController()  // <-- 의존성 추가
    ]);
    
    app.listen();
})().then(() => {
    console.log("Server started!");
})
```

따로 app 객체를 건드리지도 않고 외부에서 controller 의존성을 추가해줄 수 있다.

## Business Layer (Service)

Service 는 Controller 에 의해 호출되는 비즈니스 로직을 처리하는 역할을 할 것이다. 주요 역할로는 비즈니스 로직을 수행하는 것 외에도
후술할 Persistence 에서 전달받는 DAO 를 처리하고, 트랜젝션을 관리하는 역할 또한 수행한다.

```javascript
// user.service.js
import UserRepository from './user.repository.js';

export default class UserService {
    
    userRepository;
    
    constructor() {
        this.userRepository = new UserRepository();
    }
    
    findUser(id) {
        const user = this.userRepository.findById(id);  // <-- 유저 정보를 가져오지만 어떻게 가져오는지는 Service 가 알 필요는 없다.
        if (user === null) throw new Error("User not found");
        else return user;
    }
}
```

이제 Controller 에서 정의한 비즈니스 로직을 호출하도록 구현

```javascript
import UserService from './user.service.js';

export default class UserController {
    path = "/user";
    
    router;
    
    userService;
    
    constructor() {
        this.router = Router();
        this.userService = new UserService();
    }
    
    initializeRouter() {
        const router = Router();
        router.get('/', this.getUserInfo);
        
        this.router.use(this.path, router);
    }
    
    getUserInfo = async (req, res) => {
        const {id} = req.query;
        const user = this.userService.findUser(id);
        
        return {
            success: true,
            error: null,
            payload: {
                user
            }
        }
    }
}
```

## Persistence Layer (Repository)

Business layer 에서는 데이터베이스에서 데이터를 가져오긴 하지만 어떻게 가져오는지에 대해서는 명확히 정의하지 않았다.
Persistence Layer 에서 데이터베이스에서 어떻게 데이터를 가져올 것인지를 정의할 것이다. 또한 해당 레이어에서 데이터의 저장, 삭제까지도
담당할 것이다.

```javascript
import {pool} from '../../config/database.js';

export default class UserRepository {
    constructor() {}

    findById = async (id) => {
        let conn;
        try {
            conn = await pool.getConnection();
            return await conn.query(
                `SELECT * FROM tbl_user WHERE id = ?`, [id]
            );
        } catch (err) {
            throw new Error("DB Error");
        } finally {
            if (conn) conn.release();
        }
    }
    
    save = async (user) => {
        let conn;
        try {
            conn = await pool.getConnection();
            return await conn.query(
                `INSERT INTO tbl_user (name, age, address) VALUES (?, ?, ?)`,
                [user.name, user.age, user.address]
            );
        } catch (err) {
            throw new Error("DB Error");
        } finally {
            if (conn) conn.release();
        }
    }
    
    deleteUser = async (id) => {
        let conn;
        try {
            conn = await pool.getConnection();
            return await conn.query(
                `DELETE FROM tbl_user WHERE id = ?`, [id]
            );
        }
        catch (err) {
            throw new Error("DB Error");
        } finally {
            if (conn) conn.release();
        }
    }
}
```