import Link from "next/link";

export default function Home() {
    return (
        <>
            <section className={"home"}>
                <section className={"projects"}>
                    <div className={"inner"}>
                        <div className={"inner__title"}>Job Experiences</div>
                        <div className={"inner__content"}>경력 중 진행한 프로젝트들을 소개합니다<br/>백엔드 개발자로써 어떤 프로젝트를 맡아왔는지 확인해보세요
                        </div>
                        <div className={"inner__nav"}>
                            <Link href={'/projects'}>
                                <button className={"btn__primary"}>
                                    보러 가기
                                </button>
                            </Link>
                        </div>
                    </div>
                </section>

                <section className={"posts"}>
                    <div className={"inner"}>
                        <div className={"inner__title"}>POSTS</div>
                        <div className={"inner__content right"}>레로로의 개발 일기<br/>개발 중 저의 고민과 느낀 점들을 공유합니다</div>
                        <div className={"inner__nav"}>
                            <Link href={'/posts'}>
                                <button className={"btn__primary"}>
                                    보러 가기
                                </button>
                            </Link>
                        </div>
                    </div>
                </section>

                <section className={"skills"}>
                    <div className={"section__title"}>Skills</div>
                    <ul className={"inner"}>
                        <li>
                            <div className={"inner__title"}>Backend</div>
                            <ul>
                                <li>Java, Node.js, Typescript</li>
                                <li>Spring Boot, Spring MVC, Spring Data JPA</li>
                                <li>JPA, QueryDSL</li>
                                <li>JUnit4, MockMVC, log4j2</li>
                                <li>Express, Nest.js</li>
                                <li>TypeORM</li>
                                <li>MariaDB, MongoDB, Redis, ElasticSearch</li>
                            </ul>
                        </li>

                        <li>
                            <div className={"inner__title"}>DevOps</div>
                            <ul>
                                <li>Git, Gitlab, Gitlab Pipeline</li>
                                <li>Docker, AWS ECS</li>
                                <li>Filebeat, Logstash, Kibana, AWS OpenSearch</li>
                                <li>JIRA Confluence</li>
                            </ul>
                        </li>

                        <li>
                            <div className={"inner__title"}>Frontend</div>
                            <ul>
                                <li>HTML5, SCSS, Javascript(ES6)</li>
                                <li>React, react-router, redux</li>
                                <li>Vue.js</li>
                            </ul>
                        </li>
                    </ul>
                </section>
            </section>

            <style jsx>{`
              .home {
                overflow: auto;
              }

              .projects {
                position: relative;

                .inner {
                  height: 400px;
                  background: linear-gradient(to right, rgba(136, 164, 211, 1), rgba(136, 164, 211, 0.4));

                  .inner__title {
                    position: absolute;
                    font-size: 42px;
                    font-weight: 800;
                    top: 20%;
                    left: 15%;
                  }

                  .inner__content {
                    position: absolute;
                    font-size: 24px;
                    font-weight: 400;
                    top: 42%;
                    left: 15%;
                  }

                  .inner__nav {
                    position: absolute;
                    font-size: 18px;
                    font-weight: 400;
                    top: 70%;
                    left: 15%;
                  }
                }
              }

              .posts {
                position: relative;

                .inner {
                  height: 400px;
                  background: linear-gradient(to left, rgb(255, 168, 247), rgba(255, 74, 238, 0.4));

                  .inner__title {
                    position: absolute;
                    font-size: 42px;
                    font-weight: 800;
                    top: 20%;
                    right: 15%;
                  }

                  .inner__content {
                    position: absolute;
                    font-size: 24px;
                    font-weight: 400;
                    top: 42%;
                    right: 15%;

                    &.right {
                      text-align: right;
                    }
                  }

                  .inner__nav {
                    position: absolute;
                    font-size: 18px;
                    font-weight: 400;
                    top: 70%;
                    right: 15%;
                  }
                }
              }

              .skills {
                line-height: 1.4;
                width: 100%;
                position: relative;
                left: 0;
                padding: 8px 0;
                display: block;
                background: linear-gradient(to bottom right, rgba(0, 0, 0, 1), rgba(0, 0, 0, 0.7));
                color: white;

                .section__title {
                  margin: 50px;
                  font-size: 21px;
                  font-weight: 900;
                }

                .inner {
                  display: flex;
                  list-style-type: none;
                  margin-left: 30px;

                  li > .inner__title {
                    padding: 3px 0 12px 0;
                    font-size: 17px;
                    font-weight: 800;
                  }

                  li {
                    margin-right: 30px;
                  }

                  li > ul {
                    padding-left: 0;
                  }

                  li > ul > li {
                    padding: 5px 0;
                    font-size: 13px;
                    list-style: none;
                  }
                }
              }
            `}</style>
        </>
    )
}