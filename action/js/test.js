

async function test() {
    const res = await contentPage("GetSuitAssets", {item_id: "4664"});
    const page = createSuitFanNumberInfoPage(res["data"]["item"], 8848);

    const res1 = await MessageJudge(
        {
            message: page,
            wait_time: 5000,
            box: "dialog-suit"
        },
    );
    console.log(res1)
}
