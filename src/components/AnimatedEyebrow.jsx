export default function AnimatedEyebrow({ children, className = '' }) {
  return <p className={`ba-animated-eyebrow ba-kicker ${className}`}><span aria-hidden="true" /><span>{children}</span></p>;
}
