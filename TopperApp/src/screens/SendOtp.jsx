import React, { useState, useEffect } from 'react';
import { Theme } from '../theme/Theme';
import { View, StyleSheet, TouchableOpacity, TextInput, Keyboard, ToastAndroid, Platform, ActivityIndicator } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Stepper from "../components/Stepper";
import { MaterialIcons } from "@expo/vector-icons";
import AppText from '../components/AppText';
import ReusableButton from '../components/ReausableButton';
import { validatePhoneNumber } from '../helpers/validation';
import Loader from '../components/Loader';
import TermsAndPrivacy from '../components/TermsAndPrivacy';
import Header from '../components/Header';
import { useSendOtpMutation } from '../features/api/authApi';
import useApiFeedback from '../hooks/useApiFeedback';
import useInitialLoad from '../hooks/useInitialLoad';

const SendOtp = ({ navigation, route }) => {
    const { role } = route.params || { role: 'STUDENT' };

    // ... useState hooks ...
    const [phoneNumber, setPhoneNumber] = useState('');
    const [error, setError] = useState('');
    const isLoading = useInitialLoad(200);


    const [sendOtp, { isSuccess, data, isLoading: isOtpLoading, isError, error: otpError }] = useSendOtpMutation()

    const handleSendOtp = () => {
        Keyboard.dismiss();
        const validationResult = validatePhoneNumber(phoneNumber);

        if (!validationResult.isValid) {
            setError(validationResult.error);
            return;
        }

        setError('');
        console.log("Sending OTP to:", phoneNumber, "with role:", role);
        sendOtp({ phone: phoneNumber, role }).unwrap();
    };

    const handlePhoneChange = (text) => {
        // Only allow numeric input
        if (/^\d*$/.test(text) || text === '') {
            setPhoneNumber(text);
            if (error) setError('');
        }
    };

    useApiFeedback(
        isSuccess,
        data,
        isError,
        otpError,
        () => navigation.navigate('VerifyOtp', { phoneNumber, role })
    );

    return (
        <View style={{ flex: 1 }}>
            <KeyboardAwareScrollView
                contentContainerStyle={styles.mainContainer}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                enableOnAndroid={true}
                extraScrollHeight={20}
            >
                <Loader visible={isLoading} />
                <View style={styles.container}>
                    <Header title="Sign Up" />

                    <Stepper currentStep={1} totalSteps={role === 'TOPPER' ? 4 : 3} />


                    <View style={styles.contentContainer}>
                        <AppText style={styles.title}>Enter your mobile number</AppText>
                        <AppText style={styles.subtitle}>We'll send you a verification code to keep your account secure</AppText>

                        <View style={[styles.inputContainer, error ? styles.inputError : null]}>
                            <View style={styles.countryCode}>
                                <AppText style={styles.countryCodeText}>+91</AppText>
                            </View>
                            <TextInput
                                style={styles.input}
                                placeholder="Mobile Number"
                                placeholderTextColor="#a0aec0"
                                keyboardType="number-pad"
                                maxLength={10}
                                value={phoneNumber}
                                onChangeText={handlePhoneChange}
                            />
                        </View>
                        {error ? <AppText style={styles.errorText}>{error}</AppText> : null}

                        <ReusableButton
                            title="Send OTP"
                            loading={isOtpLoading}
                            loadingText="Sending OTP..."
                            onPress={handleSendOtp}
                            style={styles.button}
                        />

                        <View style={styles.dividerContainer}>
                            <View style={styles.line} />
                            <AppText style={styles.continueWithText}>Or continue with</AppText>
                            <View style={styles.line} />
                        </View>

                        <TouchableOpacity
                            style={styles.continueWithButton}
                            onPress={() => console.log("Pressed")}
                        >
                            <MaterialIcons name="email" size={20} color="#fff" />
                            <AppText style={styles.continueWithButtonText}>
                                Continue with Email
                            </AppText>
                        </TouchableOpacity>
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
        marginBottom: 30,
        lineHeight: 22,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Theme.colors.inputBackground,
        borderRadius: 12,
        marginBottom: 5,
        paddingHorizontal: 15,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        height: 56,
    },
    inputError: {
        borderColor: '#ff4444',
    },
    countryCode: {
        paddingRight: 15,
        borderRightWidth: 1,
        borderRightColor: '#4a5568',
        marginRight: 15,
        height: '60%',
        justifyContent: 'center',
    },
    countryCodeText: {
        fontSize: 16,
        color: 'white',
        fontWeight: 'bold',
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: 'white',
        height: '100%',
        fontWeight: '500',
    },
    errorText: {
        color: '#ff444496',
        fontSize: 12,
        marginBottom: 15,
        marginLeft: 5,
    },
    button: {
        marginTop: 25,
    },
    dividerContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 25,
    },
    line: {
        flex: 1,
        height: 1,
        backgroundColor: "#2d3748",
    },
    continueWithText: {
        marginHorizontal: 15,
        color: "#a0aec0",
        fontSize: 14,
    },
    continueWithButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: 'rgba(58, 60, 63, 0.5)',
        paddingVertical: 12,
        borderRadius: 12,
        height: 56,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    continueWithButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
        marginLeft: 10,
    },
});

export default SendOtp;