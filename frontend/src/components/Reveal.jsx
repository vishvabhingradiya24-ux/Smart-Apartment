import { useInView } from "../hooks/useInView";

// Fades and slides its children in the first time they scroll into view.
function Reveal({ as: Tag = "div", delay = 0, className = "", children, ...rest }) {
  const { ref, inView } = useInView({ threshold: 0.15 });

  return (
    <Tag
      ref={ref}
      className={`sa-reveal ${inView ? "is-visible" : ""} ${className}`}
      style={{ "--delay": `${delay}ms` }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export default Reveal;
