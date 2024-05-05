# koishi-plugin-mememaker

[![npm](https://img.shields.io/npm/v/koishi-plugin-mememaker?style=flat-square)](https://www.npmjs.com/package/koishi-plugin-mememaker)

## 如你所见，↓这是预览效果
![img](http://ninjas-get.000.pe/Assets/MMMakerPreview/preview2.png)

使用指令`入典 <上方文字>`回复所需图片即可，插件会自动调用翻译API
或者加入`-n`参数来指定下方文字
就像这样：`入典 A -n B`

# 究竟是谁在迫害风切（

### 我不是 我没有）

### 普通用户你可以不看这里

作为依赖类使用时，导入RuDian类，创建一个新对象，参数为ctx，然后使用RDOne方法即可，传入参数为imageURL，上段文字，下段文字
关于为什么是RDOne,因为RDTwo要等我更新（
使用示例：

`import { RuDian as rd } from 'koishi-plugin-mememaker';`
`export function apply(ctx: Context, config: Config) {`
`    ctx.command('test', 'test')`
`    .action(async ({ session }) => {`
`        const rd1 = new rd(ctx)`
`        session.send(await rd1.RDOne('http://example.com','测c试','测j试'))`
`    })`
`}`
调用此方法后，就会返回生成的图片，你可以选择session.send(记得await)或return它。

## 更新日志
- **1.0.6** 修复字体过小的问题

- **1.0.5** 更改预览图错误的问题

- **1.0.4** 新增白嫖的翻译API，可以自动翻译文字

- **1.0.3** 导出RuDian类，使插件可以作为依赖被调用

- **1.0.2** 对图片大小做了适配，对迫害风切的部分进行了补偿（

- **1.0.1** 增加依赖项