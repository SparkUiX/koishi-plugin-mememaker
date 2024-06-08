import { Context, Schema, h, Logger } from "koishi";
const logger = new Logger("mememaker");
import {} from "koishi-plugin-canvas";
export const name = "mememaker";
export interface Config {
  isSendTimes: boolean;
  transtolanguage: "en" | "ja" | "ko";
  loggerinfo: boolean;
}
export const usage = `
## ↓这里是效果图及使用方法
![img](http://ninjas-get.000.pe/Assets/MMMakerPreview/preview2.png)
（究竟是谁在迫害[风切](/market?keyword=email:2536810643@qq.com)啊
## 如你所见，你可以使用 \`入典 <文字1>\` 来使用自动翻译API来翻译文字，也可以使用 \`入典 <文字1> -n <文字2>\` 来直接输入翻译后的文字
## 你可以在下方的配置项处选择翻译的语言
`;
export const inject = ["canvas", "database"];
export const Config: Schema<Config> = Schema.object({
  isSendTimes: Schema.boolean()
    .default(true)
    .description(
      "这个开关用来确认是否向开发者反馈使用情况，自愿开启，可以用于鼓励开发者"
    ),
  transtolanguage: Schema.union([
    Schema.const("en").description("英语"),
    Schema.const("ja").description("日语"),
    Schema.const("ko").description("韩语"),
    // Schema.string().description('其他语言')
  ])
    .role("radio")
    .default("ja")
    .description("这个选项用来选择翻译的语言"),
  loggerinfo: Schema.boolean().default(false).description("日志调试模式"),
});

export class RuDian {
  ctx: Context;
  config: Config;
  constructor(ctx: Context) {
    this.ctx = ctx;
  }
  async RDOne(imageURL: string, cnt: string, jpt: string) {
    //第一个 黑白 下方文字
    const ctx = this.ctx;
    const image = await ctx.canvas.loadImage(imageURL);

    //@ts-ignore
    let width = image.naturalWidth || image.width;
    //@ts-ignore
    let height = image.naturalHeight || image.height;

    if (width < 300) {
      height = Math.floor((300 * height) / width);
      width = 300;
    } else if (height < 300) {
      width = Math.floor((300 * width) / height);
      height = 300;
    }

    const canvas = await ctx.canvas.createCanvas(width, height + 0.1 * width);
    const context = canvas.getContext("2d");
    context.filter = "grayscale(100%)";
    context.drawImage(image, 0, 0, width, height);
    context.filter = "none";
    context.fillStyle = "black";
    context.fillRect(0, height, width, 0.1 * width);
    // 添加文字
    context.font = `${0.06 * width}px  Arial`; //;
    context.fillStyle = "white";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(cnt, width / 2, height + 0.04 * width);
    context.font = `${(3 * width) / 100}px Arial`; // `;
    context.fillText(jpt, width / 2, height + 0.0833 * width);
    const outputbuffer = await canvas.toBuffer("image/png");
    // console.log(outputbuffer)
    return h.image(outputbuffer, "image/png");
  }
  //这个是个没写完的功能
  async RDTwo(imageURL: string, cnt: string, jpt: string) {
    //第二个 黑白 上方文字
    const ctx = this.ctx;
    const image = await ctx.canvas.loadImage(imageURL);
    //@ts-ignore
    const width = image.width;
    //@ts-ignore
    const height = image.height;
    console.log(width, height);
    const canvas = await ctx.canvas.createCanvas(width, height);
    const context = canvas.getContext("2d");
    context.drawImage(image, 0, 0, width, height);
    let captionHeight = width / 20;
    let captionWidth = width / 2;
    let captionX = width / 2 - captionWidth / 2; // 中心位置
    let captionY = height - 2.2 * captionHeight; // 4/5处

    // 创建一个渐变
    let gradient = context.createLinearGradient(
      captionX,
      0,
      captionX + captionWidth,
      0
    );
    gradient.addColorStop(0, "rgba(0,0,0,0)");
    gradient.addColorStop(0.1, "rgba(0,0,0,0.5)");
    gradient.addColorStop(0.9, "rgba(0,0,0,0.5)");
    gradient.addColorStop(1, "rgba(0,0,0,0)");

    // 设置渐变和模糊
    context.fillStyle = gradient;
    context.shadowColor = "black";
    context.shadowBlur = 100;

    // 绘制字幕区域
    context.fillRect(captionX, captionY, captionWidth, captionHeight);
    context.shadowBlur = 0; // 清除模糊，以免影响后续的绘制
    context.fillStyle = "white";
    context.textAlign = "center";
    context.textBaseline = "middle";

    const firstLine = cnt;
    const secondLine = jpt;
    context.font = `${(2 * width) / 100}px Arial`; //Arial
    context.fillText(firstLine, width / 2, captionY + width / 67);

    context.fillText(secondLine, width / 2, captionY + width / 28);
    let imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    // let numNoisePoints = 100000;
    // for(let i = 0; i < numNoisePoints; i++) {
    //   let x = Math.random() * canvas.width;
    //   let y = Math.random() * canvas.height;
    //   context.fillStyle = 'rgba(128,128,128,' + Math.random() + ')';
    //   context.fillRect(x, y, 1, 1);
    // }
    context.globalCompositeOperation = "soft-light";
    context.fillStyle = "rgba(128,128,128,0.5)";
    context.fillRect(0, 0, canvas.width, canvas.height);
    // context.putImageData(imageData, 0, 0);
    const buffer = await canvas.toBuffer("image/png");
    return h.image(buffer, "image/png");
  }

