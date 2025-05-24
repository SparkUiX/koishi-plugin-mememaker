import { Context, Schema, h, Logger } from "koishi";
const logger = new Logger("mememaker");
import { } from "koishi-plugin-canvas";
export const name = "mememaker";
export interface Config {
  isSendTimes: boolean;
  transtolanguage: "en" | "ja" | "ko";
  loggerinfo: boolean;
  cntWarpLength: number;
  jptWarpLength: number;
}
export const usage = `
---
## 项目效果图


<img src="https://i0.hdslb.com/bfs/openplatform/8693f69a20af44cce0356d4a7584ea211aeb0487.png" height="400" width="400"  referrerpolicy="no-referrer" alt="readme">


（究竟是谁在迫害[风切](/market?keyword=email:2536810643@qq.com)啊

---
## 使用方法
如你所见，你可以通过以下命令使用本插件：
- 使用 自动翻译 来翻译文字：
  \`\`\`
  入典 <文字>
  \`\`\`
- 使用 \`-n\` 参数指定翻译后的文字：
  \`\`\`
  入典 <文字> -n <翻译的文字>
  \`\`\`
---
`;

export const inject = {
  required: ["database", "canvas"],
};

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
  cntWarpLength: Schema.number().default(12).description("大字每行字数"),
  jptWarpLength: Schema.number().default(24).description("小字每行字数"),
});

export class RuDian {
  ctx: Context;
  cntWarpLength: number;
  jptWarpLength: number;
  constructor(ctx: Context, cntWarpLength, jptWarpLength) {
    this.ctx = ctx;
    this.cntWarpLength = cntWarpLength;
    this.jptWarpLength = jptWarpLength;
  }
  async RDOne(imageURL: string, cnt: string, jpt: string = "") {
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

    // 按照换行分开后，大字12个字一行，小字20个字一行
    const cnts = cnt.split("\n").reduce((prev, curr) => {
      const len = Math.ceil(curr.length / this.cntWarpLength);
      const arr = [];
      for (let i = 0; i < len; i++) {
        arr.push(curr.slice(i * this.cntWarpLength, (i + 1) * this.cntWarpLength));
      }
      return [...prev, ...arr];
    }, [] as string[]);

    const jpts = jpt.split("\n").reduce((prev, curr) => {
      const len = Math.ceil(curr.length / this.jptWarpLength);
      const arr = [];
      for (let i = 0; i < len; i++) {
        arr.push(curr.slice(i * this.jptWarpLength, (i + 1) * this.jptWarpLength));
      }
      return [...prev, ...arr];
    }, [] as string[]);

    const textHeight = 0.06 * cnts.length + 0.03 * jpts.length;

    const canvas = await ctx.canvas.createCanvas(
      width,
      height + (0.01 + textHeight) * width
    );
    const context = canvas.getContext("2d");
    context.filter = "grayscale(100%)";
    context.drawImage(image, 0, 0, width, height);
    context.filter = "none";
    context.fillStyle = "black";
    context.fillRect(0, height, width, (0.01 + textHeight) * width);
    // 添加文字
    context.font = `${0.06 * width}px  Arial`; //;
    context.fillStyle = "white";
    context.textAlign = "center";
    context.textBaseline = "middle";
    //context.fillText(cnt, width / 2, height + 0.04 * width);
    cnts.forEach((cnt, index) => {
      context.fillText(
        cnt,
        width / 2,
        height + 0.01 * width + 0.03 * width + 0.06 * width * index
      );
    });
    context.font = `${0.03 * width}px Arial`; // `;
    //context.fillText(jpt, width / 2, height + 0.08 * width);
    jpts.forEach((jpt, index) => {
      context.fillText(
        jpt,
        width / 2,
        height +
        0.01 * width +
        0.06 * cnts.length * width +
        0.015 * width +
        0.03 * width * index
      );
    });
    const outputbuffer = await canvas.toBuffer("image/png");
    // console.log(outputbuffer)
    return h.image(outputbuffer, "image/png");
  }
  // //这个是个没写完的功能
  // async RDTwo(imageURL: string, cnt: string, jpt: string) {
  //   //第二个 黑白 上方文字
  //   const ctx = this.ctx;
  //   const image = await ctx.canvas.loadImage(imageURL);
  //   //@ts-ignore
  //   const width = image.width;
  //   //@ts-ignore
  //   const height = image.height;
  //   console.log(width, height);
  //   const canvas = await ctx.canvas.createCanvas(width, height);
  //   const context = canvas.getContext("2d");
  //   context.drawImage(image, 0, 0, width, height);
  //   let captionHeight = width / 20;
  //   let captionWidth = width / 2;
  //   let captionX = width / 2 - captionWidth / 2; // 中心位置
  //   let captionY = height - 2.2 * captionHeight; // 4/5处

