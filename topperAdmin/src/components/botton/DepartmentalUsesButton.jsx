import { Button, styled } from "@mui/material";

const DepartmentalUsesButton = ({
  text,
  color,
  textColor,
  startIcon,
  endIcon,
  variant,
  borderColor,
  component,
  onClick,
  disabled,
  type,
  sx,
  to,
}) => {
  return (
    <DepartmentalUsesButtonMainContainer
      variant={variant}
      startIcon={startIcon}
      borderColor={borderColor}
      endIcon={endIcon}
      customcolor={color}
      textColor={textColor}
      onClick={onClick}
      to={to}
      disabled={disabled}
      sx={sx}
      type={type}
      component={component}
    >
      {text}
    </DepartmentalUsesButtonMainContainer>
  );
};

export default DepartmentalUsesButton;

const DepartmentalUsesButtonMainContainer = styled(Button)(
  ({ customcolor, textColor, borderColor }) => ({
    borderRadius: "5px",
    width: "auto",
    height: "auto",
    padding: "8px 12px",
    backgroundColor: customcolor,
    fontSize: "15px",
    fontWeight: 500,
    fontFamily: "Roboto",
    textTransform: "capitalize",
    color: textColor || "#fff",
    transition: "transform 1s ease",
    border: `1px solid ${borderColor}`,
    "&:hover": {
      transform: "scale(1.1)",
    },
  })
);
