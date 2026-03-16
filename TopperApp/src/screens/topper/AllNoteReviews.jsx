import React, { useMemo } from 'react';
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
import NoDataFound from '../../components/NoDataFound';
import { useGetNoteReviewsQuery } from '../../features/api/noteApi';
import useRefresh from '../../hooks/useRefresh';
import PageHeader from '../../components/PageHeader';
import useTheme from '../../hooks/useTheme';
import { ReviewSkeleton } from '../../components/skeletons/HomeSkeletons';

const AllNoteReviews = ({ route, navigation }) => {
    const { noteId } = route.params;
    const { theme, isDarkMode } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const { data, isLoading, refetch } = useGetNoteReviewsQuery(noteId);
    const { refreshing, onRefresh } = useRefresh(refetch);

    const reviews = data?.reviews || [];

    const renderReviewItem = ({ item }) => (
        <TouchableOpacity
            style={styles.reviewCard}
            onPress={() => item.studentId && navigation.navigate('StudentProfileDetail', { studentId: item.studentId })}
        >
            <View style={styles.reviewHeader}>
                {item.profilePhoto ? (
                    <Image source={{ uri: item.profilePhoto }} style={styles.reviewerAvatar} />
                ) : (
                    <View style={[styles.reviewerAvatar, styles.avatarFallback]}>
                        <AppText style={styles.avatarInitial}>
                            {item.user?.charAt(0) || 'S'}
                        </AppText>
                    </View>
                )}
                <View style={{ flex: 1 }}>
                    <AppText style={styles.reviewerName} weight="bold">{item.user}</AppText>
                    <AppText style={styles.reviewDate}>{item.daysAgo}</AppText>
                </View>
                <View style={styles.ratingBox}>
                    <Ionicons name="star" size={14} color="#FFD700" />
                    <AppText style={styles.ratingText} weight="bold">{item.rating}</AppText>
                </View>
            </View>
            <AppText style={styles.reviewComment}>{item.comment}</AppText>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />

            <PageHeader
                title="Student Reviews"
                subtitle={`${data?.total || 0} Total Feedback`}
                onBackPress={() => navigation.goBack()}
            />

            <FlatList
                data={isLoading ? [] : reviews}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#FFD700"
                        backgroundColor="transparent"
                    />
                }
                ListEmptyComponent={
                    isLoading ? (
                        <View>
                            {[...Array(6)].map((_, i) => (
                                <ReviewSkeleton key={i} showNoteInfo={false} />
                            ))}
                        </View>
                    ) : (
                        <NoDataFound
                            message="No reviews yet for this note."
                            icon="chatbox-outline"
                        />
                    )
                }
                renderItem={renderReviewItem}
            />
        </SafeAreaView>
    );
};

const createStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    listContent: {
        paddingHorizontal: 20,
        paddingVertical: 20,
        paddingBottom: 40,
        flexGrow: 1,
    },
    reviewCard: {
        backgroundColor: theme.colors.card,
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    reviewHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    reviewerAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    avatarFallback: {
        backgroundColor: theme.colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarInitial: {
        color: theme.colors.text,
        fontSize: 18,
        fontWeight: 'bold',
    },
    reviewerName: {
        color: theme.colors.text,
        fontSize: 15,
        marginBottom: 2,
    },
    reviewDate: {
        color: theme.colors.textMuted,
        fontSize: 12,
    },
    ratingBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 215, 0, 0.12)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        gap: 4,
    },
    ratingText: {
        color: '#FFD700',
        fontSize: 13,
    },
    reviewComment: {
        color: theme.colors.textMuted,
        fontSize: 14,
        lineHeight: 22,
    },
});

export default AllNoteReviews;
