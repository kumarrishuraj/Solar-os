import type { ComponentType } from "react";
import { RooftopIllustration } from "@/components/illustrations/rooftop-illustration";

// Temporary QA route for the illustration set (deleted before hand-off).

export const metadata = { title: "Illustration preview" };

const ITEMS: { name: string; Comp: ComponentType<{ className?: string; title?: string }>; w: string }[] = [
  { name: "RooftopIllustration", Comp: RooftopIllustration, w: "max-w-[560px]" },
];

export default function PreviewIllustrationsPage() {
  return (
    <main style={{ background: "#F1F2EF" }} className="min-h-screen px-8 py-8">
      <div className="mx-auto max-w-[1400px] space-y-8">
        {ITEMS.map(({ name, Comp, w }) => (
          <section key={name} className="space-y-2">
            <h2 className="text-sm font-medium" style={{ color: "#252925" }}>
              {name}
            </h2>
            <div className="grid grid-cols-2 gap-5">
              <div className="rounded-xl border bg-white p-5" style={{ borderColor: "#E7E9E4" }}>
                <Comp className={`mx-auto w-full ${w}`} title={name} />
              </div>
              <div className="rounded-2xl p-5" style={{ background: "#C5D1C5" }}>
                <Comp className={`mx-auto w-full ${w}`} />
              </div>
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
