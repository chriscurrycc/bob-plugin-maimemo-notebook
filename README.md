<div>
  <h1 align="center">墨墨背单词云词本 Bob 插件</h1>
  <p align="center">
    <a href="https://github.com/chriscurrycc/bob-plugin-maimemo-notebook/releases" target="_blank">
        <img src="https://github.com/chriscurrycc/bob-plugin-maimemo-notebook/actions/workflows/release.yaml/badge.svg" alt="release">
    </a>
    <a href="https://github.com/chriscurrycc/bob-plugin-maimemo-notebook/releases">
        <img alt="GitHub Repo stars" src="https://img.shields.io/github/stars/chriscurrycc/bob-plugin-maimemo-notebook?style=flat">
    </a>
    <a href="https://github.com/chriscurrycc/bob-plugin-maimemo-notebook/releases">
        <img alt="GitHub Repo stars" src="https://img.shields.io/badge/Maimemo-Notebook-brightgreen?style=flat">
    </a>
    <a href="https://github.com/chriscurrycc/bob-plugin-maimemo-notebook/releases">
        <img alt="GitHub Repo stars" src="https://img.shields.io/badge/langurage-TypeScript-brightgreen?style=flat&color=blue">
    </a>
  </p>
</div>

> 我开发了一个 iOS 快捷指令来实现同样的功能，如果你是 iPhone/iPad 用户，请[点击此处查看使用文档](https://memo.chriscurry.cc/m/NtMnTGVJfkXuLoRJaMYKy5)

## 演示

### Bob 插件使用
![Nov-10-2024 22-30-22](https://github.com/user-attachments/assets/b6c0257f-d5da-496c-8443-24b1be085c18)

### 墨墨背单词软件
![919shots_so](https://github.com/user-attachments/assets/ce3449e9-343f-4b1c-a90e-050332170dfb)

## 简介

本插件可以将 Bob 软件查询的生词直接添加到墨墨云词本。

此外，如果翻译的是句子，在启用例句模式后，可以自行选择例句中的生词，将生词添加到云词本后，还会为所选生词创建当前例句（以及例句的翻译）。这让我们在墨墨不仅仅能背诵生词，还可以查看我们添加的例句。

保留了上下文的生词，相信你会记得更快！

## 为什么要开发这个插件

今年 6 月份左右，墨墨背单词推出了开放 API，那时我已经连续使用这个单词软件近 1 年。

我一直在思考如何让背单词与我的英语学习工作流结合起来，而不仅仅是像读书时候一样去背词书。由于工作中看的都是英文资料，平时喜欢听英文播客，这些材料中已经提供了大量的生词供我背诵，可面临的问题是单词的查询和录入是割裂的，在没有开放 API 之前，我只能在 Bob 里查询单词，然后隔一段时间再导出查询纪录，将单词复制到墨墨的单词本，久而久之我就放弃了：

1. Bob 历史纪录有限，如果查询太多，需要经常导出来录入
2. 需要记得来导出，并录入
3. 只能录入生词，没了上下文，去背诵这个单词的时候忘记是在哪看到的了

而如今，得益于 Bob 和墨墨开放 API，录入结合到了“查词”这个行为当中，查的同时就帮你完成录入，还能在查句子的同时，将句子添加到某个单词的例句，这也保留了上下文，这无疑提供了单词背诵的效率。

我向来也不喜欢死背单词，所以生词都来源于我日常的输入材料，如今，这一过程变得自动化，而未来，我还想做得更加智能：利用自然语言模型的能力，在用户翻译一个句子的时候，帮助用户推测这里面有哪些词对于用户是生词，从而自动添加。

### 我的墨墨使用纪录

![19C775E9-DE55-4F9A-A258-8E7131EC0DB6](https://github.com/user-attachments/assets/ca36b5f1-38ee-4cdc-8106-2e853b6d3440)

## 云词本使用方法

1. 安装 [Bob](https://bobtranslate.com/guide/#%E5%AE%89%E8%A3%85) (版本 >= 0.50)，一款 macOS 平台的翻译和 OCR 软件

2. 下载此插件: [bobplugin-maimemo-notebook.bobplugin](https://github.com/chriscurrycc/bob-plugin-maimemo-notebook/releases/latest)

3. 下载完成后双击 `bobplugin-maimemo-notebook.bobplugin` 文件以安装此插件，并在服务中找到并添加

  ![step1](https://github.com/user-attachments/assets/6b58e2a3-a4fd-42de-84ce-539d205e5083)

4. 打开墨墨背单词 App，在「我的 > 更多设置 > 实验功能 > 开放 API」申请并复制 Token

5. 把 Token 填入 Bob 偏好设置 > 服务 > 此插件配置界面的「墨墨开放 API Token」的输入框中

> 插件会帮你生成一个「Bob Plugin」的云词本来录入在 Bob 查询的生词。如果想把生词添加到自己已有的云词本，也可以在[墨墨开放 API 平台](https://open.maimemo.com/#/operations/maimemo.openapi.notepad.v1.NotepadService.ListNotepads)查询自己的云词本列表，并把对应词本 ID 复制填入到「墨墨云词本 ID」配置项

![step2](https://github.com/user-attachments/assets/af829e76-f990-4419-bbd9-e4a5f41e1899)

6. 保存配置

## 创建例句

> ⚠️ 注意：你的墨墨等级需要达到 Lv4 才能创建例句

完成以上配置就可以实现生词添加到云词本功能，插件只会识别到是单词时才会添加，如果是例句则会跳过。如果想把查询到的例句也添加到某个单词，则还需要如下的额外配置。

> 注：由于目前 Bob 不支持插件自身来决定展开/折叠从而触发相应逻辑。因此我想到的是将此插件添加两次：
> 1. 其中一个默认展开，只识别单词并录入生词本
> 2. 另一个默认收起，甚至可以「隐藏并钉到语言栏」，当翻译句子时，自己补充好句子中不懂的生词，然后手动点击，来将单词添加到生词本，以及为单词创建该例句和对应翻译（见演示 gif 后半部分）

创建例句除了要使用墨墨开放 API Token 外，还需要借助于翻译引擎（因为墨墨不能只添加例句，还需要添加对应翻译），因此我们选择了最近刚内置到 Bob 的智谱翻译，我觉得智谱翻译的质量还不错，最主要的是提供免费的模型调用。

1. 去[智谱 AI 开放平台](https://bigmodel.cn)注册并登录，复制 [API Key](https://bigmodel.cn/usercenter/apikeys) 粘贴到配置项中的「智谱 API 密钥」

> 默认的智谱语言模型为免费的「GLM-4-Flash」，如果要切换到更高质量的模型请自行参考[智谱官方价格](https://open.bigmodel.cn/pricing)决定

2. 将「添加例句到生词」切换为「是」

![step3](https://github.com/user-attachments/assets/79518b40-d37f-4b38-95d0-a03374188c85)

3. 保存配置

4. 将例句识别这个版本折叠起来（强烈推荐，这样可以做到单词添加完毕后再手动执行插件）

![step4](https://github.com/user-attachments/assets/bd07333a-2b5d-4586-9d41-1bd1f84a35cc)

## 注意事项
1. 例句录入失败的多数原因是单词未在墨墨词库中收录，请去除单词时态等等重新尝试
2. 单词录入不会判断该单词是否存在于墨墨词库，云词本可以添加任意文本，但也只有墨墨词库中收录的词汇才能进行学习

## 致谢
首先要感谢 Bob 翻译的开发者 [@ripperhe](https://github.com/ripperhe)，感谢他开发了如此优秀的翻译软件，并设计了插件系统，没有这些努力，也不会有这个插件。初期在构思这个插件的时候，和他还进行了一些交流，感谢他提供的思路和指导。

其次是感谢墨墨背单词，这是一款很优秀的背单词软件，我已经连续使用一年以上，墨墨也在今年推出了开放 API，让单词录入变得更加简单。

最后感谢智谱，提供了免费调用的大模型，让我们能够使用免费的高质量翻译服务。
