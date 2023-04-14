import fs from 'fs';
import path from 'path';
import matter from "gray-matter";

export function getSortedPostsData(postType) {
    const postsDirectory = path.join(process.cwd(), "docs/" + postType)

    const fileNames = fs.readdirSync(postsDirectory);
    const allPostsData = fileNames.map((fileName, idx) => {
        // const id = fileName.replace(/\.md$/, '');
        const fullPath = path.join(postsDirectory, fileName);
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const matterResult = matter(fileContents);

        return {
            id: idx,
            ...matterResult.data,
            content: matterResult.content
        };
    });

    return allPostsData.sort((a, b) => {
        if (a.date < b.date) {
            return 1;
        } else {
            return -1;
        }
    });
}

export function getAllPostIds(postType) {
    const postData = getSortedPostsData(postType);

    return postData.map(post => {
        return {
            params: {
                id: String(post.id)
            }
        }
    })
}

export function getPostData(idx, postType) {
    const postData = getSortedPostsData(postType);

    return postData[idx];
}