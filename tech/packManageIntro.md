# 速览包管理器：npm, yarn, pnpm
## intro
- 它们都是前端的包管理器（package manager）
- 按时间先后来讲大概是：旧 > npm > yarn > pnpm > 新

## difference
### npm：Node PkgMakeinst

#### 时间
**最早发布的包管理器是 npm，早在 2010 年 1 月。它确立了包管理器今天如何工作的核心原则。**

#### npm 其实不是 "Node Package Manager" 的简称
> Is "npm" an acronym for "Node Package Manager"?
> 
> Contrary to popular belief, **`npm`** **is not** in fact an acronym for "Node Package Manager"; It is a recursive bacronymic abbreviation for **"npm is not an acronym"** (if the project was named "ninaa", then it would be an acronym). The precursor to **`npm`** was actually a bash utility named **"pm"**, which was the shortform name of **"pkgmakeinst"** - a bash function that installed various things on various platforms. If **`npm`** were to ever have been considered an acronym, it would be as "node pm" or, potentially "new pm".
> 
> “npm”是“Node Package Manager”的首字母缩写词吗？
>
> 与流行的看法相反，它实际上**并不是**“Node Package Manager”的首字母缩写词；它是 **npm is not an acronym** 的递归首字母缩写词（如果项目名为“ninaa”，那么它将是首字母缩略词）。的前身实际上是一个名为**"pm"**的 bash 实用程序，它是**"pkgmakeinst"**的简称——一个在各种平台上安装各种东西的 bash 函数。如果曾经被认为是首字母缩略词，它将是“node pm”，或者可能是“new pm”

---
### yarn：**Y**et **A**nother **R**esource **N**egotiator
#### 时间
在 2016 年 10 月的[一篇博文](https://engineering.fb.com/2016/10/11/web/yarn-a-new-package-manager-for-javascript/)中，Facebook 宣布与 Google 和其他一些公司合作开发一个新的包管理器，以解决 npm 当时存在的一致性、安全性和性能问题。他们将替代品命名为[Yarn](https://classic.yarnpkg.com/lang/en/)，它代表 Yet Another Resource Negotiator。

#### 特点：
尽管 Yarn 的架构设计基于 npm 建立的许多概念和流程，但 Yarn 在其初始版本中对包管理器领域产生了重大影响。与 npm 相比，Yarn 并行化操作以加快安装过程，这一直是 npm 早期版本的主要痛点。

#### 版本
Yarn v1[于 2020 年](https://classic.yarnpkg.com/en/docs/install#mac-stable)[进入维护模式](https://classic.yarnpkg.com/en/docs/install#mac-stable) 。从那时起，v1.x 系列被认为是旧版，并更名为 Yarn Classic。它的继任者 Yarn v2 或 Berry 现在是活跃的开发分支。

---
### Yarn (v2, Berry)
#### 时间
[Yarn 2](https://yarnpkg.com/)于 2020 年 1 月发布，被宣传为原始 Yarn 的重大升级。Yarn 团队开始将其称为 Yarn Berry，以更明显地表明它本质上是一个具有新代码库和新原则的新包管理器。

#### 特性
Yarn Berry 的主要创新是其[即插即用 (PnP)](https://yarnpkg.com/features/pnp/)方法，它是作为[修复`node_modules`](https://yarnpkg.com/features/pnp/#fixing-node_modules). 不是生成`node_modules`，而是生成具有依赖关系查找表的文件，因为它是单个文件而不是嵌套文件夹结构，因此可以更有效地处理。此外，每个包都以[zip 文件](https://yarnpkg.com/features/pnp/#packages-are-stored-inside-zip-archives-how-can-i-access-their-files)的形式存储在文件夹内，占用的磁盘空间比文件夹少。`.pnp.cjs`[](https://yarnpkg.com/features/pnp/#packages-are-stored-inside-zip-archives-how-can-i-access-their-files)`.yarn/cache/``node_modules`

---
### pnpm
#### 时间
pnpm 的第 1 版由 Zoltan [Kochan](https://pnpm.io/)于 2017 年发布。它是 npm 的替代品，所以如果你有一个 npm 项目，你可以马上使用 pnpm！

#### 动机
pnpm 的创建者对 npm 和 Yarn的[主要问题](https://medium.com/pnpm/why-should-we-use-pnpm-75ca4bfe7d93)是跨项目使用的依赖项的冗余存储。尽管 Yarn Classic 比 npm 具有速度优势，但它使用相同的依赖解析方法，这对 pnpm 的创建者来说是不行的：npm 和 Yarn Classic 使用 **hoisting** 来扁平化他们的`node_modules`.

pnpm 没有 **hoisting**，而是引入了另一种依赖解决策略：[内容可寻址存储](https://pnpm.io/next/symlinked-node-modules-structure)。此方法会生成一个嵌套`node_modules`文件夹，该文件夹将包存储在您的主文件夹 ( ) 上的全局存储中。每个版本的依赖项仅物理存储在该文件夹中一次，构成单一事实来源并节省相当多的磁盘空间。`~/.pnpm-store/`

**pnpm 希望解决 node_modules 占用过多磁盘空间的问题：**

> 当使用 npm 或 Yarn 时，如果你有 100 个项目使用了某个依赖（dependency），就会有 100 份该依赖的副本保存在硬盘上。  而在使用 pnpm 时，依赖会被存储在内容可寻址的存储中，所以：
>
> 1.  如果你用到了某依赖项的不同版本，只会将不同版本间有差异的文件添加到仓库。 例如，如果某个包有100个文件，而它的新版本只改变了其中1个文件。那么 `pnpm update` 时只会向存储中心额外添加1个新文件，而不会因为仅仅一个文件的改变复制整新版本包的内容。
> 2.  所有文件都会存储在硬盘上的某一位置。 当软件包被被安装时，包里的文件会硬链接到这一位置，而不会占用额外的磁盘空间。 这允许你跨项目地共享同一版本的依赖。
## ref
[pnpm 项目初衷](https://pnpm.io/zh/motivation)

[[英文]JavaScript 包管理器比较：npm、Yarn 还是 pnpm？](https://blog.logrocket.com/javascript-package-managers-compared/)

[[英文] npm 其实不是 node package manager](https://github.com/npm/cli#is-npm-an-acronym-for-node-package-manager)