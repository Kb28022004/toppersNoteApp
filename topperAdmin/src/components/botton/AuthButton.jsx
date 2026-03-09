import { Button, styled } from "@mui/material";

const AuthButton = ({ text,to ,onClick, type, disabled, sx,component }) => {
  return (
    <ButtonAuth sx={sx} disabled={disabled} component={component} to={to} type={type} onClick={onClick}>
      {text}
    </ButtonAuth>
  );
};

export default AuthButton;

const ButtonAuth = styled(Button)`
  width: 100%;
  height: 45px;
  border-radius: 1px;
  background-color: #194e7e;
  border: 1px solid #0056d7;
  text-transform: capitalize;
  color: #ffffff;
  font-size: 16px;
  font-weight: 700;
  line-height: 18px;
  font-family: "Mulish", sans-serif;
  transition: all 0.5s ease;

  :hover {
    background-color: rgb(12, 59, 103);
  }
`;
