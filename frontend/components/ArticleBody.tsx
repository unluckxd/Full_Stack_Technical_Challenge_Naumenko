import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";

interface Props {
  markdown: string;
}

const components: Components = {
  h2: ({ ...props }) => <h2 style={{ fontSize: "2rem", marginTop: "2.5rem" }} {...props} />,
  h3: ({ ...props }) => <h3 style={{ fontSize: "1.4rem", marginTop: "2rem" }} {...props} />,
  p: ({ ...props }) => (
    <p
      style={{
        lineHeight: 1.7,
        color: "var(--fog)",
        marginTop: "1.2rem",
        fontSize: "1.05rem",
      }}
      {...props}
    />
  ),
  ul: ({ ...props }) => (
    <ul style={{ paddingLeft: "1.5rem", color: "var(--fog)", marginTop: "1rem" }} {...props} />
  ),
  li: ({ ...props }) => <li style={{ marginBottom: "0.6rem" }} {...props} />,
};

export const ArticleBody = ({ markdown }: Props) => {
  return <ReactMarkdown components={components}>{markdown}</ReactMarkdown>;
};
