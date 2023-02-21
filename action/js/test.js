

document.getElementById("test").onclick = async function() {
    const res = await MessageJudge(
        {
            message: "你好你好你好你好你好你好你你好你好你好你好你好你好你好你好你好你好",
            title: "玉玉了", wait_time: 5000,
        },
    );
    console.log(res)
}
