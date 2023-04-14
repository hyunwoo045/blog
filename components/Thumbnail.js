import Image from "next/image";

export default function Thumbnail({ title, date, tags }) {
    return (
        <>
            <div className={"thumbnail"}>
                <div className={"thumbnail__image_container"}>
                    <div className={"thumbnail__image"}>
                        <Image src={'/images/document.png'} alt={'doc'} width={180} height={150} priority={true}/>
                    </div>
                </div>

                <div className={"thumbnail__title"}>{title}</div>

                <div className={"thumbnail__date"}>posted at: {date}</div>

                <div className={"thumbnail__tags"}>
                    {tags.map((tag, idx) => {
                        return (
                            <div key={idx} className={"tag"}>
                                {tag}
                            </div>
                        )
                    })}
                </div>
            </div>

            <style jsx>
                {`
                  .thumbnail {
                    position: relative;
                    margin: 17px;
                    width: 300px;
                    height: 340px;
                    box-shadow: 0 1px 2px rgb(0, 0, 0);
                    transition: 0.5s;

                    &:hover {
                      transform: scale(1.1);
                    }

                    .thumbnail__image_container {
                      margin: 20px 0;
                      width: 100%;
                      display: flex;
                      justify-content: center;
                      border-bottom: 2px solid #e6e6e6;

                      .thumbnail__image {
                        position: relative;
                        opacity: 0.4;
                        margin: 15px 0;
                      }
                    }

                    .thumbnail__title {
                      margin: 10px;
                      font-size: 16px;
                      font-weight: 700;
                    }

                    .thumbnail__date {
                      margin: 10px;
                      font-size: 13px;
                      color: #6b6b6b;
                    }

                    .thumbnail__tags {
                      position: relative;
                      margin: 8px;
                      padding-top: 8px;
                      font-size: 13px;
                      display: flex;
                      flex-wrap: wrap;

                      .tag {
                        font-size: 11px;
                        background-color: #868686;
                        color: #fff;
                        font-weight: 700;
                        border-radius: 10%;
                        margin: 1px;
                        padding: 6px;
                      }
                    }
                  }
                `}
            </style>
        </>
    )
}