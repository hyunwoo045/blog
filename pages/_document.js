import {Head, Html, Main, NextScript} from "next/document";

export default function myDocument() {
    return (
        <Html>
            <Head>
                <link rel="stylesheet" href="/styles/globals.scss"/>
            </Head>
            <body>
            <Main/>
            <NextScript/>
            </body>
        </Html>
    )
}