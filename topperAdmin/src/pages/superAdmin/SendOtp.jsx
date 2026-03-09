import { CircularProgress, IconButton, styled } from "@mui/material";
import sendOtpImage from "../../assets/sendOtp.png";
import AuthButton from "../../components/botton/AuthButton";
import ReturnToRouteButton from "../../components/botton/ReturnToRouteButton";
import * as Yup from "yup";
import { useFormik } from "formik";
import { useSendOtpMutation } from "../../feature/api/adminApi";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const SendOtp = () => {
  const [sendOtp, { data, isLoading, isError, isSuccess, error }] =
    useSendOtpMutation();

  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    try {
      const payload = {
        ...values,
        role: "ADMIN", // 👈 default role added
      };

      await sendOtp(payload).unwrap();
    } catch (error) {
      console.log("error", error);
    }
  };


  const validationSchema = Yup.object({
    phone: Yup.string()
      .matches(/^[0-9]{10}$/, "Phone number must be exactly 10 digits")
      .required("Phone number is required"),
  });

  const formik = useFormik({
    initialValues: {
      phone: "",
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
      toast.success(
        data?.message || "OTP has been sent successfully to your mobile number"
      );
      resetForm();
      localStorage.setItem("otp_phone", values.phone);
      navigate("/verify-otp", { state: { phone: values.phone } });
    }
  }, [isError, error, isSuccess, data]);

  return (
    <SendOtpMainContainer>
      <img src={sendOtpImage} alt="ebidgo ForgotPassword" />
      <RightSideMainContainer>
        <ForgotPasswordSection>
          <ForgotPasswordSectionFirstContainer>
            <ForgotPasswordAccountText>
              Send Otp
            </ForgotPasswordAccountText>
            <WelcomeBackText>Enter your mobile number . We'll send you an OTP to verify you a verification code to keep your account sercure.</WelcomeBackText>
          </ForgotPasswordSectionFirstContainer>
          <ForgotPasswordForm onSubmit={formik.handleSubmit}>
            <EmailSection>
              <ForgotPasswordLabel htmlFor="phone">Mobile Number</ForgotPasswordLabel>
              <InputContainer>
                <Prefix>+91</Prefix>
                <PhoneInput
                  type="text"
                  value={values?.phone}
                  name="phone"
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^\d*$/.test(val) && val.length <= 10) {
                      handleChange(e);
                    }
                  }}
                  onBlur={handleBlur}
                  id="phone"
                  placeholder="Enter your mobile number"
                />
              </InputContainer>
              {touched.phone && errors.phone && (
                <div className="validationError">{errors.phone}</div>
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
                    <CircularProgress size={20} color="#000" /> Sending OTP
                  </div>
                ) : (
                  "Send"
                )
              }
            />
            <ReturnToRouteButton text="Return to the Home Page" />
          </ForgotPasswordForm>
        </ForgotPasswordSection>
      </RightSideMainContainer>
    </SendOtpMainContainer>
  );
};

export default SendOtp;

const SendOtpMainContainer = styled("div")`
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
const ForgotPasswordSection = styled("div")`
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

const ForgotPasswordSectionFirstContainer = styled("div")`
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
const ForgotPasswordLabel = styled("label")`
  color: #333333;
  font-size: 15px;
  font-wight: 600;
  font-family: "Mulish";
`;
const ForgotPasswordAccountText = styled("p")`
  color: #333333;
  font-size: 22px;
  font-wight: 700;
  font-family: "Mulish";
  line-height: 100%;
`;

const ForgotPasswordForm = styled("form")`
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

const InputContainer = styled("div")`
  display: flex;
  align-items: center;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  height: 40px;
  padding: 0 12px;
  background-color: #fff;
`;

const Prefix = styled("span")`
  color: #333;
  font-weight: 600;
  margin-right: 10px;
  border-right: 1px solid #ccc;
  padding-right: 10px;
  font-family: "Mulish";
`;

const PhoneInput = styled("input")`
  border: none;
  outline: none;
  width: 100%;
  height: 100%;
  font-size: 13px;
  color: #757575;
  font-family: "Mulish";
  font-weight: 400;
`;
