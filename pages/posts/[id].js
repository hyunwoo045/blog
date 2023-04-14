import {getAllPostIds, getPostData} from "../../lib/posts";
import Post from "../../components/Post";

export default function PostContent({ postData }) {

    return (
        <>
            <div className={"post__content"}>
                <Post content={postData.content}/>
            </div>
        </>
    )
}

export async function getStaticPaths() {
    const paths = getAllPostIds('posts');
    return {
        paths,
        fallback: false,
    }
}

export async function getStaticProps({ params }) {
    const postData = getPostData(params.id, 'posts');

    return {
        props: {
            postData
        }
    }
}