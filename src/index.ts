import { Context, Schema, h, Session } from 'koishi'
import { } from 'koishi-plugin-canvas';
export const name = 'mememaker'
export interface Config {isSendTimes: boolean;}
export const usage = `
## ↓这里是效果图及使用方法
![img](http://ninjas-get.000.pe/Assets/MMMakerPreview/preview1.png)
（究竟是谁在迫害[风切](/market?keyword=email:2536810643@qq.com)啊
`
export const inject = ['canvas']
export const Config: Schema<Config> = Schema.object({isSendTimes: Schema.boolean().default(true).description('这个开关用来确认是否向开发者反馈使用情况，自愿开启，可以用于鼓励开发者'),})
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
        context.font = `${6*width/100}px Arial`;
        context.fillStyle = 'white';
        context.textAlign='center'
        context.textBaseline='middle'
        context.fillText(cnt, width/2, image.naturalHeight + width/25);
        context.font = `${3*width/100}px Arial`;
        context.fillText(jpt, width/2, image.naturalHeight + width/12);
        const outputbuffer=await canvas.toBuffer('image/png')
        // console.log(outputbuffer)
        return h.image(outputbuffer,'image/png')
  }
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
  ctx.command('入典 <cnt> <jpt>')
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
        session.send(await rd.RDOne(imageURL as string, cnt, jpt))
        await PostTimedata('入典',1)
        return
    })
}