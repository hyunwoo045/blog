import Image from "next/image";
import Link from "next/link";
import {useRouter} from "next/router";

export default function Header() {
    const router = useRouter();

    const goHome = () => router.push('/');

    return (
        <>
            <div className={"header"}>
                <div className={"logo"} onClick={goHome}>
                    <Image src={'/images/ori_running.gif'} alt={"main"} width={55} height={55}/>
                </div>

                <div className={"header__title"} onClick={goHome}>
                    레로로의 개발 브이로그 🏝
                </div>

                <div className={"header__nav"}>
                    <div className={"nav__item"}>
                        <span className={"nav__item__inner"}>about</span>
                    </div>
                    <div className={"nav__item"}>
                        <span className={"nav__item__inner"}>
                            <Link href={"https://github.com/hyunwoo045"}>
                                <Image src={'/images/github_icon.png'} alt={'github_logo'} width={30} height={30}/>
                            </Link>
                        </span>
                    </div>
                </div>
            </div>

            <style jsx>{`
              .header {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 60px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                //z-index: 9999;
                display: flex;
                align-items: center;

                .logo {
                  position: relative;
                  left: 10px;
                  width: 55px;
                  border-radius: 50%;
                  opacity: 0.6;
                  background-color: #f00;
                  display: flex;
                  align-items: center;
                  cursor: pointer;
                }

                .header__title {
                  margin-left: 34px;
                  font-size: 18px;
                  cursor: pointer;                  
                }

                .header__nav {
                  position: absolute;
                  right: 20px;
                  display: flex;
                  align-items: center;

                  .nav__item:before {
                    content: "";
                    width: 1px;
                    height: 12px;
                    background-color: #e5e5e5;
                    position: absolute;
                    top: 0;
                    bottom: 0;
                    margin: auto;
                  }

                  .nav__item:first-child:before {
                    display: none;
                  }

                  .nav__item {
                    position: relative;
                    display: flex;
                    align-items: center;

                    .nav__item__inner {
                      display: block;
                      font-size: 12px;
                      padding: 11px 24px;
                      color: #656565;
                    }
                  }
                }
              }
            `}</style>
        </>
    )
}