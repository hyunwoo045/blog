import fs from 'fs';
import path from 'path';
import matter from "gray-matter";

export function getSortedPostsData(postType) {
    const postsDirectory = path.join(process.cwd(), "docs/" + postType);

    const fileNames = fs.readdirSync(postsDirectory);
    const allPostsData = fileNames.map((fileName, idx) => {
        const id = fileName.replace(/\.md$/, '');
        const fullPath = path.join(postsDirectory, fileName);
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const matterResult = matter(fileContents);

        return {
            id,
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
                id: post.id
            }
        }
    })
}

export function getPostData(id, postType) {
    const postsDirectory = path.join(process.cwd(), "docs/" + postType);
    const fullPath = path.join(postsDirectory, `${id}.md`)
    const fileContents = fs.readFileSync(fullPath, 'utf8');

    const result = matter(fileContents);

    return {
        id,
        ...result.data,
        content: result.content
    }
}