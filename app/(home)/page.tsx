import Link from 'next/link';

const stats = [
  { label: '课程章节', value: '12' },
  { label: '核心主题', value: 'Passkey / WebAuthn / CTAP' },
  { label: '阅读方式', value: '从 00 到 11 顺序推进' },
];

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 py-16 sm:px-8 lg:px-12">
      <section className="relative overflow-hidden rounded-3xl border border-fd-border bg-linear-to-br from-fd-card via-fd-background to-fd-muted p-8 shadow-sm sm:p-10 lg:p-14">
        <div className="absolute inset-y-0 right-0 hidden w-1/3 bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.14),transparent_65%)] lg:block" />
        <div className="relative max-w-3xl">
          <p className="mb-4 text-sm font-medium tracking-[0.2em] text-fd-muted-foreground uppercase">
            Way to Passwordless
          </p>
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-fd-foreground sm:text-5xl">
            将当前课程文章整理为一套可静态部署的 Fumadocs 文档站
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-fd-muted-foreground sm:text-lg">
            课程从认证的第一性原理出发，逐步推导到 WebAuthn、CTAP、Passkey 与服务端实战实现。
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/docs"
              className="inline-flex items-center rounded-full bg-fd-primary px-5 py-3 text-sm font-medium text-fd-primary-foreground transition hover:opacity-90"
            >
              进入文档
            </Link>
            <Link
              href="/docs/01-%E8%AE%A4%E8%AF%81%E7%9A%84%E6%9C%AC%E8%B4%A8%E4%B8%8E%E5%AF%86%E7%A0%81%E7%9A%84%E7%BB%88%E5%B1%80"
              className="inline-flex items-center rounded-full border border-fd-border px-5 py-3 text-sm font-medium text-fd-foreground transition hover:bg-fd-accent"
            >
              从第一课开始
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        {stats.map((item) => (
          <article key={item.label} className="rounded-2xl border border-fd-border bg-fd-card p-5">
            <p className="text-sm text-fd-muted-foreground">{item.label}</p>
            <p className="mt-3 text-lg font-medium text-fd-foreground">{item.value}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
