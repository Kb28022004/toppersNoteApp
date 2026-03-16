import React, { useState, useCallback, useMemo } from 'react';
import {
    View,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    RefreshControl,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AppText from '../../components/AppText';
import SearchBar from '../../components/SearchBar';
import NoDataFound from '../../components/NoDataFound';
import { useGetNoteBuyersQuery } from '../../features/api/noteApi';
import useRefresh from '../../hooks/useRefresh';
import PageHeader from '../../components/PageHeader';
import useTheme from '../../hooks/useTheme';
import { BuyerSkeleton } from '../../components/skeletons/HomeSkeletons';

const AllNoteBuyers = ({ route, navigation }) => {
    const { noteId } = route.params;
    const { theme, isDarkMode } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const [search, setSearch] = useState('');
    const { data: buyers, isLoading, refetch } = useGetNoteBuyersQuery(noteId);
    const { refreshing, onRefresh } = useRefresh(refetch);

    const filteredBuyers = buyers ? buyers.filter(b =>
        b.studentName.toLowerCase().includes(search.toLowerCase()) ||
        b.class?.toLowerCase().includes(search.toLowerCase()) ||
        b.board?.toLowerCase().includes(search.toLowerCase())
    ) : [];

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />

            <PageHeader
                title="Purchased Students"
                subtitle={`${buyers?.length || 0} Total Learners`}
                onBackPress={() => navigation.goBack()}
            />

            <View style={styles.searchWrapper}>
                <SearchBar
                    value={search}
                    onChangeText={setSearch}
                    placeholder="Search by name or board..."
                    showFilter={false}
                />
            </View>

            <FlatList
                data={isLoading ? [] : filteredBuyers}
                keyExtractor={(item, index) => index.toString()}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={theme.colors.success}
                        colors={[theme.colors.success]}
                        backgroundColor="transparent"
                    />
                }
                ListEmptyComponent={
                    isLoading ? (
                        <View>
                            {[...Array(8)].map((_, i) => (
                                <BuyerSkeleton key={i} />
                            ))}
                        </View>
                    ) : (
                        <NoDataFound
                            message={search ? "No students match your search" : "No purchases yet for this note."}
                            icon="people-outline"
                        />
                    )
                }
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.buyerCard}
                        onPress={() => navigation.navigate('StudentProfileDetail', { studentId: item.studentId })}
                    >
                        {item.profilePhoto ? (
                            <Image source={{ uri: item.profilePhoto }} style={styles.buyerAvatar} />
                        ) : (
                            <View style={[styles.buyerAvatar, styles.buyerAvatarFallback]}>
                                <AppText style={styles.buyerAvatarText}>
                                    {item.studentName?.charAt(0) || 'S'}
                                </AppText>
                            </View>
                        )}
                        <View style={{ flex: 1 }}>
                            <AppText style={styles.buyerName} weight="bold">{item.studentName}</AppText>
                            <AppText style={styles.buyerMeta}>Class {item.class} • {item.board}</AppText>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                            <AppText style={styles.purchasedDate}>
                                {new Date(item.purchasedAt).toLocaleDateString(undefined, {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric'
                                })}
                            </AppText>
                            <View style={styles.statusBadge}>
                                <Ionicons name="checkmark-circle" size={10} color={theme.colors.success} />
                                <AppText style={styles.statusText}>Purchased</AppText>
                            </View>
                        </View>
                    </TouchableOpacity>
                )}
            />
        </SafeAreaView>
    );
};

const createStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    searchWrapper: {
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
        flexGrow: 1,
    },
    buyerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.card,
        padding: 15,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    buyerAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginRight: 12,
    },
    buyerAvatarFallback: {
        backgroundColor: theme.colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buyerAvatarText: {
        color: theme.colors.text,
        fontSize: 18,
        fontWeight: 'bold',
    },
    buyerName: {
        color: theme.colors.text,
        fontSize: 15,
        marginBottom: 2,
    },
    buyerMeta: {
        color: theme.colors.textMuted,
        fontSize: 12,
    },
    purchasedDate: {
        color: theme.colors.textSubtle,
        fontSize: 11,
        marginBottom: 4,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.success + '18',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
        gap: 4,
    },
    statusText: {
        color: theme.colors.success,
        fontSize: 10,
        fontWeight: 'bold',
    },
});

export default AllNoteBuyers;
