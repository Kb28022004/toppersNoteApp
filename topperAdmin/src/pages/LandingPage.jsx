import { Button, styled } from "@mui/material";
import topperNotesLogo from "../assets/topperNotsIcon.png";
import { NavLink } from "react-router-dom";

const LandingPage = () => {
  return (
    <LandingPageMainContainer>
      <img src={topperNotesLogo} width={200} height={200} alt="topperNotesLogo" />
      <WelcomeText>
        Welcome to <EbidgoSpan> ToppersNote </EbidgoSpan> Admin Portal
      </WelcomeText>
      <ButtonContainer>
        <LandingPageButton component={NavLink} to="/send-otp">
          Send Otp
        </LandingPageButton>

      </ButtonContainer>
      <TermAndPrivacyContainer>
        <TermAndPrivacyText>Terms & Conditions</TermAndPrivacyText>
        <TermAndPrivacyText>Privacy Policy</TermAndPrivacyText>
      </TermAndPrivacyContainer>
    </LandingPageMainContainer>
  );
};

export default LandingPage;

const LandingPageMainContainer = styled("div")`
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  gap: 30px;
  align-items: center;
  justify-content: center;
  background-color: #194e7e;
  color: #ffffff;

  @media (max-width: 600px) {
    width: 100%;
    padding: 20px;
  }
`;
const ButtonContainer = styled("div")`
  width: 50%;
  height: auto;
  display: flex;
  padding: 12px;

  gap: 15px;
  margin: 0px auto;
  margin-top: 20px;
  justify-content: center;

  @media (max-width: 600px) {
    margin: 0px;
    padding: 0px;
    width: 100%;
    margin-top: 0px;
  }
`;
const TermAndPrivacyContainer = styled(NavLink)`
  width: 100%;
  height: auto;
  display: flex;
  padding: 12px;
  text-decoration: none;
  gap: 35px;

  justify-content: center;
  align-items: center;

  @media (max-width: 600px) {
    width: 100%;
    padding-left: 25px;
    gap: 20px;
  }
`;

const WelcomeText = styled("p")`
  font-size: 28px;
  font-weight: 400;
  line-height: 100%;
  text-align: center;

  @media (max-width: 600px) {
    font-size: 30px;
    width: 100%;
  }
`;
const EbidgoSpan = styled("span")`
  font-size: 28px;
  font-weight: 700;
  line-height: 100%;
  color: #ff914d;

  @media (max-width: 600px) {
    font-size: 30px;
    width: 100%;
  }
`;
const TermAndPrivacyText = styled("span")`
  font-size: 16px;
  font-weight: 400;
  line-height: 100%;
  color: #a9ccff;
`;

const LandingPageButton = styled(Button)`
  width: 235px;
  height: 45px;
  background-color: #f4f4f4;
  color: #194e7e;
  font-size: 16px;
  font-weight: 700;
  line-height: 18px;

  text-transform: capitalize;
  transition: transform 0.5s ease;

  &:hover {
    transform: scale(1.1);
  }
  @media (max-width: 1200px) {
    font-size: 12px;
    text-align: center;
  }

  @media (max-width: 600px) {
    font-size: 12px;
    text-align: center;
  }
`;
