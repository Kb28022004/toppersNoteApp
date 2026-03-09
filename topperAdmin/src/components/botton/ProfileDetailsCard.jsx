import { styled } from "@mui/material";


const ProfileDetailsCard = ({

}) => {
  return (
    <ProfileDetailsCardMainContainer>
      <DetailTitleContainer>
        <Title>Profile Information</Title>
      </DetailTitleContainer>
      <DetailsContainer>
        <Row>
          <Content>
            <p style={{ width: "50%" }}>Admin</p>
            <p>:</p> <p style={{ width: "50%" }}>ADM1025</p>
          </Content>
          <Content>
            <p style={{ width: "50%" }}>Department Code</p>
            <p>:</p>
            <p style={{ width: "50%" }}>CON12546</p>
          </Content>
        </Row>
        <Row>
          <Content>
            <p style={{ width: "50%" }}>Designation</p>
            <p>:</p>
            <p style={{ width: "50%" }}>Senior</p>
          </Content>
          <Content>
            <p style={{ width: "50%" }}>Registration Date</p>
           <p>:</p>

            <p style={{ width: "50%" }}>15 July 2025</p>
          </Content>
        </Row>
        <Row>
          <Content>
            <p style={{ width: "50%" }}>Department Name</p>
            <p>:</p>

            <p style={{ width: "50%" }}>Consultancy</p>
          </Content>
          
        </Row>
      </DetailsContainer>
    </ProfileDetailsCardMainContainer>
  );
};

export default ProfileDetailsCard;

const ProfileDetailsCardMainContainer = styled("div")({
  width: "100%",
  height: "auto",
  padding: "20px",
  borderRadius: "10px",
  border: "1px solid #E5E0FA",
  backgroundColor: "#FFFFFF",
  display: "flex",
  flexDirection: "column",
});
const DetailTitleContainer = styled("div")({
  width: "100%",
  height: "auto",
  padding: "15px",

  borderBottom: "1px solid #E5E0FACC",
});
const DetailsContainer = styled("div")({
  width: "100%",
  height: "auto",
  display: "flex",
  flexDirection: "column",
  gap: "15px",
  padding: "15px",
});
const Row = styled("div")({
  width: "100%",
  height: "auto",
  display: "flex",
  gap: "20px",
  justifyContent: "space-between",
  alignItems: "center",
});
const Content = styled("div")({
  width: "50%",
  height: "auto",
  display: "flex",
  gap: "40px",
  alignItems: "center",
});
const Title = styled("p")({
  font: "500 16px Roboto",
  color: "#FF914D",
});
