

async function test() {
    res = await MessageJudge({message: `无法复制到剪贴板\n交易链接:\n${1111111111111111111111111111111}`, wait_time: 5000});
    console.log(res)
}
