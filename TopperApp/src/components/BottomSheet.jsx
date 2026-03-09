import React, { useRef, useEffect } from 'react';
import {
    View,
    StyleSheet,
    Modal,
    TouchableOpacity,
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
}) => {
    const panY = useRef(new Animated.Value(height)).current;

    const resetPositionAnim = Animated.spring(panY, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 0,
    });

    const closeAnim = Animated.timing(panY, {
        toValue: height,
        duration: 250,
        useNativeDriver: true,
    });

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => false,
            onMoveShouldSetPanResponderCapture: (evt, gestureState) => {
                // Header (handle area) should always trigger close even if children have scroll
                const isHeaderHandle = evt.nativeEvent.locationY < 80;
                return isHeaderHandle && gestureState.dy > 5 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
            },
            onPanResponderMove: (_, gestureState) => {
                if (gestureState.dy > 0) {
                    panY.setValue(gestureState.dy);
                }
            },
            onPanResponderRelease: (_, gestureState) => {
                if (gestureState.dy > 80 || gestureState.vy > 1.0) {
                    closeAnim.start(() => {
                        onClose();
                    });
                } else {
                    resetPositionAnim.start();
                }
            },
        })
    ).current;

    useEffect(() => {
        if (visible) {
            resetPositionAnim.start();
        } else {
            panY.setValue(height);
        }
    }, [visible]);

    const handleClose = () => {
        closeAnim.start(() => {
            onClose();
        });
    };

    return (
        <Modal
            transparent={true}
            visible={visible}
            animationType="fade"
            onRequestClose={handleClose}
        >
            <View style={styles.overlay}>
                <TouchableOpacity
                    style={StyleSheet.absoluteFill}
                    activeOpacity={1}
                    onPress={handleClose}
                />
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
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        width: '100%',
        backgroundColor: Theme.colors.background, // Match the app's dark theme
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingBottom: 40,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 10,
    },
    dragArea: {
        width: '100%',
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
    handle: {
        width: 40,
        height: 4,
        backgroundColor: '#334155',
        borderRadius: 2,
    },
    contentContainer: {
        width: '100%',
    },
});

export default BottomSheet;
