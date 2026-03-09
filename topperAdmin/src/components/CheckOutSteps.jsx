import { Stepper, Step, StepLabel, Typography, styled } from "@mui/material";
import clsx from "clsx";
import { NavLink } from "react-router-dom";

const CustomStepIconRoot = styled("div")(({ ownerState }) => ({
  backgroundColor:
    ownerState.active || ownerState.completed ? "#194E7E" : "#e0e0e0",
  color: "#fff",
  width: 32,
  height: 32,
  display: "flex",
  borderRadius: "50%",
  justifyContent: "center",
  alignItems: "center",
  fontWeight: 600,
  fontFamily: "Mulish, sans-serif",
  cursor: ownerState.disabled ? "not-allowed" : "pointer",
  opacity: ownerState.disabled ? 0.5 : 1,
}));

const CustomStepIcon = (props) => {
  const { active, completed, className, icon, disabled } = props;

  return (
    <CustomStepIconRoot
      ownerState={{ active, completed, disabled }}
      className={clsx(className)}
    >
      {icon}
    </CustomStepIconRoot>
  );
};

const CheckOutSteps = ({ activeStep }) => {
  const steps = [
    { label: "Basic Info", path: "/vendor-basicInfo-registeration" },
    { label: "Business Details", path: "/vendor-buissnessInfo-registeration" },
    {
      label: "Document Verification",
      path: "/vendor-documentInfo-registeration",
    },
    { label: "OTP Verification", path: "/otp-verification" },
  ];

  const basicInfo = JSON.parse(localStorage.getItem("basicDetails"));
  const buissnessInfo = JSON.parse(localStorage.getItem("buissnessDetails"));
  const documentInfo = JSON.parse(localStorage.getItem("documentDetails"));

  const isStepAllowed = (index) => {
    if (index === 0) return true;
    if (index === 1) return !!basicInfo;
    if (index === 2) return !!basicInfo && !!buissnessInfo;
    if (index === 3) return !!basicInfo && !!buissnessInfo && !!documentInfo;
    return false;
  };

  return (
    <Stepper alternativeLabel activeStep={activeStep}>
      {steps.map((item, index) => {
        const allowed = isStepAllowed(index);

        return (
          <Step
            key={index}
            active={activeStep === index}
            completed={activeStep > index}
          >
            <StepLabel
              StepIconComponent={(stepProps) =>
                allowed ? (
                  <NavLink
                    to={item.path}
                    style={{ textDecoration: "none", color: "#fff" }}
                  >
                    <CustomStepIcon {...stepProps} />
                  </NavLink>
                ) : (
                  <CustomStepIcon {...stepProps} disabled />
                )
              }
              style={{
                color: activeStep >= index ? "#194E7E" : "rgba(0,0,0,0.649)",
              }}
            >
              <Typography sx={{ fontSize: { xs: "14px", sm: "16px" } }}>
                {item.label}
              </Typography>
            </StepLabel>
          </Step>
        );
      })}
    </Stepper>
  );
};

export default CheckOutSteps;
