import React, { useState, useEffect } from 'react';
import { Theme } from '../theme/Theme';
import { View, StyleSheet, TouchableOpacity, Keyboard, Platform } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Stepper from "../components/Stepper";
import AppText from '../components/AppText';
import ReusableButton from '../components/ReausableButton';
import Loader from '../components/Loader';
import OtpInput from '../components/OtpInput';
import TermsAndPrivacy from '../components/TermsAndPrivacy';
import Header from '../components/Header';

import { useVerifyOtpMutation } from '../features/api/authApi';
import useApiFeedback from '../hooks/useApiFeedback';
import useInitialLoad from '../hooks/useInitialLoad';

const VerifyOtp = ({ navigation, route }) => {
    const phoneNumber = route.params?.phoneNumber || '';
    const { role } = route.params || {};

    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [timer, setTimer] = useState(30);
    const isLoading = useInitialLoad(1000);

    const [verifyOtp, { isLoading: isVerifying, isSuccess, data, isError, error: verifyError }] = useVerifyOtpMutation();

    useEffect(() => {
        const countdown = setInterval(() => {
            setTimer((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(countdown);
    }, []);

    const handleSuccess = React.useCallback(async (responseData) => {
        // Handle nested data structure { success: true, data: { token, user } }
        const result = responseData?.data || responseData;

        if (result?.token) {
            await AsyncStorage.setItem('token', result.token);
            await AsyncStorage.setItem('user', JSON.stringify(result.user));


        }

        if (result?.user?.profileCompleted) {
            // Check if Topper needs approval
            if (result?.user?.role === 'TOPPER') {
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'TopperApprovalPending' }],
                });
            } else if (result?.user?.role === 'ADMIN') {
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'AdminDashboard' }],
                });
            } else {
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'Home' }],
                });
            }
        } else {
            // Check role and navigate
            if (result?.user?.role === 'TOPPER') {
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'TopperProfileSetup' }],
                });
            } else if (result?.user?.role === 'ADMIN') {
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'AdminProfileSetup' }],
                });
            } else {
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'StudentProfileSetup' }],
                });
            }
        }
    }, [navigation]);

    useApiFeedback(
        isSuccess,
        data,
        isError,
        verifyError,
        handleSuccess
    );

    const handleVerifyOtp = () => {
        Keyboard.dismiss();
        if (otp.length !== 6) {
            setError('Please enter a valid 6-digit code');
            return;
        }
        setError('');
        verifyOtp({ phone: phoneNumber, otp }).unwrap();
    };

    const handleResendOtp = () => {
        if (timer > 0) return;
        // Logic to resend OTP
        // Ideally call sendOtp again or navigate back
        navigation.goBack();
    };

    return (
        <View style={{ flex: 1 }}>
            <KeyboardAwareScrollView
                contentContainerStyle={styles.mainContainer}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                enableOnAndroid={true}
                extraScrollHeight={20}
            >
                {/* <Loader visible={isLoading} /> */}
                <View style={styles.container}>
                    <Header title="Verification" />

                    <Stepper currentStep={2} totalSteps={role === 'TOPPER' ? 4 : 3} />

                    <View style={styles.contentContainer}>
                        <AppText style={styles.title}>Enter the code</AppText>
                        <AppText style={styles.subtitle}>
                            Sent to <AppText weight="bold" style={{ color: 'white' }}>+91 {phoneNumber}</AppText>
                        </AppText>

                        <OtpInput
                            length={6}
                            value={otp}
                            onChange={(code) => {
                                setOtp(code);
                                if (error) setError('');
                            }}
                            error={!!error}
                        />

                        {error ? <AppText style={styles.errorText}>{error}</AppText> : null}

                        <View style={styles.resendContainer}>
                            <AppText style={styles.resendText}>Didn't receive code? </AppText>
                            <TouchableOpacity onPress={handleResendOtp} disabled={timer > 0}>
                                <AppText
                                    style={[
                                        styles.resendLink,
                                        timer > 0 ? styles.resendDisabled : null
                                    ]}
                                >
                                    {timer > 0 ? `Resend in ${timer}s` : 'Resend Code'}
                                </AppText>
                            </TouchableOpacity>
                        </View>

                        <ReusableButton
                            title="Verify & Continue"
                            loading={isVerifying}
                            loadingText="Verifying..."
                            onPress={handleVerifyOtp}
                            style={styles.button}
                        />
                    </View>
                </View>

                <TermsAndPrivacy />
            </KeyboardAwareScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    mainContainer: {
        flexGrow: 1,
        justifyContent: "space-between",
        backgroundColor: Theme.colors.background
    },
    container: {
        flex: 1,
        paddingHorizontal: Theme.layout.screenPadding,
        paddingTop: 55,
    },
    contentContainer: {
        marginTop: 20,
    },
    title: {
        fontSize: 34,
        fontWeight: "bold",
        color: "white",
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#a0aec0',
        marginBottom: 40,
        lineHeight: 22,
    },
    errorText: {
        color: '#ff444496',
        fontSize: 12,
        marginBottom: 15,
        textAlign: 'center',
    },
    resendContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 30,
    },
    resendText: {
        color: '#a0aec0',
        fontSize: 14,
    },
    resendLink: {
        color: '#4377d8ff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    resendDisabled: {
        color: '#4a5568',
    },
    button: {
        marginTop: 10,
    },
});

export default VerifyOtp;
