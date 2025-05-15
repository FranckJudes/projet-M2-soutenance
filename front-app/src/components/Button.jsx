export const ButtonWithIcon = ({
   label = "",
   className = "btn btn-icon icon-left btn-primary",
   iconClass = "far fa-edit",
   onClick,
   type = "button",

}) => (
    <button
        className={className}
        onClick={onClick}
        type={type} // Utilisation de la prop `type`
        aria-label={label}
    >
        <i className={iconClass} />
        {label}
    </button>
);

export const ButtonSimple = ({
    label = "",
    className = "btn btn-info",
    onClick,
    type = "button",
 
 }) => (
     <button
         className={className}
         onClick={onClick}
     >
         {label}
     </button>
 );
 