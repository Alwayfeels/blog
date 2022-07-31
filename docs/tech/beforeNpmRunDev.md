# npm run dev 后发生了什么？
## npm run \<command\>

 这条命令会检查该目录下的 package.json 文件的 script 属性
 
 ```json
   "scripts": {

    "dev": "vite",

    "build": "vite build",

    "preview": "vite preview"

  },
```

你也可以使用 `npm run`，系统会列出所有可使用的命令

```shell
Scripts available in tagging-music@0.1.0 via `npm run-script`:
  dev
    vite        
  build
    vite build  
  preview       
    vite preview
```

- 若找不到 package.json，则会一直向上一级文件夹寻找。如果还是找不到，则会报错 `no such file or directory, open '<project_src>\package.json'`

- 若找到了 package.json 但是没有该指令，会报错 `Missing script: "<command>"`

- 若找到了该指令，则会到该目录的 `node_modules/.bin` 文件夹下寻找对应的指令文件（bin = binary 可执行二进制文件）

![[Pasted image 20220620151928.png]]
- 该文件开头的`#!/bin/sh`说明了这是一个可执行的 shell 脚本

-  `npm` 会把 `node_modules` 下的`.bin` 目录添加到 `$PATH`环境变量，因此可以全局执行。执行完后再删掉。

- tips: 如果安装的时候使用了 -g 标识符全局安装，则会永久被添加进环境变量中，变得可全局执行。如果不想全局安装又想运行某个包，可以使用 `npx run <packageName>`。该命令会直接调用已安装的包

### 以 vue-cli-service 为例：
`node_modules\.bin\vue-cli-service` 相当于一个快捷方式，但它指向的是 `node_modules\@vue\cli-service\bin\vue-cli-service.js`。

- 综上所述，`npm run serve` 就是在运行 `vue-cli-service.js` 这个 `js` 文件

## ref
[输入 npm run xxx 后发生了什么？](https://juejin.cn/post/7097947121210359839)
[npm run serve 后发生了什么](http://drinkmilker.com/index.php/archives/33/) （该文章包含vue-cli-service.js 的函数解析）