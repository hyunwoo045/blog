---
title: Dependency Injection
date: 2023-04-17
tag: ["Design Pattern"]
---

# Dependency Injection

Spring 도 그렇고, Nest.js 에서도 그렇고 그들은 공통적으로 이런 비슷한 말을 한다. **"Class is injected as a dependency"**.
의존성을 연결하면 연결하는거지 주입한다는 것은 무슨 말일까? 이는 개념을 정리하지 않고서야 알 수가 없다.
핵심 백엔드 프레임워크에서 자주 언급하는 의존성 주입(Dependency Injection)에 대해서 간단히 공부한 내용을 이번 글에 정리해보고자 한다.

## 강한 결합

늘 그렇지는 않겠지만서도, 객체 간의 '강한 결합'은 일반적으로 유지보수성을 해친다.

```javascript
class Student {
    constructor(name, age) {
        this.name = name;
        this.age = age;
    }
    getStudentInfo() {
        return {
            name: this.name,
            age: this.age
        }
    }
}

class StudentController {
    constructor() {
        this.student = new Student('kim', 17);
    }
    getStudentInfo() {
        const info = this.student.getStudentInfo()
        console.log(`Student name: ${info.name} / age: ${info.age}`);
    }
}

const studentController = new StudentController();
studentController.getStudentInfo();
```

위 예시에서 `StudentController` 는 `Student` 객체를 생성자 단에서 직접 인스턴스화하여 사용하는 모습이다. 이걸 보고 '강하게 연결'되었다고
하는데, 이는 당연히 문제 없는 코드긴 하지만 여러 문제가 있다. 대표적으로 "Student 객체가 없으면 StudentController 를 정의 자체를 할 수 없다"
는 점과 "Student 객체가 바뀌면 StudentController 도 코드를 수정해야 한다"는 점이다.

```javascript
class Student {
    constructor(name, age, school) {  // <-- 필드가 하나 추가됨.
        this.name = name;
        this.age = age;
        this.school = school;
    }

    getStudentInfo() {
        return {
            name: this.name,
            age: this.age,
            school: this.school
        }
    }
}

class StudentController {
    constructor() {
        this.student = new Student('kim', 17);  // <-- (1) javascript는 에러가 안 나긴 하는데 고치긴 해야 할 듯.
    }

    getStudentInfo() {
        const info = this.student.getStudentInfo()
        console.log(`Student name: ${info.name} / age: ${info.age}`);  // <-- (2) 얘도 고치는 건 선택이지만 어쨌든 수정하긴 해야 할 듯.
    }
}

const studentController = new StudentController();
studentController.getStudentInfo();
```

단순히 `Student` 객체에 필드를 하나 추가했을 뿐인데, `StudentController` 객체의 코드도 수정해야 한다. Javascript 에서야 (1), (2) 코드를
돌려도 에러는 안 나긴 하는데, 같은 내용의 코드를 Java 로 짰다면 (1) 에서 무조건 컴파일 에러 뜬다.

이와 같이 객체 끼리 **강하게 연결**하면 한 객체를 수정했는데 다른 객체도 수정해야 하는 번거로운 일이 발생하는 것이다.

## 의존성 주입

**강한 결합**이 야기하는 문제들을 해결하기 위한 여러가지 방법들이 있다. 그 중에서도 대표적인 **주입**이라는 키워드를 살펴보자.
"A와 B가 결합한다"라는 문장은 뭔가 다른 특정 주체가 끼어들 수 없는 문장이라는 느낌이다.
하지만 "A에 B를 주입한다"라는 문장은 특정 주체를 추가할 수 있는 문장이게 된다. "A에 B를 C가 주입한다" 와 같이 말이다.
이 개념에서 C는 보통 '외부'로 표현한다. 위 코드를 추가로 예시로 들어보자.

```javascript
class Student {
    constructor(name, age, school) {
        this.name = name;
        this.age = age;
        this.school = school;
    }
    getStudentInfo() {
        return {
            name: this.name,
            age: this.age,
            school: this.school
        }
    }
}

class StudentController {
    constructor(student) {  // <-- (1) 외부에서 객체를 전달받도록 함
        this.student = student;
    }
    getStudentInfo() {
        const info = this.student.getStudentInfo();
        console.log(`Student name: ${info.name} / age: ${info.age}`);
    }
}

/* 우리는 여기를 '외부'라고 부르기로 했어요 */
const student = new Student('kim', '17', 'Seoul'); // <-- (2) 외부에서 객체를 생성하고
const studentController = new StudentController(student);  // <-- (3) StudentController 에 주입
studentController.getStudentInfo();
```

특정 객체에 주입할 객체는 '외부'에서 선언하고 주입될 객체에 전달하는 방식인 것이다.
이런 식으로 코드를 짜놓으면 `Student` 객체가 변하더라도 `StudentController` 객체의 코드가 직접 수정되는 일은 줄어들게 된다.
그리고 이런 개념이 적용되어 있는 프레임워크의 경우 (Spring 이라던가, Nest.js 라던가) '외부'의 코드는 프레임워크가 구현하였기 때문에 더더욱
개발자들은 주입할 클래스의 구현에만 집중하면 되기 떄문에 유지보수하기 훨씬 수월해진다.

```typescript
// Nest.js 의 Controller 로 Service 주입
// student.service.ts
@Injectable()
export class StudentService {}

// student.controller.ts
@Controller('student')
export class StudentController {
    constructor(
        private readonly studentService: StudentService  // <-- 의존성 주입
    ) {}
}
```

### 의존성 주입 방법 3가지

의존성을 주입 하는 방법에는 3가지 방법이 있다고 한다. `(1) 생성자 주입`, `(2) Setter 주입`, `(3) 인터페이스 주입` 으로 나뉘는데,
사실 (2), (3)은 많이 본 적은 없고, 일반적으로 프레임워크들에서 주로 사용되고 권장되는 방식은 `(1) 생성자 주입`이다. 위 JavaScript 코드로
예시를 든 것이 생성자 주입이라고 볼 수 있다.

외에 Setter 주입은 아래와 같은 느낌일거고,

```javascript
class Student {}

class StudentController {
    constructor() {}
    
    setStudent(student) {
        this.student = student;
    }
}
```

인터페이스 주입은 Java 코드로 치면 아래와 같은 코드일 것이다.

```java
public interface InjectStudent {
    void inject(Student s);
}

public class StudentController {
    private Student student;
    
    @Override
    public void inject(Student s) {
        this.student = s;
    }
}
```

---

아주 간단히 의존성 주입에 대해서 정리해보았다. 이를 알고 있어야 Spring 이던 다른 백엔드 프레임워크든 문서를 읽을 때 그나마 조금 덜 어지러울 것 같다.
추후에 프레임워크의 도움을 받지 않고도 **가독성이 높고**, **재사용성이 높은** 객체나 함수를 작성하려면 꼭 알고 있어야 할 디자인 패턴이니
친숙해지도록 하자.