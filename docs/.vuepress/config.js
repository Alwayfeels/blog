module.exports = {
  base: process.env.BASE || '/blog/',
  dest: 'public',
  title: 'CloudS\'s Blog',
  description: 'Just a place to share my thoughts',
  themeConfig: {
    sidebar: 'auto',
    displayAllHeaders: true // 默认值：false
  }
}