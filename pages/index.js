import {getSortedPostsData} from "../lib/posts";
import {useState} from "react";
import Link from "next/link";
import {useRouter} from "next/router";

export default function Home({projects, posts}) {
    const router = useRouter();

    const goPost = (idx) => router.push(`/posts/${idx}`);

    const [currentTab, setCurrentTab] = useState(0);

    const tabContent = [
        {
            value: "Me",
            content: (
                <div key={"0"}>
                    <ul>
                        <li>
                            {(function () {
                                const from = new Date("2021-08-17");
                                const to = new Date();
                                const diff = to.getFullYear() - from.getFullYear();
                                return Math.ceil(diff);
                            })()} 년차 백엔드 개발자 🌱
                        </li>
                        <li>Name: 김 현우</li>
                        <li>Email: hyunwoo045@gmail.com</li>
                        <li>Github: <Link href={'https://github.com/hyunwoo045'}>hyunwoo045.github.com</Link></li>
                        <li>Addr: 경기도 용인시</li>
                    </ul>
                </div>
            )
        },
        {
            value: "Backend",
            content: (
                <div key={"1"}>
                    <ul>
                        <li>Java, Node.js, Typescript</li>
                        <li>Spring Boot, Spring MVC, Spring Data JPA</li>
                        <li>JPA, QueryDSL</li>
                        <li>JUnit4, MockMVC, log4j2</li>
                        <li>Express, Nest.js</li>
                        <li>TypeORM</li>
                        <li>MariaDB, MongoDB, Redis, ElasticSearch</li>
                    </ul>
                </div>
            )
        },
        {
            value: "Frontend",
            content: (
                <div key={"2"}>
                    <ul>
                        <li>HTML5, SCSS, Javascript(ES6)</li>
                        <li>React, react-router, redux</li>
                        <li>Vue.js</li>
                    </ul>
                </div>
            )
        },
        {
            value: "DevOps",
            content: (
                <div key={"3"}>
                    <ul>
                        <li>Git, Gitlab, Gitlab Pipeline</li>
                        <li>Docker, AWS ECS</li>
                        <li>Filebeat, Logstash, Kibana, AWS OpenSearch</li>
                        <li>JIRA Confluence</li>
                    </ul>
                </div>
            )
        }
    ]

    return (
        <>
            <section className={"home"}>
                <div className={"home_title"}>
                    Welcome! 👐
                    <br/>

                </div>

                <div className={"main_contents"}>
                    <div className={"wrapper"}>
                        <div className={"main_items projects"}>
                            <div className={"main_items_title"}>
                                Projects
                            </div>
                            <div className={"main_item_li"}>
                                경력 중 진행한 프로젝트
                            </div>
                            <div className={"main_item_li"}>
                                총 {projects.length} 개의 프로젝트
                            </div>
                            <br/><br/>
                            <Link href={'/projects'}>
                                <div className={"btn__primary"}>
                                    보러 가기
                                </div>
                            </Link>
                        </div>

                        <div className={"v-split-fff"}/>

                        <div className={"main_items posts"}>
                            <div className={"main_items_title"}>
                                Posts
                            </div>
                            <div className={"main_item_li"}>
                                레로로 개발 기록 포스트
                            </div>
                            <div className={"main_item_li"}>
                                총 {posts.length} 개의 포스트
                            </div>
                            <br/><br/>
                            <Link href={'/posts'}>
                                <div className={"btn__primary"}>
                                    보러 가기
                                </div>
                            </Link>
                        </div>

                        <div className={"main_items"}>
                            <div className={"main_items_sub-title"}>
                                최근 업로드한 포스트
                            </div>
                            {posts.slice(0, 4).map((post, idx) => {
                                return (
                                    <div className={"main_item_li boxed"} key={idx} onClick={() => goPost(post.id)}>
                                        {post.title}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>

                <div className={"sub_contents"}>
                    <div className={"wrapper"}>
                        <div className={"title_left"}>
                            About
                        </div>
                        <div className={"v-split-000"}/>
                        <div className={"sub_contents_navbar"}>
                            {tabContent.map((tc, idx) => {
                                return (
                                    <>
                                        <div className={`tab ${currentTab === idx ? "active" : null}`} key={idx}
                                             onClick={() => setCurrentTab(idx)}>
                                            {tc.value}
                                        </div>
                                    </>
                                )
                            })}
                        </div>

                        <div className={"sub_contents_inner"}>
                            {/*{tabContent[currentTab].content}*/}
                            {tabContent.filter((tab, idx) => {return currentTab === idx;})
                                .map((post, idx) => {return post.content;})}
                        </div>
                    </div>
                </div>
            </section>

            <style jsx>{`
              .home {
                .home_title {
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  margin: 0 auto;
                  width: 500px;
                  height: 400px;
                  font-size: 61px;
                  font-weight: 700;
                  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
                }

                .main_contents {
                  width: 100%;
                  padding: 0 110px;
                  box-sizing: border-box;
                  background-color: rgb(55, 65, 81);
                  color: #fff;

                  .main_items {
                    min-width: 210px;
                    height: 350px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    flex-wrap: wrap;
                    animation: fade-in 0.5s ease-in-out forwards;
                    margin: 60px;

                    .main_items_title {
                      font-size: 38px;
                      font-weight: 700;
                      margin-bottom: 24px;
                    }

                    .main_items_sub-title {
                      font-size: 25px;
                      font-weight: 700;
                      margin-bottom: 18px;
                    }

                    .main_item_li {
                      margin: 12px 0;
                      font-size: 18px;
                      font-weight: 500;

                      &.boxed {
                        &:hover {
                          font-weight: 700;
                          cursor: pointer;
                        }
                      }
                    }
                  }
                }

                .sub_contents {
                  position: relative;
                  height: 400px;
                  display: flex;

                  .title_left {
                    font-size: 42px;
                    font-weight: 700;
                    width: 200px;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                  }

                  .sub_contents_navbar {
                    width: 150px;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;

                    .tab {
                      height: 80px;
                      display: flex;
                      align-items: center;
                      font-size: 18px;
                      font-weight: 700;

                      &:hover {
                        cursor: pointer;
                      }

                      &.active {
                        color: orangered;
                        text-decoration: underline;
                      }
                    }
                  }
                }
              }

              .wrapper {
                width: 85%;
                display: flex;
                align-items: center;
                flex-wrap: wrap;
                margin: auto;
              }

              .v-split-fff {
                border: 5px solid #fff;
                height: 50px;
                margin: 35px;
              }

              .v-split-000 {
                border: 5px solid #000;
                height: 50px;
                margin: 35px;
              }

              @keyframes fade-in {
                from {
                  opacity: 0;
                  transform: translateX(-10%);
                }
                to {
                  opacity: 1;
                  transform: translateX(0);
                }
              }
            `}</style>
        </>
    )
}


export async function getStaticProps() {
    const projects = getSortedPostsData('projects');
    const posts = getSortedPostsData('posts');

    return {
        props: {
            projects,
            posts
        }
    }
}