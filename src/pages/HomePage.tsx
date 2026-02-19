import { Link } from "react-router-dom";
import {
  Braces,
  Type,
  FileText,
  Lock,
  Shuffle,
  Hash,
  Terminal,
  GitCompare,
  Clock,
  KeyRound,
  Fingerprint,
  Link2,
  Code2,
  QrCode,
  Archive,
  ShieldCheck,
  Table2,
  FileJson,
  Binary,
  ArrowLeftRight,
  Search,
  CalendarClock,
  FileSpreadsheet,
  Regex,
  Diff,
  Boxes,
  Globe,
  CheckCircle2,
  Wand2,
  Calculator,
  Palette,
  AlignLeft,
  FileCode,
  Database,
  TerminalSquare,
  FileType,
  List,
  KeySquare,
  FileOutput,
  Image,
  Scaling,
  FileArchive,
  Eye,
  Paintbrush,
  Ruler,
  FileUp,
  Dices,
  TableProperties,
  LetterText,
  ScrollText,
  ExternalLink,
} from "lucide-react";
import { useMemo } from "react";
import { useToolEngine } from "@/hooks/useToolEngine";
import { useSettings } from "@/hooks/useSettings";
import type { ToolDefinition } from "@/tools/types";

const iconMap: Record<string, React.ElementType> = {
  Braces,
  Type,
  FileText,
  Lock,
  Shuffle,
  Hash,
  Terminal,
  GitCompare,
  Clock,
  KeyRound,
  Fingerprint,
  Link2,
  Code2,
  QrCode,
  Archive,
  ShieldCheck,
  Table2,
  FileJson,
  Binary,
  ArrowLeftRight,
  Search,
  CalendarClock,
  FileSpreadsheet,
  Regex,
  Diff,
  Boxes,
  Globe,
  CheckCircle2,
  Wand2,
  Calculator,
  Palette,
  AlignLeft,
  FileCode,
  Database,
  TerminalSquare,
  FileType,
  List,
  KeySquare,
  FileOutput,
  Image,
  Scaling,
  FileArchive,
  Eye,
  Paintbrush,
  Ruler,
  FileUp,
  Dices,
  TableProperties,
  LetterText,
  ScrollText,
};

const getIcon = (name: string) => iconMap[name] ?? Braces;

const ToolCard = ({ tool }: { tool: ToolDefinition }) => {
  const Icon = getIcon(tool.icon);
  return (
    <Link
      to={tool.path}
      className="group relative flex h-[160px] flex-col rounded-md bg-card p-5 text-left transition-colors hover:bg-muted/40 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
    >
      <ExternalLink
        className="absolute right-3 top-3 h-3.5 w-3.5 text-muted-foreground opacity-70"
        aria-hidden
      />
      <Icon className="mb-3 h-10 w-10 text-foreground" />
      <h3 className="font-semibold text-foreground line-clamp-2">{tool.label}</h3>
      <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{tool.description}</p>
    </Link>
  );
};

const HomePage = () => {
  const { tools } = useToolEngine();
  const { isToolVisible } = useSettings();

  const visibleTools = useMemo(
    () => tools.filter((t) => isToolVisible(t.path)),
    [tools, isToolVisible]
  );

  return (
    <div className="flex flex-1 flex-col min-h-0 overflow-auto">
      <div className="flex flex-1 flex-col min-h-0 w-full px-4 py-3 md:px-6 md:py-4">
        <div className="flex flex-col gap-8">
          {/* About */}
          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
              About this toolkit
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              This is a developer toolkit hub—your standard output for everyday dev tasks. Format,
              convert, encode, and generate without leaving the browser. All tools run locally: no
              backend, no data sent to any server. New tools are added from time to time; feel free
              to bookmark this page.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              If you hit a bug, please{" "}
              <a
                href="https://github.com/cminhho/stdout/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                submit a ticket
              </a>{" "}
              with your browser version and steps to reproduce. Suggestions and feedback are welcome
              there too.
            </p>
          </section>

          {/* All tools grid */}
          <section>
            <div className="sticky top-0 z-10 -mx-4 mb-4 bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:-mx-6 md:px-6">
              <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                All tools
              </h2>
            </div>
            {visibleTools.length === 0 ? (
              <p className="text-sm text-muted-foreground">No tools available.</p>
            ) : (
              <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {visibleTools.map((t) => (
                  <li key={t.id}>
                    <ToolCard tool={t} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