  //   // 创建一个渐变
  //   let gradient = context.createLinearGradient(
  //     captionX,
  //     0,
  //     captionX + captionWidth,
  //     0
  //   );
  //   gradient.addColorStop(0, "rgba(0,0,0,0)");
  //   gradient.addColorStop(0.1, "rgba(0,0,0,0.5)");
  //   gradient.addColorStop(0.9, "rgba(0,0,0,0.5)");
  //   gradient.addColorStop(1, "rgba(0,0,0,0)");

  //   // 设置渐变和模糊
  //   context.fillStyle = gradient;
  //   context.shadowColor = "black";
  //   context.shadowBlur = 100;

  //   // 绘制字幕区域
  //   context.fillRect(captionX, captionY, captionWidth, captionHeight);
  //   context.shadowBlur = 0; // 清除模糊，以免影响后续的绘制
  //   context.fillStyle = "white";
  //   context.textAlign = "center";
  //   context.textBaseline = "middle";

  //   const firstLine = cnt;
  //   const secondLine = jpt;
  //   context.font = `${(2 * width) / 100}px Arial`; //Arial
  //   context.fillText(firstLine, width / 2, captionY + width / 67);

  //   context.fillText(secondLine, width / 2, captionY + width / 28);
  //   let imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  //   // let numNoisePoints = 100000;
  //   // for(let i = 0; i < numNoisePoints; i++) {
  //   //   let x = Math.random() * canvas.width;
  //   //   let y = Math.random() * canvas.height;
  //   //   context.fillStyle = 'rgba(128,128,128,' + Math.random() + ')';
  //   //   context.fillRect(x, y, 1, 1);
  //   // }
  //   context.globalCompositeOperation = "soft-light";
  //   context.fillStyle = "rgba(128,128,128,0.5)";
  //   context.fillRect(0, 0, canvas.width, canvas.height);
  //   // context.putImageData(imageData, 0, 0);
  //   const buffer = await canvas.toBuffer("image/png");
  //   return h.image(buffer, "image/png");
  // }

  //将翻译存入数据库，在翻译相同内容时读取已有的翻译
  async translate(cnt: string, lang: Config["transtolanguage"] = "ja") {
    let jpt = "";

    // 获取数据库中已有的翻译
    const trans = (
      await this.ctx.database.get("rdTrans", {
        cnt,
        transtolanguage: lang,
      })
    )[0];

    if (!trans) {
      let jpts;
      try {
        jpts = await this.ctx.http.get(
          // `https://api.jaxing.cc/v2/Translate/Tencent?SourceText=${cnt}&Target=${lang}`
          `https://suapi.net/api/text/translate?to=${lang}&text[]=${cnt}`
        );
      } catch (error) {
        logger.info(error);
        return "获取翻译失败...";
      }
      jpt = jpts.data[0].translations[0].text;
      await this.ctx.database.create("rdTrans", {
        cnt,
        jpt,
        transtolanguage: lang,
      });
    } else {
      jpt = trans.jpt;
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
      if (config.loggerinfo) {
        logger.info(`数据统计： ` + request);
      }
      /**
       * 此方法用于统计用户使用情况，用户自愿开启，不会收集任何隐私信息
       */
    } catch (e) {
      logger.info(e);
    }
  }
  const rd = new RuDian(ctx, config.cntWarpLength, config.jptWarpLength);
  ctx
    .command("入典 <...cnt>")
    .option("istrans", "-n <jpt>")
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
      let sessioncontent: string = session.stripped.content;
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
        const jpt = await rd.translate(cnt, config.transtolanguage);
        if (config.loggerinfo) {
          logger.info(`翻译返回内容为` + jpt);
        }
        session.send(await rd.RDOne(imageURL as string, cnt, jpt));
      } else {
        if (
          options.istrans.includes("<") &&
          options.istrans.includes(">") &&
          options.istrans.includes("http")
        ) {
          options.istrans = options.istrans.replace(/<.*?>/, ""); // 用空字符串替换被 < 和 > 包裹的内容
        }
        session.send(await rd.RDOne(imageURL as string, cnt, options.istrans));
      }
      await PostTimedata("入典", 1);
      return;
    });

  // ctx.command("入典2 <cnt> <jpt>").action(async ({ session }, cnt, jpt) => {
  //   let quotemessage: string | h[];
  //   let imageURL: string | Buffer | URL | ArrayBufferLike;
  //   try {
  //     quotemessage = session.quote.content;
  //     imageURL = h.select(quotemessage, "img").map((a) => a.attrs.src)[0];
  //   } catch (e) {
  //     console.log(e);
  //     return "请引用正确的图片内容";
  //   }
  //   // const rd=new RuDian(ctx)
  //   session.send(await rd.RDTwo(imageURL as string, cnt, jpt));
  //   await PostTimedata("入典2", 1);
  //   return;
  // });
}
