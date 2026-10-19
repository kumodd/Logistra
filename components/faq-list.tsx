type Faq = {
  question: string;
  answer: string;
};

export default function FaqList({ items }: { items: Faq[] }) {
  return (
    <div className="faq-list">
      {items.map((item, index) => (
        <details className="faq-item" key={item.question} open={index === 0}>
          <summary><span>{item.question}</span><i aria-hidden="true">+</i></summary>
          <p>{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
