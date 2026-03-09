import { Button, styled } from "@mui/material";
import WestOutlinedIcon from "@mui/icons-material/WestOutlined";
import { NavLink } from "react-router-dom";

const ReturnToRouteButton = ({ text }) => {
  return (
  <NavLink to='/' > 
      <ReturnToRouteButtonMainContainer
      variant="text"
      startIcon={<WestOutlinedIcon />}
    >
      {text}
    </ReturnToRouteButtonMainContainer>
  </NavLink>
  );
};

export default ReturnToRouteButton;

const ReturnToRouteButtonMainContainer = styled(Button)`
width:100%;
text-align:center;
color:#000000;
font-size:14px;
font-weight:400;
font-family:Roboto;
text-transform:capitalize;
transition:transform 0.5s ease;

&:hover{
transform:scale(1.1)
}
`;
