import { CircularProgress, IconButton, styled } from "@mui/material";
import verifyOtpImage from "../../assets/verifyOtp.svg";
import AuthButton from "../../components/botton/AuthButton";
import * as Yup from "yup";
import { useFormik } from "formik";
import ReturnToRouteButton from "../../components/botton/ReturnToRouteButton";
import { useVerifyOtpMutation } from "../../feature/api/adminApi";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { useLocation } from "react-router-dom";


import { useNavigate } from "react-router-dom";

const VerifyOTP = () => {
  const [verifyOtp, { data, isLoading, isError, isSuccess, error }] =
    useVerifyOtpMutation();
  const navigate = useNavigate();

  const location = useLocation();
  const phone = location?.state?.phone || localStorage.getItem("otp_phone");

  useEffect(() => {
    if (!phone) {
      toast.error("Phone number missing. Please request OTP again.");
      navigate("/send-otp");
    }
  }, [phone, navigate]);


  const handleSubmit = async (values) => {
    try {
      const payload = {
        phone: phone,
        otp: values.otp,
        role: "ADMIN",
      };

      await verifyOtp(payload).unwrap();
    } catch (error) {
      console.log("error", error);
    }
  };

  const validationSchema = Yup.object({
    otp: Yup.string()
      .max(6, "OTP must be of 6 digits")
      .min(6, "OTP must be of 6 digits")
      .required("OTP is required"),
  });

  const formik = useFormik({
    initialValues: {
      otp: "",
    },
    validationSchema: validationSchema,
    onSubmit: handleSubmit,
  });

  const { values, touched, errors, resetForm, handleBlur, handleChange } =
    formik;

  useEffect(() => {
    if (isError && error) {
      toast.error(
        error?.data?.message ||
        "Something went wrong , please wait for a moment"
      );
    }
    if (isSuccess && data) {
      toast.success(data?.message || "Verified successfully");
      resetForm();
      const user = data?.data?.user;
      const token = data?.data?.token;

      // Store proper token based on flow
      if (token) {
        localStorage.setItem("authToken", token);
      }
      if (user) {
        localStorage.setItem("userDetails", JSON.stringify(user));
      }

      if (user?.profileCompleted) {
        navigate("/superAdmin");
      } else {
        navigate("/setup-profile");
      }

    }
  }, [isError, error, data, isSuccess]);

  return (
    <VerifyOtpMainContainer>
      <img src={verifyOtpImage} alt="ebidgo VerifyOtp" />
      <RightSideMainContainer>
        <VerifyOtpSection>
          <VerifyOtpSectionFirstContainer>
            <VerifyOtpAccountText>Verfify OTP </VerifyOtpAccountText>
            <WelcomeBackText>
              We have sent a verification code to your mobile number
            </WelcomeBackText>
          </VerifyOtpSectionFirstContainer>
          <VerifyOtpForm onSubmit={formik.handleSubmit} action="">
            <EmailSection>
              <VerifyOtpLabel htmlFor="email">OTP</VerifyOtpLabel>
              <VerifyOtpInput
                type="text"
                name="otp"
                id="otp"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.otp}
                placeholder="Enter correct otp here"
              />
              {errors.otp && touched.otp && (
                <div className="validationError">{errors.otp}</div>
              )}
            </EmailSection>

            <AuthButton
              type="submit"
              text={
                isLoading ? (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "20px",
                    }}
                  >
                    <CircularProgress size={20} color="#000" /> Verifying ...
                  </div>
                ) : (
                  "Next"
                )
              }
            />
            <ReturnToRouteButton text="Return to the  Login Page" />
          </VerifyOtpForm>
        </VerifyOtpSection>
      </RightSideMainContainer>
    </VerifyOtpMainContainer>
  );
};

export default VerifyOTP;

const VerifyOtpMainContainer = styled("div")`
  width: 100vw;
  height: 100vh;
  display: flex;
  gap: 20px;

  @media (max-width: 1200px) {
    width: 100%;
    flex-direction: column;
    gap: 10px;
  }
  @media (max-width: 600px) {
    width: 100%;
    flex-direction: column;
    gap: 10px;
  }
`;
const RightSideMainContainer = styled("div")`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 20px 0 0;

  @media (max-width: 600px) {
    padding: 10px;
  }
`;
const VerifyOtpSection = styled("div")`
  width: 100%;
  height: auto;
  display: flex;
  flex-direction: column;
  gap: 40px;
  background-color: #f8f9f9;
  padding: 60px;
  border-radius: 8px;

  @media (max-width: 600px) {
    padding: 20px;
  }
`;

const VerifyOtpSectionFirstContainer = styled("div")`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;
const WelcomeBackText = styled("p")`
  color: #333333;
  font-size: 14px;
  font-wight: 400;
  font-family: "Mulish";
`;
const VerifyOtpLabel = styled("label")`
  color: #333333;
  font-size: 15px;
  font-wight: 600;
  font-family: "Mulish";
`;
const VerifyOtpAccountText = styled("p")`
  color: #333333;
  font-size: 22px;
  font-wight: 700;
  font-family: "Mulish";
  line-height: 100%;
`;

const VerifyOtpForm = styled("form")`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 25px;
`;
const EmailSection = styled("form")`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;
const PasswordSection = styled("form")`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  position: relative;
`;
const VerifyOtpInput = styled("input")`
  width: 100%;
  height: 40px;
  border-radius: 4px;
  border: 1px solid #e8e8e8;
  padding: 0 12px;
  color: #757575;
  font-size: 13px;
  font-wight: 400;
`;

const SeePassword = styled(IconButton)`
  position: absolute;
  top: 30px;
  right: 45px;
`;
