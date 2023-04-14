import Header from "../components/Header";
import '../styles/globals.scss';

export default function MyApp({Component, pageProps}) {
    return (
        <>
            <Header/>
            <main><Component {...pageProps}/></main>
        </>
    )
}