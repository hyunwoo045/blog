---
title: "CI/CD - Gitlab pipeline"
date: "2023-04-26"
tag: ["DevOps", "Git", "Docker"]
---

# CI/CD - Gitlab pipeline 을 써보자

프로젝트를 외부에 공개하는 작업은 반복적이다. 프로젝트를 컴파일해보고 테스트해보고 빌드한 후에 배포한다.
일일이 수동으로 모든 단계를 거치는 것은 오래 걸리고, 반복적이어서 귀찮다. 혹여나 최신 릴리즈한 버전에서 버그가 발생하여
빠르게 수정하면서 문제를 확인해야 하는 상황에서는 정말 답답한 작업이다.

팀 내에서 사용하던 "Bitbucket" 을 비용 이슈로 청산하고 "Gitlab Community Edition" 을 사용하기 위해 설치하는 과정을
기록한다.

## Gitlab 설치

[gitlab 설치 공식 가이드 문서](https://about.gitlab.com/install/#ubuntu) 를 따라서 ubuntu 에 설치한다. 설치할 것은
`gitlab-ee` 가 아닌 `gitlab-ce` 임을 주의하면서 명령어들을 실행한다

```shell
sudo apt-get update
sudo apt-get install -y curl openssh-server ca-certificates tzdata perl

sudo apt-get install -y postfix

curl https://packages.gitlab.com/install/repositories/gitlab/gitlab-ce/script.deb.sh | sudo bash

sudo EXTERNAL_URL="your-gitlab-url" apt-get install gitlab-ce
```

이러면 gitlab 설치는 끝났다.

일반적으로 설정파일은 `/etc/gitlab` 에 있으며 `gitlab.rb` 파일을 수정한 후 `sudo gitlab-ctl reconfigure` 명령을 수행하여
설정을 변경할 수 있다. 초기 사용이니 별 달리 건드릴 것은 없고, external url 설정만 살짝 바꿔준다. (설치할 때 `EXTERNAL_URL` 설정을 제대로 했으면 안해도 됨)

```shell
## GitLab URL
##! URL on which GitLab will be reachable.
##! For more details on configuring external_url see:
##! https://docs.gitlab.com/omnibus/settings/configuration.html#configuring-the-external-url-for-gitlab
##!
##! Note: During installation/upgrades, the value of the environment variable
##! EXTERNAL_URL will be used to populate/replace this value.
##! On AWS EC2 instances, we also attempt to fetch the public hostname/IP
##! address from AWS. For more details, see:
##! https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/instancedata-data-retrieval.html

external_url 'http://git.commaxcloud.net'
```

주석에 AWS EC2 instance 라면 hostname/IP 도 fetch 가능하다고는 하지만 실제로는 기존 가지고 있던 도메인에 서브 도메인을 추가하고,
Target group, Load Balancer 를 생성하여 추가한 도메인에 연결하였기 떄문에 그 도메인 URL 을 명시해야 했음.
그 외에 정말 어마무시하게 많은 설정을 할 수 있으니 시간 나면 `gitlab.rb` 파일을 읽어보자 ^^ㅋ

이제 CI/CD 코드를 작성하기 전에 코드를 돌려줄 `gitlab-runner` 를 설치해보자.

## Gitlab Runner 설치

Gitlab Runner 는 Gitlab 에서 제공하는 CI/CD 도구로 CI/CD 파이프라인을 실행하는 데에 사용한다.

이 또한 [공식 문서](링크: [Install Gitlab Runner](https://docs.gitlab.com/runner/install/linux-repository.html))
를 참고하여 설치한다.

```shell
curl -L "https://packages.gitlab.com/install/repositories/runner/gitlab-runner/script.deb.sh" | sudo bash

sudo apt-get install gitlab-runner
```

이와 같이 Gitlab Runner 의 설치 자체는 아주 간단하다. 설치가 끝났다면 `gitlab-runner` 사용자를 만들어주고 해당 사용자로 Gitlab Runner 가
실행되도록 한다. 보안 및 권한 이슈를 방지하여 안전하게 실행시키기 위함이다.

```shell
sudo useradd --comment 'GitLab Runner' --create-home gitlab-runner --shell /bin/bash
sudo gitlab-runner install --user=gitlab-runner --working-directory=/home/gitlab-runner
sudo gitlab-runner start
```

이제 runner 를 등록해준다. `project` 단위로 runner 를 등록해줄수도 있겠으나, 관리 측면에서 번거로울 수 있으니 그룹 단위로 프로젝트를 나누고
해당 그룹에 runner 를 등록해주도록 한다.

![cloduv2 group runner](/images/posts/11_01.png)

Runners 를 클릭하면

![cloudv2 group runner](/images/posts/11_02.png)

`Register a group runner` 버튼을 볼 수 있고 token 을 복사하자. 그리고 아래 명령을 입력하여 runner 등록을 마친다.

```shell
sudo gitlab-runner register --url <gitlab 이 설치된 instance 의 url> --registration-token <방금 복사한 token>
```

이제 해당 Group 안에 Project 를 생성하고 `Setting - CI/CD` 로 이동하여 `Runners` 탭을 보면 아래와 같이 Group runners 에
Available group runners 아래에 방금 생성한 runner 가 보인다면 성공이다.

![cloudv2 group runner](/images/posts/11_03.png)

이제 `.gitlab-ci.yml` 파일을 작성하여 CI/CD 코드를 작성하기만 하면 되는데, 그 전에 통합/배포에 필요한 핵심 단계들을 검토해보자면

1. 프로젝트 빌드 (Java, Gradle)
2. Docker image 빌드
3. AWS ECR 에 로그인하고 Repository 에 도커 이미지 push

현재 담당하고 있는 프로젝트를 배포하기 위해서는 위 3단계가 필요하다. 명령어로 치면 아래와 같을 수 있는데,

```shell
./gradlew build
docker build . -t <image tag>
aws ecr get-login-password .....
docker push ......
```

이 명령들이 모두 방금 gitlab-runner 를 설치한 인스턴스에서 자동으로 동작하게 된다. 즉, 위 코드를 예시로 들자면 "open-jdk", "gradle", "aws cli", "docker" 등을
모두 설치해주어야 한다는 것이다. 각 설치 과정은 본 글에서는 생략함.

## Gitlab Runner 알아야 할 개념

이제 프로젝트의 root directory 에 `gitlab-ci.yml` 파일을 생성하고 CI/CD 코드를 작성하기만 하면 되는데, 작성하기에 앞서 3개의 키워드 정도는
알고 작성하는 것이 이해에 편할 수 있다.

- Job

Runner 가 실행할 수 있는 단위 작업으로 예를 들어 `./gradlew build` 와 `docker build . -t <tag>` 같은 "script" 이다.

- Stage

Job 의 집합으로 Job 이 실행되는 단계를 나타내며 "build", "deploy" 같은 단계가 있을 수 있겠다.

- Pipeline

Job 과 Stage 의 집합으로 Gitlab Runner 가 작업을 실행하는 단위이다. 해당 작업 단위는 Gitlab 에서 Commit 이 발생할 때마다 실행된다.

```yaml
stages:
  - build
  - deploy
  
build:
  stage: build
  script:
    - ./gradlew build
    - docker build . -t <image tag>

deploy:
  stage: deploy
  script:
    - aws ecr get-login-password ...
    - docker push ...
```

위는 간단한 코드 예시이다. "build", "deploy" 로만 구성된 pipeline 을 실행한다.

---

CI/CD 코드를 통해 코드 배포 방식이나 파이프라인 실행 결과 등에 따라 분기를 칠 수 있다.

예시 1) `master` 브랜치로 코드가 커밋된 경우 도커 이미지 태그에 "latest" 를 붙히고 아닌 경우 브랜치명을 태그로 사용한다.

```yaml
deploy:
  stage: deploy
  script:
    - TAG="$CI_COMMIT_BRANCH"
    - >
      if [ "$CI_COMMIT_BRANCH" = "master" ]; then
        TAG="latest"
      fi
    - docker tag <image> <repository>:$TAG
```

예시 2) Pipeline 실패한 경우 알리기

```yaml
notify-job-fail:
  stage: notify
  script:
    - tm="Pipeline Failed!"
    - curl --globoff "http://msg-server.net/send.php?msg=$msg"
  when: on_failure
```

등 다양한 방식으로 코드를 작성하여 많은 것을 자동화 시킬 수 있겠다.