import { Link } from 'react-router-dom';

const Button = ({
  children,
  to,
  onClick,
  variant = 'primary',
  className = '',
  type = 'button'
}) => {

  const baseStyle =
    "font-label-md text-label-md transition-all duration-200 focus:outline-none flex items-center justify-center gap-2 hover:-translate-y-0.3 hover:scale-100.5";

  const styles = {
    primary:
      "bg-primary text-on-primary px-6 py-2.5 rounded-xl hover:opacity-90 shadow-md hover:shadow-lg active:scale-99",

    secondary:
      "border-2 border-primary text-primary px-6 py-2.5 rounded-xl hover:bg-primary/5 hover:shadow-md active:scale-99",

    gradient:
      "primary-gradient text-white px-6 py-2.5 rounded-xl shadow-md hover:shadow-lg active:scale-95",

    link:
      "text-primary font-bold inline-flex items-center gap-1 hover:gap-2 transition-all"
  };

  const selectedStyle = styles[variant] || styles.primary;

  const combinedClass = `${baseStyle} ${selectedStyle} ${className}`;

  if (to) {
    return (
      <Link to={to} className={combinedClass}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      className={combinedClass}
    >
      {children}
    </button>
  );
};

export default Button;
export { Button };