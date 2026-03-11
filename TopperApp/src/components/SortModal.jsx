import React, { useRef } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AppText from './AppText';
import { Theme } from '../theme/Theme';
import BottomSheet from './BottomSheet';

const DEFAULT_SORT_OPTIONS = [
    { label: 'Newest First', value: 'newest', icon: 'clock-outline' },
    { label: 'Oldest First', value: 'oldest', icon: 'history' },
    { label: 'Alphabetical: A-Z', value: 'a-z', icon: 'sort-alphabetical-ascending' },
    { label: 'Alphabetical: Z-A', value: 'z-a', icon: 'sort-alphabetical-descending' },
    { label: 'Highest Rated', value: 'rating', icon: 'star-outline' },
    { label: 'Price: Low to High', value: 'price_low', icon: 'sort-ascending' },
    { label: 'Price: High to Low', value: 'price_high', icon: 'sort-descending' },
];

const DEFAULT_TIME_OPTIONS = [
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
    selectedSubject,
    onSelectSubject,
    subjects = [],
    sortOptions = DEFAULT_SORT_OPTIONS,
    timeOptions = DEFAULT_TIME_OPTIONS,
}) => {
    const scrollOffset = useRef(0);

    return (
        <BottomSheet
            visible={visible}
            onClose={onClose}
            scrollOffset={scrollOffset}
            paddingHorizontal={20}
        >
            <View style={styles.header}>
                <AppText style={styles.headerTitle} weight="bold">
                    Filters & Sort
                </AppText>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
                bounces={false}
                overScrollMode="never"
                scrollEventThrottle={16}
                onScroll={(e) => {
                    scrollOffset.current = e.nativeEvent.contentOffset.y;
                }}
            >
                {/* SORT OPTIONS */}
                {sortOptions?.length > 0 && (
                    <>
                        <AppText style={styles.sectionLabel} weight="bold">
                            SORT BY
                        </AppText>

                        {sortOptions.map(option => {
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
                    </>
                )}

                {sortOptions?.length > 0 && timeOptions?.length > 0 && <View style={styles.separator} />}

                {/* TIME OPTIONS */}
                {timeOptions?.length > 0 && (
                    <>
                        <AppText style={styles.sectionLabel} weight="bold">
                            TIME PERIOD
                        </AppText>

                        {timeOptions.map(option => {
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
                    </>
                )}

                {/* SUBJECT OPTIONS */}
                {subjects?.length > 0 && (
                    <>
                        <View style={styles.separator} />
                        <AppText style={styles.sectionLabel} weight="bold">
                            FILTER BY SUBJECT
                        </AppText>

                        <View style={styles.subjectsGrid}>
                            <TouchableOpacity
                                style={[
                                    styles.subjectTag,
                                    selectedSubject === null && styles.selectedSubjectTag
                                ]}
                                onPress={() => onSelectSubject(null)}
                            >
                                <AppText style={[styles.subjectTagText, selectedSubject === null && styles.selectedSubjectTagText]}>
                                    All Subjects
                                </AppText>
                            </TouchableOpacity>

                            {subjects.map(subject => {
                                const isSelected = selectedSubject === subject;
                                return (
                                    <TouchableOpacity
                                        key={subject}
                                        style={[
                                            styles.subjectTag,
                                            isSelected && styles.selectedSubjectTag
                                        ]}
                                        onPress={() => onSelectSubject(isSelected ? null : subject)}
                                    >
                                        <AppText style={[styles.subjectTagText, isSelected && styles.selectedSubjectTagText]}>
                                            {subject}
                                        </AppText>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </>
                )}

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
        </BottomSheet>
    );
};

const styles = StyleSheet.create({
    header: {
        marginBottom: 15,
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
        backgroundColor: Theme.colors.modalItem,
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
    subjectsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        paddingHorizontal: 10,
        marginBottom: 10,
    },
    subjectTag: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: Theme.colors.modalItem,
    },
    selectedSubjectTag: {
        backgroundColor: 'rgba(59,130,246,0.1)',
        borderColor: '#3B82F6',
    },
    subjectTagText: {
        fontSize: 13,
        color: '#94A3B8',
    },
    selectedSubjectTagText: {
        color: '#3B82F6',
        fontWeight: 'bold',
    },
});

export default SortModal;