import { Link } from "react-router-dom";
import ToolLayout from "@/components/ToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import { useToolEngine } from "@/hooks/useToolEngine";

const HomePage = () => {
  const tool = useCurrentTool();
  const { groups } = useToolEngine();

  return (
    <ToolLayout title={tool?.label ?? "Home"} description={tool?.description ?? "Developer toolkit hub"}>
      <div className="flex flex-col gap-8 w-full">
        {/* Section 1: Message */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">About this toolkit</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            This is a developer toolkit hub—your standard output for everyday dev tasks. Format, convert, encode, and generate
            without leaving the browser. All tools run locally: no backend, no data sent to any server. You’ll find formatters,
            validators, minifiers, string escapers, encoders and decoders, message digesters, converters, generators, and more.
            New tools are added from time to time; feel free to bookmark this page.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            If you hit a bug, please email <a href="mailto:hmchung92@gmail.com" className="text-primary hover:underline">hmchung92@gmail.com</a> with your browser version and steps to reproduce. Suggestions and feedback are welcome at the same address.
          </p>
        </section>

        {/* Section 2: Full list of tools by group (clickable) */}
        <section className="space-y-6">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">Full list of tools</h2>
          {groups.map((grp) => (
            <div key={grp.label} className="space-y-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border pb-1">
                {grp.label}
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 text-sm">
                {grp.tools.map((t) => (
                  <li key={t.id}>
                    <Link
                      to={t.path}
                      className="block rounded-md border border-border/60 bg-muted/20 p-2.5 hover:bg-muted/40 hover:border-border transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      <span className="font-medium text-primary hover:underline">{t.label}</span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">{t.description}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      </div>
    </ToolLayout>
  );
};

export default HomePage;
