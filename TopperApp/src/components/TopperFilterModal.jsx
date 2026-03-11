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

const SORT_OPTIONS = [
    { label: 'Recently Joined', value: 'newest', icon: 'clock-outline' },
    { label: 'Popularity (Followers)', value: 'popularity', icon: 'trending-up' },
    { label: 'Highest Rated', value: 'rating', icon: 'star-outline' },
];

const CLASS_OPTIONS = ['10', '12'];
const BOARD_OPTIONS = [
    { label: 'CBSE', value: 'CBSE' },
    { label: 'ICSE', value: 'ICSE' },
    { label: 'State Board', value: 'STATE' }
];

const TopperFilterModal = ({
    visible,
    onClose,
    selectedSort,
    onSelectSort,
    selectedClass,
    onSelectClass,
    selectedBoard,
    onSelectBoard
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
                <AppText style={styles.headerTitle} weight="bold">Filter Toppers</AppText>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                scrollEventThrottle={16}
                bounces={false}
                overScrollMode="never"
                onScroll={(e) => { scrollOffset.current = e.nativeEvent.contentOffset.y; }}
            >
                {/* Sorting Section */}
                <AppText style={styles.sectionLabel} weight="bold">SORT BY</AppText>
                {SORT_OPTIONS.map((option) => {
                    const isSelected = selectedSort === option.value;
                    return (
                        <TouchableOpacity
                            key={option.value}
                            style={[styles.item, isSelected && styles.selectedItem]}
                            onPress={() => onSelectSort(option.value)}
                        >
                            <View style={styles.itemContent}>
                                <MaterialCommunityIcons
                                    name={option.icon}
                                    size={20}
                                    color={isSelected ? '#3B82F6' : '#94A3B8'}
                                />
                                <AppText
                                    style={[styles.itemLabel, isSelected && styles.selectedLabel]}
                                    weight={isSelected ? 'bold' : 'medium'}
                                >
                                    {option.label}
                                </AppText>
                            </View>
                            {isSelected && (
                                <Ionicons name="checkmark-sharp" size={20} color="#3B82F6" />
                            )}
                        </TouchableOpacity>
                    );
                })}

                <View style={styles.separator} />

                {/* Class Filter */}
                <AppText style={styles.sectionLabel} weight="bold">CLASS</AppText>
                <View style={styles.chipRow}>
                    <TouchableOpacity
                        style={[styles.chip, !selectedClass && styles.activeChip]}
                        onPress={() => onSelectClass(null)}
                    >
                        <AppText style={[styles.chipText, !selectedClass && styles.activeChipText]}>All</AppText>
                    </TouchableOpacity>
                    {CLASS_OPTIONS.map((item) => (
                        <TouchableOpacity
                            key={item}
                            style={[styles.chip, selectedClass === item && styles.activeChip]}
                            onPress={() => onSelectClass(item)}
                        >
                            <AppText style={[styles.chipText, selectedClass === item && styles.activeChipText]}>Class {item}</AppText>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.separator} />

                {/* Board Filter */}
                <AppText style={styles.sectionLabel} weight="bold">BOARD</AppText>
                <View style={styles.chipRow}>
                    <TouchableOpacity
                        style={[styles.chip, !selectedBoard && styles.activeChip]}
                        onPress={() => onSelectBoard(null)}
                    >
                        <AppText style={[styles.chipText, !selectedBoard && styles.activeChipText]}>All</AppText>
                    </TouchableOpacity>
                    {BOARD_OPTIONS.map((item) => (
                        <TouchableOpacity
                            key={item.value}
                            style={[styles.chip, selectedBoard === item.value && styles.activeChip]}
                            onPress={() => onSelectBoard(item.value)}
                        >
                            <AppText style={[styles.chipText, selectedBoard === item.value && styles.activeChipText]}>{item.label}</AppText>
                        </TouchableOpacity>
                    ))}
                </View>

                <TouchableOpacity
                    style={styles.applyBtn}
                    onPress={onClose}
                >
                    <AppText style={styles.applyBtnText} weight="bold">Apply Filters</AppText>
                </TouchableOpacity>

                <View style={{ height: 40 }} />
            </ScrollView>
        </BottomSheet>
    );
};

const styles = StyleSheet.create({
    header: {
        marginBottom: 20,
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
        paddingHorizontal: 5,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 12,
        marginBottom: 6,
        backgroundColor: Theme.colors.modalItem,
    },
    selectedItem: {
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
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
        marginVertical: 18,
    },
    chipRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        paddingHorizontal: 2,
        marginTop: 5,
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 14,
        backgroundColor: Theme.colors.modalItem,
        minWidth: 70,
        alignItems: 'center',
    },
    activeChip: {
        backgroundColor: 'rgba(59, 130, 246, 0.15)',
        borderColor: '#3B82F6',
    },
    chipText: {
        color: '#94A3B8',
        fontSize: 13,
    },
    activeChipText: {
        color: '#3B82F6',
        fontWeight: '700',
    },
    applyBtn: {
        backgroundColor: '#3B82F6',
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 35,
        shadowColor: '#3B82F6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    applyBtnText: {
        color: 'white',
        fontSize: 16,
    },
});

export default TopperFilterModal;
