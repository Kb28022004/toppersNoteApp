import { styled } from "@mui/material";
import KeyboardArrowRightOutlinedIcon from "@mui/icons-material/KeyboardArrowRightOutlined";
import { NavLink } from "react-router-dom";

const Breadcrumps = ({ bread, finalBread,toHome,toPrevious }) => {

  return (
    <BreadcrumpsMainContainer>
    <NavLink  style={{ textDecoration: "none" }} to={toHome}>   <BreadText>Home</BreadText></NavLink>
      <KeyboardArrowRightOutlinedIcon
        fontSize="small"
        sx={{ color: "#78788C" }}
      />
      <NavLink  to={toPrevious} style={{ textDecoration: "none" }}>

        <BreadText>{bread}</BreadText>
      </NavLink>
      {
        finalBread.length>0 && <KeyboardArrowRightOutlinedIcon
        fontSize="small"
        sx={{ color: "#78788C" }}
      />
      }
      <NavLink style={{ textDecoration: "none" }}>
   
        <BreadText><strong>{finalBread === bread ? "" : finalBread}</strong></BreadText>
      </NavLink>
    </BreadcrumpsMainContainer>
  );
};

export default Breadcrumps;

const BreadcrumpsMainContainer = styled("div")`
  width: 100%;
  height: auto;
  padding: 12px 0;
  display: flex;
  align-items: center;
  gap: 8px;
  border-top: 1px solid #ddddeb;
  border-bottom: 1px solid #ddddeb;
`;


const BreadText = styled("p")({
  fontWeight: 500,
  fontSize: "14px",
  fontFamily: "Manrope",
  color: "#78788c",
  "&:hover": {
    color: "#2525bbff",
  },
});



const BreadNavlink = styled(NavLink)`

`;
