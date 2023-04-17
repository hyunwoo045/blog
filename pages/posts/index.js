import {getSortedPostsData} from "../../lib/posts";
import PostListItem from "../../components/PostListItem";
import {useRouter} from "next/router";

export default function PostPage({allPostsData}) {

    const router = useRouter();
    const goPost = (idx) => router.push(`/posts/${idx}`);

    return (
        <>
            <div className={"posts_header"}>
                <div className={"page_title"}>
                    Posts
                </div>
            </div>

            <div className={"posts_list"}>
                {allPostsData.map((post, idx) => {
                    return (
                        <div key={idx} className={"item"} onClick={() => goPost(post.id)}>
                            <PostListItem title={post.title}
                                          date={post.date}
                                          tags={post.tag}/>
                        </div>
                    )
                })}
            </div>

            <style jsx>{`
              .posts_header {
                height: 110px;
                font-size: 36px;
                font-weight: 700;
                box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);

                .page_title {
                  position: absolute;
                  top: 40px;
                  left: 35px;
                }
              }

              .posts_list {
                padding: 10px;
                
                .item {
                  cursor: pointer;
                }
              }
            `}</style>
        </>
    )
}


export async function getStaticProps() {
    const allPostsData = getSortedPostsData('posts');
    return {
        props: {
            allPostsData
        }
    }
}