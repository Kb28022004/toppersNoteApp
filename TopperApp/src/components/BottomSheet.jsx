import React, { useRef, useEffect } from 'react';
import {
    View,
    StyleSheet,
    Modal,
    Dimensions,
    Animated,
    PanResponder,
} from 'react-native';
import { Theme } from '../theme/Theme';

const { height } = Dimensions.get('window');

const BottomSheet = ({
    visible,
    onClose,
    children,
    maxHeight = height * 0.8,
    paddingHorizontal = 24,
    scrollOffset = { current: 0 }, // Allow children to pass their scroll offset
}) => {
    const panY = useRef(new Animated.Value(height)).current;

    const backdropOpacity = panY.interpolate({
        inputRange: [0, height],
        outputRange: [1, 0],
        extrapolate: 'clamp',
    });

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: (evt) => {
                // If touch starts in the header area (top ~80px), respond immediately
                return evt.nativeEvent.locationY < 80;
            },
            onMoveShouldSetPanResponder: (_, gestureState) => {
                const { dy, dx } = gestureState;
                // Capture if pulling down at the top of a scroll list (if provided)
                return dy > 5 && Math.abs(dy) > Math.abs(dx) && scrollOffset.current <= 5;
            },
            onPanResponderGrant: () => {
                panY.stopAnimation();
            },
            onPanResponderMove: (_, gestureState) => {
                if (gestureState.dy > 0) {
                    panY.setValue(gestureState.dy);
                }
            },
            onPanResponderRelease: (_, gestureState) => {
                if (gestureState.dy > 60 || gestureState.vy > 0.5) {
                    Animated.timing(panY, {
                        toValue: height,
                        duration: 300,
                        useNativeDriver: true,
                    }).start(() => {
                        onClose && onClose();
                    });
                } else {
                    Animated.spring(panY, {
                        toValue: 0,
                        useNativeDriver: true,
                        bounciness: 8,
                    }).start();
                }
            },
            onPanResponderTerminate: () => {
                Animated.spring(panY, {
                    toValue: 0,
                    useNativeDriver: true,
                }).start();
            },
        })
    ).current;

    useEffect(() => {
        if (visible) {
            panY.setValue(height);
            Animated.spring(panY, {
                toValue: 0,
                friction: 8,
                tension: 40,
                useNativeDriver: true,
            }).start();
        }
    }, [visible]);

    return (
        <Modal
            transparent={true}
            visible={visible}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                {/* Dynamic Backdrop */}
                <Animated.View
                    style={[
                        StyleSheet.absoluteFill,
                        {
                            backgroundColor: 'rgba(0,0,0,0.6)',
                            opacity: backdropOpacity,
                        },
                    ]}
                />

                {/* Interaction blocker */}
                <View style={StyleSheet.absoluteFill} />

                <Animated.View
                    {...panResponder.panHandlers}
                    style={[
                        styles.modalContent,
                        {
                            transform: [{ translateY: panY }],
                            maxHeight: maxHeight
                        }
                    ]}
                >
                    <View style={styles.dragArea}>
                        <View style={styles.handle} />
                    </View>
                    <View style={[styles.contentContainer, { paddingHorizontal }]}>
                        {children}
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    modalContent: {
        width: '100%',
        backgroundColor: Theme.colors.modalBackground,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        paddingBottom: 40,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 10,
    },
    dragArea: {
        width: '100%',
        paddingTop: 15,
        paddingBottom: 20,
        alignItems: 'center',
    },
    handle: {
        width: 50,
        height: 6,
        backgroundColor: '#94A3B8',
        borderRadius: 3,
    },
    contentContainer: {
        width: '100%',
    },
});

export default BottomSheet;
