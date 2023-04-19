import ReactMarkdown from "react-markdown";
import {Prism as SyntaxHighlighter} from "react-syntax-highlighter";

export default function Post({ content }) {

    return (
        <>
            <section className={"page__content e-content"}>
                <ReactMarkdown
                    children={content}
                    components={{
                        code({node, inline, className, children, ...props}) {
                            const match = /language-(\w+)/.exec(className || '')
                            return !inline && match ? (
                                <SyntaxHighlighter
                                    children={String(children).replace(/\n$/, '')}
                                    language={match[1]}
                                    PreTag="div"
                                    {...props}/>
                            ) : (
                                <>
                                    <code className={className} {...props}>
                                        {children}
                                    </code>
                                </>

                            )
                        }
                    }}
                />
            </section>

            <style jsx>
                {`
                  .page__content {
                    width: 76%;
                    margin: auto;
                    padding: 80px 0;
                  }

                  pre {
                    font-size: 11px;
                  }
                `}
            </style>
        </>
    )
}