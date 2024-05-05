import { Context, Schema, h, Session } from 'koishi'
import { } from 'koishi-plugin-canvas';
export const name = 'mememaker'
export interface Config {isSendTimes: boolean;transtolanguage: 'en' | 'ja' | 'ko'}
export const usage = `
## ↓这里是效果图及使用方法
![img](http://ninjas-get.000.pe/Assets/MMMakerPreview/preview2.png)
（究竟是谁在迫害[风切](/market?keyword=email:2536810643@qq.com)啊
## 如你所见，你可以使用 \`入典 <文字1>\` 来使用自动翻译API来翻译文字，也可以使用 \`入典 <文字1> -n <文字2>\` 来直接输入翻译后的文字
## 你可以在下方的配置项处选择翻译的语言
`
export const inject = ['canvas']
export const Config: Schema<Config> = Schema.object(
  {
    isSendTimes: Schema.boolean().default(true).description('这个开关用来确认是否向开发者反馈使用情况，自愿开启，可以用于鼓励开发者'),
    transtolanguage:Schema.union([
      Schema.const('en').description('英语'),
      Schema.const('ja').description('日语'),
      Schema.const('ko').description('韩语'),
      // Schema.string().description('其他语言')
    ]).role('radio').default('ja').description('这个选项用来选择翻译的语言')
  }
)
export class RuDian {
  ctx: Context
  constructor(ctx: Context){
    this.ctx=ctx
  }
  async RDOne(imageURL: string,cnt: string,jpt: string){//第一个 黑白 下方文字
    const ctx=this.ctx
    const image=await ctx.canvas.loadImage(imageURL)
        
        const width=image.naturalWidth
        const height=image.naturalHeight
        const canvas=await ctx.canvas.createCanvas(width,height+width/10)
        const context=canvas.getContext('2d')
        context.filter='grayscale(100%)'
        context.drawImage(image, 0, 0, width, height)
        context.filter='none'
        context.fillStyle = 'black';
        context.fillRect(0, image.naturalHeight, width, width/10);
        // 添加文字
        context.font = `${6*width/100}px  Arial`//;
        context.fillStyle = 'white';
        context.textAlign='center'
        context.textBaseline='middle'
        context.fillText(cnt, width/2, image.naturalHeight + width/25);
        context.font = `${3*width/100}px Arial`// `;
        context.fillText(jpt, width/2, image.naturalHeight + width/12);
        const outputbuffer=await canvas.toBuffer('image/png')
        // console.log(outputbuffer)
        return h.image(outputbuffer,'image/png')
  }/*
  async RDTwo(imageURL: string,cnt: string,jpt: string){//第二个 黑白 上方文字
    const ctx=this.ctx
    const image=await ctx.canvas.loadImage(imageURL)
    const width=image.naturalWidth
    const height=image.naturalHeight
    const canvas=await ctx.canvas.createCanvas(width,height)
    const context=canvas.getContext('2d')
    context.drawImage(image, 0, 0, width, height);
    const subtitleHeight = height * 3 / 4;
    const gradientHeight = height / 4;
    
    // Create a gradient for the subtitle background
    const gradient = context.createLinearGradient(0, subtitleHeight, 0, subtitleHeight + gradientHeight);
    console.log(gradient.hasOwnProperty('addColorStop')) 
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0.5)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    
    // Draw the subtitle background
    context.fillStyle = gradient;
    context.fillRect(0, subtitleHeight, width, gradientHeight);
    
    // Set the font for the subtitle
    context.font = '30px Arial';
    context.fillStyle = 'white';
    context.textAlign = 'center';
    
    // Draw the first line of the subtitle
    const firstLine = cnt
    const secondLine = jpt
    context.fillText(firstLine, width / 2, subtitleHeight + 40);
    
    // Draw the second line of the subtitle
    context.fillText(secondLine, width / 2, subtitleHeight + 80);
    
    // Finally, export the canvas to an image
    const buffer =await canvas.toBuffer('image/png');
    return h.image(buffer, 'image/png');
  }*/
}
export function apply(ctx: Context,config: Config) {
  async function PostTimedata(command: string,times: number) {
    if(!config.isSendTimes) return
    const url=`https://90008.top/KoiAPI/PluginsUse/${name}/koitime.php`
    const data = {"command":command,"times":times}
    try{
    const request=await ctx.http.post(url, data,{headers: {'Content-Type': 'application/json'}})
    // console.log(request)
    /*
    此方法用于统计用户使用情况，用户自愿开启，不会收集任何隐私信息
    */
    }catch(e){
        console.log(e)
    }
  }
  ctx.command('入典 <cnt>')
  .option('istrans','-n <jpt>')
    .action(async ({ session,options },cnt) => {
        let quotemessage: string | h[]
        let imageURL: string | Buffer | URL | ArrayBufferLike
        try{
        quotemessage = session.quote.content;
        imageURL = h.select(quotemessage, 'img').map(a =>a.attrs.src)[0]
        }catch(e){
            console.log(e)
            return '请引用正确的图片内容'
        }
        const rd=new RuDian(ctx)
        if(!options.istrans){
          const jpts=await ctx.http.get(`https://api.jaxing.cc/v2/Translate/Tencent?SourceText=${cnt}&Target=${config.transtolanguage}`)
          const jpt=jpts.data.Response.TargetText
          console.log(jpts)
          session.send(await rd.RDOne(imageURL as string, cnt, jpt))
        }else{
          session.send(await rd.RDOne(imageURL as string, cnt, options.istrans))
        }
        await PostTimedata('入典',1)
        return
    })
    /*ctx.command('入典2 <cnt> <jpt>')
    .action(async ({ session },cnt,jpt) => {
        let quotemessage: string | h[]
        let imageURL: string | Buffer | URL | ArrayBufferLike
        try{
        quotemessage = session.quote.content;
        imageURL = h.select(quotemessage, 'img').map(a =>a.attrs.src)[0]
        }catch(e){
            console.log(e)
            return '请引用正确的图片内容'
        }
        const rd=new RuDian(ctx)
        session.send(await rd.RDTwo(imageURL as string, cnt, jpt))
        return
    })*/
}