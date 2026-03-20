import Link from 'next/link';
import { courseLinks, coursePhases, courseStats, readingSteps } from '@/lib/course';

const primaryActionClass =
  'inline-flex items-center rounded-full bg-emerald-600 px-5 py-3 text-sm font-medium text-white transition duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-emerald-700 active:translate-y-px';

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold tracking-[0.22em] text-emerald-700 uppercase">
      {children}
    </p>
  );
}

function PhaseRail() {
  return (
    <ol className="mt-5 divide-y divide-fd-border/80">
      {coursePhases.map((phase) => (
        <li key={phase.range} className="grid gap-3 py-4 sm:grid-cols-[92px_minmax(0,1fr)] sm:gap-4">
          <div className="text-sm font-medium text-fd-foreground">{phase.range}</div>
          <div>
            <h3 className="text-base font-medium tracking-tight text-fd-foreground">{phase.title}</h3>
            <p className="mt-1 text-sm leading-6 text-fd-muted-foreground">{phase.description}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

function ReadingList() {
  return (
    <ol className="mt-5 space-y-5">
      {readingSteps.map((step, index) => (
        <li key={step.title} className="grid gap-3 sm:grid-cols-[36px_minmax(0,1fr)] sm:gap-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-sm font-medium text-emerald-700">
            {index + 1}
          </div>
          <div>
            <h3 className="text-base font-medium tracking-tight text-fd-foreground">{step.title}</h3>
            <p className="mt-1 text-sm leading-6 text-fd-muted-foreground">{step.description}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function CourseLanding() {
  return (
    <main className="mx-auto flex w-full max-w-[1400px] flex-1 flex-col px-6 py-10 sm:px-8 lg:px-12 lg:py-14">
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.92fr)]">
        <div className="relative overflow-hidden rounded-[2rem] border border-fd-border/80 bg-fd-card/85 p-8 shadow-[0_24px_70px_-40px_rgba(15,23,42,0.28)] sm:p-10 lg:p-12">
          <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-2/5 bg-[radial-gradient(circle_at_center,rgba(5,150,105,0.14),transparent_70%)] lg:block" />
          <div className="relative max-w-3xl">
            <SectionEyebrow>Way to Passwordless</SectionEyebrow>
            <h1 className="mt-4 max-w-2xl text-4xl font-semibold tracking-tight text-fd-foreground sm:text-5xl">
              无密码认证，从共享秘密走到 Passkey
            </h1>
            <p className="mt-5 max-w-[62ch] text-base leading-8 text-fd-muted-foreground sm:text-lg">
              这不是一组零散文章，而是一条从认证第一性原理出发、逐步推导到 WebAuthn、CTAP 和
              Passkey 实战的完整路线。
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link href={courseLinks.docs} className={primaryActionClass}>
                进入课程文档
              </Link>
              <p className="text-sm leading-6 text-fd-muted-foreground">
                侧边栏提供完整目录，文档首页只保留起步说明。
              </p>
            </div>
            <dl className="mt-10 grid gap-5 border-t border-fd-border/80 pt-6 sm:grid-cols-[1.05fr_0.95fr_1.2fr]">
              {courseStats.map((item) => (
                <div key={item.label} className="space-y-2">
                  <dt className="text-xs font-medium tracking-[0.18em] text-fd-muted-foreground uppercase">
                    {item.label}
                  </dt>
                  <dd className="text-lg font-medium tracking-tight text-fd-foreground">{item.value}</dd>
                  <p className="text-sm leading-6 text-fd-muted-foreground">{item.description}</p>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <aside className="rounded-[2rem] border border-fd-border/80 bg-fd-card/80 p-6 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.22)] sm:p-8">
          <SectionEyebrow>课程主线</SectionEyebrow>
          <p className="mt-4 max-w-[36ch] text-sm leading-7 text-fd-muted-foreground">
            先把认证模型搭稳，再进入标准与协议，最后回到真实注册、登录和服务端验证。
          </p>
          <PhaseRail />
        </aside>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)]">
        <div className="rounded-[1.75rem] border border-fd-border/80 bg-fd-card/75 p-6 sm:p-8">
          <SectionEyebrow>阅读方式</SectionEyebrow>
          <ReadingList />
        </div>

        <div className="rounded-[1.75rem] border border-fd-border/80 bg-fd-card/75 p-6 sm:p-8">
          <SectionEyebrow>站点结构</SectionEyebrow>
          <div className="mt-5 space-y-4">
            <p className="max-w-[62ch] text-base leading-8 text-fd-foreground">
              首页负责建立课程全貌，文档首页负责告诉你如何起步，真正的章节导航只交给侧边栏。
            </p>
            <p className="max-w-[62ch] text-sm leading-7 text-fd-muted-foreground">
              这样入口页不会再重复复制目录、正文和按钮，只保留当前阶段真正需要的动作。
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

export function CourseStartPage() {
  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[1.75rem] border border-fd-border/80 bg-fd-card/85 p-7 shadow-[0_22px_60px_-44px_rgba(15,23,42,0.26)] sm:p-9">
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/3 bg-[radial-gradient(circle_at_center,rgba(5,150,105,0.12),transparent_68%)] lg:block" />
        <div className="relative max-w-3xl">
          <SectionEyebrow>阅读入口</SectionEyebrow>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-fd-foreground sm:text-4xl">
            开始阅读
          </h1>
          <p className="mt-4 max-w-[62ch] text-base leading-8 text-fd-muted-foreground">
            这一页不再重复铺满章节链接。完整目录已经在侧边栏，这里只保留最合理的起步顺序。
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link href={courseLinks.outline} className={primaryActionClass}>
              从课程大纲开始
            </Link>
            <p className="text-sm leading-6 text-fd-muted-foreground">
              读完 00 后继续按 01 到 11 顺序推进。
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)]">
        <div className="rounded-[1.5rem] border border-fd-border/80 bg-fd-card/75 p-6 sm:p-8">
          <SectionEyebrow>先做三件事</SectionEyebrow>
          <ReadingList />
        </div>

        <div className="rounded-[1.5rem] border border-fd-border/80 bg-fd-card/75 p-6 sm:p-8">
          <SectionEyebrow>课程结构</SectionEyebrow>
          <PhaseRail />
        </div>
      </section>

      <section className="rounded-[1.5rem] border border-fd-border/70 bg-fd-background/80 p-5 sm:p-6">
        <SectionEyebrow>目录约定</SectionEyebrow>
        <p className="mt-3 max-w-[66ch] text-sm leading-7 text-fd-muted-foreground">
          左侧边栏是完整课程目录；本页只承担“如何开始”的职责，不再用列表、卡片和正文重复指向同一批页面。
        </p>
      </section>
    </div>
  );
}
