import React from 'react';
import {
    View,
    StyleSheet,
    Modal,
    TouchableOpacity,
    Dimensions,
    ScrollView,
    Animated,
    PanResponder,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AppText from './AppText';
import { Theme } from '../theme/Theme';

const { height } = Dimensions.get('window');

const SORT_OPTIONS = [
    { label: 'Newest First', value: 'newest', icon: 'clock-outline' },
    { label: 'Highest Rated', value: 'rating', icon: 'star-outline' },
    { label: 'Price: Low to High', value: 'price_low', icon: 'sort-ascending' },
    { label: 'Price: High to Low', value: 'price_high', icon: 'sort-descending' },
];

const TIME_OPTIONS = [
    { label: 'All Time', value: 'all', icon: 'calendar-range' },
    { label: 'Last 24 Hours', value: '24h', icon: 'history' },
    { label: 'Last 7 Days', value: '7d', icon: 'calendar-week' },
    { label: 'Last 1 Month', value: '1m', icon: 'calendar-month' },
];

const SortModal = ({
    visible,
    onClose,
    selectedSort,
    onSelectSort,
    selectedTime,
    onSelectTime,
}) => {

    const panY = React.useRef(new Animated.Value(0)).current;

    const resetPositionAnim = Animated.spring(panY, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 4,
    });

    const closeAnim = Animated.timing(panY, {
        toValue: height,
        duration: 250,
        useNativeDriver: true,
    });

    const panResponder = React.useRef(
        PanResponder.create({

            onMoveShouldSetPanResponder: (_, gestureState) => {
                return Math.abs(gestureState.dy) > 5;
            },

            onPanResponderMove: (_, gestureState) => {
                if (gestureState.dy > 0) {
                    panY.setValue(gestureState.dy);
                }
            },

            onPanResponderRelease: (_, gestureState) => {

                if (gestureState.dy > 80 || gestureState.vy > 1.2) {
                    closeAnim.start(() => {
                        onClose();
                        panY.setValue(0);
                    });
                } else {
                    resetPositionAnim.start();
                }
            },
        })
    ).current;

    React.useEffect(() => {
        if (visible) {
            panY.setValue(0);
        }
    }, [visible]);

    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>

                {/* Background Click Close */}
                <TouchableOpacity
                    style={StyleSheet.absoluteFill}
                    activeOpacity={1}
                    onPress={onClose}
                />

                <Animated.View
                    style={[
                        styles.modalContent,
                        { transform: [{ translateY: panY }] }
                    ]}
                >

                    {/* Drag Area */}
                    <View style={styles.dragArea} {...panResponder.panHandlers}>
                        <View style={styles.handle} />
                        <View style={styles.header}>
                            <AppText style={styles.headerTitle} weight="bold">
                                Filters & Sort
                            </AppText>
                        </View>
                    </View>

                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 20 }}
                    >

                        {/* SORT OPTIONS */}
                        <AppText style={styles.sectionLabel} weight="bold">
                            SORT BY
                        </AppText>

                        {SORT_OPTIONS.map(option => {

                            const isSelected = selectedSort === option.value;

                            return (
                                <TouchableOpacity
                                    key={option.value}
                                    style={[
                                        styles.item,
                                        isSelected && styles.selectedItem
                                    ]}
                                    onPress={() => onSelectSort(option.value)}
                                >

                                    <View style={styles.itemContent}>

                                        <MaterialCommunityIcons
                                            name={option.icon}
                                            size={20}
                                            color={isSelected ? '#3B82F6' : '#94A3B8'}
                                        />

                                        <AppText
                                            style={[
                                                styles.itemLabel,
                                                isSelected && styles.selectedLabel
                                            ]}
                                            weight={isSelected ? 'bold' : 'medium'}
                                        >
                                            {option.label}
                                        </AppText>

                                    </View>

                                    {isSelected && (
                                        <Ionicons
                                            name="checkmark-sharp"
                                            size={20}
                                            color="#3B82F6"
                                        />
                                    )}

                                </TouchableOpacity>
                            );
                        })}

                        <View style={styles.separator} />

                        {/* TIME OPTIONS */}
                        <AppText style={styles.sectionLabel} weight="bold">
                            TIME PERIOD
                        </AppText>

                        {TIME_OPTIONS.map(option => {

                            const isSelected = selectedTime === option.value;

                            return (
                                <TouchableOpacity
                                    key={option.value}
                                    style={[
                                        styles.item,
                                        isSelected && styles.selectedItem
                                    ]}
                                    onPress={() => onSelectTime(option.value)}
                                >

                                    <View style={styles.itemContent}>

                                        <MaterialCommunityIcons
                                            name={option.icon}
                                            size={20}
                                            color={isSelected ? '#3B82F6' : '#94A3B8'}
                                        />

                                        <AppText
                                            style={[
                                                styles.itemLabel,
                                                isSelected && styles.selectedLabel
                                            ]}
                                            weight={isSelected ? 'bold' : 'medium'}
                                        >
                                            {option.label}
                                        </AppText>

                                    </View>

                                    {isSelected && (
                                        <Ionicons
                                            name="checkmark-sharp"
                                            size={20}
                                            color="#3B82F6"
                                        />
                                    )}

                                </TouchableOpacity>
                            );
                        })}

                        {/* APPLY BUTTON */}
                        <TouchableOpacity
                            style={styles.applyBtn}
                            onPress={onClose}
                        >
                            <AppText style={styles.applyBtnText} weight="bold">
                                Apply Changes
                            </AppText>
                        </TouchableOpacity>

                    </ScrollView>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({

    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },

    modalContent: {
        width: '100%',
        backgroundColor: Theme.colors.background,
        paddingTop: 12,
        paddingHorizontal: 20,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        maxHeight: height * 0.8,
    },

    dragArea: {
        width: '100%',
        alignItems: 'center',
    },

    handle: {
        width: 40,
        height: 4,
        backgroundColor: '#334155',
        borderRadius: 2,
        marginBottom: 15,
    },

    header: {
        marginBottom: 25,
    },

    headerTitle: {
        fontSize: 18,
        color: 'white',
    },

    sectionLabel: {
        color: '#64748B',
        fontSize: 11,
        letterSpacing: 1.5,
        marginBottom: 10,
        marginTop: 10,
        paddingHorizontal: 10,
    },

    item: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 14,
        borderRadius: 12,
        marginBottom: 6,
        backgroundColor: '#1E293B',
    },

    selectedItem: {
        backgroundColor: 'rgba(59,130,246,0.1)',
        borderWidth: 1,
        borderColor: '#3B82F6',
    },

    itemContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },

    itemLabel: {
        fontSize: 14,
        color: '#94A3B8',
    },

    selectedLabel: {
        color: '#3B82F6',
    },

    separator: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.05)',
        marginVertical: 15,
        marginHorizontal: 10,
    },

    applyBtn: {
        backgroundColor: '#3B82F6',
        paddingVertical: 15,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 30,
    },

    applyBtnText: {
        color: 'white',
        fontSize: 16,
    },

});

export default SortModal;