import { CircularProgress, styled } from "@mui/material";
import loginImage from "../../assets/loginImage.svg";
import AuthButton from "../../components/botton/AuthButton";
import { NavLink, useNavigate } from "react-router-dom";
import * as Yup from "yup";
import { useFormik } from "formik";
import { useSendOtpMutation } from "../../feature/api/adminApi";
import { useEffect } from "react";
import toast from "react-hot-toast";

const Login = () => {
    const [sendOtp, { data, isLoading, isError, error, isSuccess }] = useSendOtpMutation();
    const navigate = useNavigate();

    // Validation Schema
    const validationSchema = Yup.object({
        phone: Yup.string()
            .matches(/^[0-9]{10}$/, "Phone number must be exactly 10 digits")
            .required("Phone number is required"),
    });

    // Formik Configuration
    const formik = useFormik({
        initialValues: { phone: "" },
        validationSchema,
        onSubmit: async (values) => {
            try {
                const payload = {
                    ...values,
                    role: "ADMIN",
                };
                await sendOtp(payload).unwrap();
            } catch (err) {
                console.error("Login failed:", err);
            }
        },
    });

    const { values, handleBlur, handleChange, touched, errors, resetForm } = formik;

    // Handle response
    useEffect(() => {
        if (isError && error) {
            toast.error(
                error?.data?.message ||
                "Something went wrong. Please try again."
            );
        }

        if (isSuccess && data) {
            toast.success(data?.message || "OTP sent successfully!");
            resetForm();
            // Navigate to VerifyOTP with isLogin flag
            navigate("/verify-otp", { state: { phone: values.phone, isLogin: true } });
        }
    }, [isError, error, isSuccess, data, navigate, resetForm, values.phone]);

    return (
        <LoginMainContainer>
            <LeftImage src={loginImage} alt="ebidgo login" />
            <RightSideMainContainer>
                <LoginSection>
                    <LoginSectionFirstContainer>
                        <WelcomeBackText>Welcome back! 👋</WelcomeBackText>
                        <LoginAccountText>Login with Mobile Number</LoginAccountText>
                    </LoginSectionFirstContainer>

                    <LoginForm onSubmit={formik.handleSubmit}>
                        {/* Phone Number */}
                        <EmailSection>
                            <LoginLabel>Mobile Number</LoginLabel>
                            <InputContainer>
                                <Prefix>+91</Prefix>
                                <LoginInput
                                    type="text"
                                    name="phone"
                                    value={values.phone}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (/^\d*$/.test(val) && val.length <= 10) {
                                            handleChange(e);
                                        }
                                    }}
                                    onBlur={handleBlur}
                                    placeholder="Enter your mobile number"
                                />
                            </InputContainer>
                            {touched.phone && errors.phone && <p className="validationError">{errors.phone}</p>}
                        </EmailSection>

                        {/* Submit Button */}
                        <AuthButton
                            type="submit"
                            text={
                                isLoading ? (
                                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                        <CircularProgress sx={{ color: "#fff" }} size={20} /> Sending OTP ...
                                    </div>
                                ) : (
                                    "Get OTP"
                                )
                            }
                        />

                        {/* Link to Forgot Password (technically redundant if flow is same, but keeping for UI consistency) */}
                        {/* <NavLink to="/forgot-password" style={{ textAlign: "right", color: "#0066FF" }}>
              Forgot Password?
            </NavLink> */}
                    </LoginForm>
                </LoginSection>
            </RightSideMainContainer>
        </LoginMainContainer>
    );
};

export default Login;

/* ---------------- Styled Components ---------------- */

const LoginMainContainer = styled("div")`
  width: 100vw;
  height: 100vh;
  display: flex;
  gap: 20px;
  @media (max-width: 1200px) {
    flex-direction: column;
  }
`;

const LeftImage = styled("img")`
  @media (max-width: 1200px) {
    display: none;
  }
`;

const RightSideMainContainer = styled("div")`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const LoginSection = styled("div")`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 40px;
  background-color: #f8f9f9;
  padding: 60px;
  border-radius: 8px;
`;

const LoginSectionFirstContainer = styled("div")`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const WelcomeBackText = styled("p")`
  color: #333;
  font-size: 14px;
`;

const LoginAccountText = styled("p")`
  color: #333;
  font-size: 22px;
  font-weight: 700;
`;

const LoginForm = styled("form")`
  display: flex;
  flex-direction: column;
  gap: 25px;
`;

const EmailSection = styled("div")`
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

const LoginInput = styled("input")`
  border: none;
  outline: none;
  width: 100%;
  height: 100%;
  font-size: 13px;
`;

const LoginLabel = styled("label")({
    display: "block",
    marginBottom: "6px",
    fontWeight: 600,
    color: "#333",
});
