import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { closeOpenFence } from "@/lib/stream-view";

// Claude's answers use GFM tables, so remark-gfm is required. Raw HTML is not rendered
// (react-markdown's default), so model output can't inject markup.
const blockComponents: Components = {
  table: ({ children }) => (
    <div className="table-scroll">
      <table>{children}</table>
    </div>
  ),
};

export function Markdown({ text }: { text: string }) {
  return (
    <div className="answer">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={blockComponents}>
        {closeOpenFence(text)}
      </ReactMarkdown>
    </div>
  );
}

// For the lead-in sentence inside the "Your turn" panel: bold and code, but no <p> wrapper.
const inlineComponents: Components = { p: ({ children }) => <>{children}</> };

export function InlineMarkdown({ text }: { text: string }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={inlineComponents}>
      {text}
    </ReactMarkdown>
  );
}