  //获取翻译
  async translate(cnt: string, lang:Config["transtolanguage"] = "ja") {
    let jpt = "";
    // 数据库储存翻译，来提高下一次相同翻译内容时的调用速度
    const trans = await this.ctx.database.get("rdTrans", {
      cnt,
      transtolanguage: lang
    });
    if (trans.length === 0) {
      let jpts;
      try {
        jpts = await this.ctx.http.get(
          `https://api.jaxing.cc/v2/Translate/Tencent?SourceText=${cnt}&Target=${lang}`
        );
      } catch (error) {
        return "获取翻译失败...";
      }
      jpt = jpts.data.Response.TargetText;
      await this.ctx.database.create("rdTrans", {
        cnt,
        jpt,
        transtolanguage: lang,
      });
      console.log(jpts);
    } else {
      jpt = trans[0].jpt;
    }
    return jpt;
  }
}
//创建数据库
declare module "koishi" {
  interface Tables {
    rdTrans: RDTrans;
  }
}
export interface RDTrans {
  cnt: string;
  jpt: string;
  transtolanguage: Config["transtolanguage"];
}
export function apply(ctx: Context, config: Config) {
  //创建数据库
  ctx.database.extend(
    "rdTrans",
    {
      cnt: "string",
      jpt: "string",
      transtolanguage: "string",
    },
    {
      primary: ["cnt", "transtolanguage"],
    }
  );

  async function PostTimedata(command: string, times: number) {
    if (!config.isSendTimes) return;
    const url = `https://90008.top/KoiAPI/PluginsUse/${name}/koitime.php`;
    const data = { command: command, times: times };
    try {
      const request = await ctx.http.post(url, data, {
        headers: { "Content-Type": "application/json" },
      });
      console.log(request);
      /**
       * 此方法用于统计用户使用情况，用户自愿开启，不会收集任何隐私信息
       */
    } catch (e) {
      console.log(e);
    }
  }
  const rd = new RuDian(ctx);
  ctx.command("入典 <...cnt>").option("istrans", "-n <jpt>")
  .action(async ({ session, options }, ...cntArr) => {
    if (cntArr.length === 0) {
      return "未输入标题！";
    }
    // 过滤
    cntArr = cntArr.map((item) => {
      if (item.includes("<") && item.includes(">") && item.includes("http")) {
        return item.replace(/<.*?>/, ""); // 用空字符串替换被 < 和 > 包裹的内容
      }
      return item;
    });

    let quotemessage: string | h[];
    let imageURL: string | Buffer | URL | ArrayBufferLike;
    let sessioncontent: string = session.content;
    try {
      quotemessage = session.quote.content;
      imageURL = h.select(quotemessage, "img").map((a) => a.attrs.src)[0];
      if (config.loggerinfo && imageURL) {
        logger.info("用户触发的内容为  " + cntArr);
        logger.info("用户回复的内容为  " + quotemessage);
      }
    } catch (e) {
      // console.log(e)
      // return '请引用正确的图片内容'
      imageURL = h.select(sessioncontent, "img").map((a) => a.attrs.src)[0];
      if (!imageURL) {
        session.send("请在30s内发送图片");
        let usermessgae = await session.prompt(30000);
        if (config.loggerinfo) {
          logger.info("用户触发的内容为  " + cntArr);
          logger.info("用户输入的内容为  " + usermessgae);
        }

        imageURL = h.select(usermessgae, "img").map((a) => a.attrs.src)[0];
      }
    }
    if (!imageURL) {
      return "请使用正确的图片内容";
    }

    const cnt = cntArr.join(" ");

    if (!options.istrans) {
      const jpt = await rd.translate(cnt,config.transtolanguage);
      session.send(await rd.RDOne(imageURL as string, cnt, jpt));
    } else {
      session.send(await rd.RDOne(imageURL as string, cnt, options.istrans));
    }
    await PostTimedata("入典", 1);
    return;
  });

  ctx.command("入典2 <cnt> <jpt>").action(async ({ session }, cnt, jpt) => {
    let quotemessage: string | h[];
    let imageURL: string | Buffer | URL | ArrayBufferLike;
    try {
      quotemessage = session.quote.content;
      imageURL = h.select(quotemessage, "img").map((a) => a.attrs.src)[0];
    } catch (e) {
      console.log(e);
      return "请引用正确的图片内容";
    }
    // const rd=new RuDian(ctx)
    session.send(await rd.RDTwo(imageURL as string, cnt, jpt));
    await PostTimedata("入典2", 1);
    return;
  });
}
