export default function PostListItem({ title, date, tags }) {

    return (
        <>
            <div className={"item__box"}>
                <div className={"box_title"}>
                    {title}
                </div>

                <div className={"box_date"}>
                    {date}
                </div>

                <div className={"box_tags"}>
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
                  .item__box {
                    border: 1px solid #e6e6e6;
                    border-radius: 10px;
                    width: 90%;
                    margin: 12px;
                    padding: 12px 20px;
                    box-sizing: border-box;
                    
                    .box_title {
                      font-size: 21px;
                      font-weight: 700;
                      margin: 7px 0;
                    }

                    .box_date {
                      font-size: 14px;
                      color: #797979;
                      margin: 7px 0;
                    }

                    .box_tags {
                      display: flex;
                      flex-wrap: nowrap;
                      margin: 7px 0;

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