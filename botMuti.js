
const config = require("./config.json");
const mineflayer = require("mineflayer");

const users = config.users;

for (let i in users) {
    // 每隔500ms执行一次，i*500实现递增延迟
    setTimeout(() => {
        summon(i);
    }, i * config.options.connectTime*1000);
}
function summon(index){


// 机器人设置
    const options = {
        host: config.options.ip,    // 服务器IP
        port: config.options.port,          // 端口
        username: users[index], // 假人名字
        viewDistance: 'tiny',   // 优化
        version: config.options.version     // 版本号，库会自动处理协议
    }
    const commands = config.commands;
// 定义话术库
    const quotes = config.message;
// 设置一个定时器每隔 x秒 到 x秒 之间随机讲一次话
    const minDelay = config.options.min * 1000; // 禁止小于3秒
    const maxDelay = config.options.max * 1000; //
    const autoConnect = config.options.autoConnect * 1000;
    const hd = config.hd;

// 创建机器人实例
    var bot = mineflayer.createBot(options);
    var first = true;
    var timeout;

    init();



    function init(){
        flag = true;
        if (commands.length != 0 && commands.length != undefined) autoCommand();
        if (quotes.length !=0 && quotes != undefined) sendTalk();
        if (hd) {
            // 这个事件会捕获“所有”出现在左下角聊天栏的文字
            bot.on('message', (jsonMsg) => {
                // toAnsi() 会保留服务器聊天的颜色（在控制台中显示颜色）
                // toString() 则是纯文本
                console.log(jsonMsg.toAnsi());
            });
        }

        // TODO 资源包下载
        // bot.on('resource_pack', (url, hash) => {
        //     console.log(`need to download: ${url}`);
        //     bot.acceptResourcePack();
        //     setTimeout(() => {
        //         console.log('complete');
        //     }, 1000);
        // });

        // 报错处理
        bot.on('error', (err) => console.log('[信息]报错了:', err))
        bot.on('kicked', (reason) => console.log('[信息]被踢了:', reason))
        // 断开重新连接
        bot.on('end', (reason) => {
            clearTimeout(timeout);
            console.log(`[信息]连接断开，原因： ${reason}。${autoConnect}ms后尝试重连...`);
            // 5秒后重新调用自己
            setTimeout( () => {
                bot = mineflayer.createBot(options);
                init();
            }, autoConnect);
        });


    }

    async function autoCommand(){
        // 当机器人出生（正式进入世界）时触发
        bot.on('spawn', () => {
            console.log('[信息]机器人已生成，准备执行自定义登录指令...');
            bot.physics.enabled = false;    // 核心优化
            // 延迟 2 秒执行
            setTimeout(async () => {
                for (let i = 0 ; i  <commands.length; i++){
                    await bot.chat(commands[i]);
                }
            }, 2000);
        });
    }


    async function sendTalk(){
        // 随机选一句话
        const randomIndex = Math.floor(Math.random() * quotes.length);
        const message = quotes[randomIndex];
        if (bot && typeof bot.chat === 'function' && !first) {
            bot.chat(message);
        } else {
            console.log('[警告] 机器人聊天暂不可用，跳过本次讲话');
        }
        first = false;
        // 计算下次讲话的随机时间
        const nextDelay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;

        timeout = setTimeout(sendTalk, nextDelay);
    }

}
