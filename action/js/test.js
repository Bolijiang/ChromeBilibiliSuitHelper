

async function test() {
    const res = await MessageTips({message: `无法复制到剪贴板\n交易链接:\nhttps://www.bing.com/`, wait_time: 5000});
    console.log(res)
}
