import {getSortedPostsData} from "../lib/posts";
import {useEffect, useState} from "react";
import Thumbnail from "../components/Thumbnail";
import Post from "../components/Post";
import Image from "next/image";

export default function Projects({allPostsData}) {
    const [showContent, setShowContent] = useState(false);
    const [currentContent, setCurrentContent] = useState(-1);

    useEffect(() => {
        console.log(allPostsData);

        const handleEscapeKey = (event) => {
            if (event.key === 'Escape') {
                handleCloseModal()
            }
        }

        if (showContent) {
            document.body.addEventListener('keydown', handleEscapeKey)
        }

        return () => {
            document.body.removeEventListener('keydown', handleEscapeKey)
        }
    }, [allPostsData, showContent]);

    const openContent = (idx) => {
        setShowContent(!showContent);

        setCurrentContent(idx);

        if (!showContent) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }

    const handleCloseModal = () => {
        setShowContent(false);
        document.body.style.overflow = '';
    }

    return (
        <>
            <section className={"content-list"}>
                <div className={"content-list__page-header"}>
                    <div className={"page__title"}>
                        JOB Experiences
                    </div>
                </div>

                <div className={"content-list__docs"}>
                    {allPostsData.map((post, idx) => {
                        return (
                            <div key={idx} onClick={() => openContent(idx)}>
                                <Thumbnail
                                    title={post.title}
                                    date={post.date}
                                    tags={post.tag}
                                />
                            </div>
                        )
                    })}
                </div>
            </section>

            {showContent ?
                <div className={"modal__backdrop"}>
                    <div className={"modal_button_close"} onClick={handleCloseModal}>
                        <Image src={'/images/icon-close.png'} alt={'close'} width={40} height={40}/>
                    </div>
                    <div className={"modal_content"}>
                        <Post content={allPostsData[currentContent].content}/>
                    </div>
                </div>
                : null
            }

            <style jsx>{`
              .content-list {
                position: relative;

                .content-list__page-header {
                  width: 100vw;
                  height: 110px;
                  font-size: 48px;
                  font-family: 'Oswald', sans-serif;
                  font-weight: 700;
                  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);

                  .page__title {
                    position: absolute;
                    top: 40px;
                    left: 35px;
                  }
                }

                .content-list__docs {
                  width: 100vw;
                  position: absolute;
                  display: flex;
                  flex-wrap: wrap;
                }
              }

              .modal__backdrop {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.5);
                display: flex;
                justify-content: center;
                align-items: center;

                .modal_button_close {
                  background-color: #d3d3d3;
                  border-radius: 20%;
                  position: fixed;
                  top: 20px;
                  right: 20px;
                  cursor: pointer;
                }

                .modal_content {
                  position: fixed;
                  width: 70%;
                  height: 100%;
                  background-color: #fff;
                  border-radius: 5px;
                  z-index: 10;
                  overflow: auto;
                }
              }
            `}</style>
        </>
    )
}

export async function getStaticProps() {
    const allPostsData = getSortedPostsData('projects');
    return {
        props: {
            allPostsData
        }
    }
}