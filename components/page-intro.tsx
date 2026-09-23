type PageIntroProps = {
  eyebrow: string;
  title: string;
  body: string;
  align?: "left" | "center";
};

export function PageIntro({ eyebrow, title, body, align = "left" }: PageIntroProps) {
  return (
    <div className={`page-intro page-intro-${align}`}>
      <span className="eyebrow">{eyebrow}</span>
      <h1>{title}</h1>
      <p>{body}</p>
    </div>
  );
}

export function SectionHeading({ eyebrow, title, body, align = "left" }: PageIntroProps) {
  return (
    <div className={`section-heading section-heading-${align}`}>
      <span className="eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      {body && <p>{body}</p>}
    </div>
  );
}
