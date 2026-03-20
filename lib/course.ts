export const courseLinks = {
  docs: '/docs',
  outline: '/docs/00-课程大纲',
};

export const courseStats = [
  {
    label: '12 篇课程',
    value: '00 到 11',
    description: '从课程地图一路推进到服务端与客户端实战。',
  },
  {
    label: '4 个阶段',
    value: '原理到落地',
    description: '第一性原理、标准体系、流程拆解、实战实现。',
  },
  {
    label: '1 条主线',
    value: '共享秘密到 Passkey',
    description: '把每个设计决策都还原到它的安全动机。',
  },
] as const;

export const coursePhases = [
  {
    range: '00',
    title: '课程地图',
    description: '先建立章节依赖与整体路线，知道后续为什么必须按顺序推进。',
  },
  {
    range: '01-03',
    title: '第一性原理',
    description: '从密码模型的问题出发，推到公钥认证与 challenge-response。',
  },
  {
    range: '04-06',
    title: '标准与协议',
    description: '把 FIDO、WebAuthn 与 CTAP 的职责边界拆清楚。',
  },
  {
    range: '07-11',
    title: '流程、威胁与实战',
    description: '深入注册与认证流程，再落到威胁模型和代码实现。',
  },
] as const;

export const readingSteps = [
  {
    title: '先读 00，建立全局地图',
    description: '课程大纲先解决“有哪些章节、彼此如何依赖”的问题。',
  },
  {
    title: '再按 01 到 11 顺序推进',
    description: '后面的章节都建立在前面的抽象和术语之上，跳读只会造成概念断层。',
  },
  {
    title: '把侧边栏当成唯一正式目录',
    description: '入口页只保留起步说明，不再重复堆叠同一批章节链接。',
  },
] as const;
