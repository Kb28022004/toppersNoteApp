import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    RefreshControl,
    StatusBar,
    ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AppText from '../../components/AppText';
import NoDataFound from '../../components/NoDataFound';
import { useGetNoteReviewsQuery } from '../../features/api/noteApi';
import useRefresh from '../../hooks/useRefresh';
import PageHeader from '../../components/PageHeader';
import { Theme } from '../../theme/Theme';

const AllNoteReviews = ({ route, navigation }) => {
    const { noteId } = route.params;
    const { data, isLoading, isError, refetch } = useGetNoteReviewsQuery(noteId);
    const { refreshing, onRefresh } = useRefresh(refetch);

    const reviews = data?.reviews || [];

    if (isLoading) return (
        <View style={styles.center}>
            <ActivityIndicator size="large" color="#FFD700" />
        </View>
    );

    const renderReviewItem = ({ item }) => (
        <TouchableOpacity
            style={styles.reviewCard}
            onPress={() => item.studentId && navigation.navigate('StudentProfileDetail', { studentId: item.studentId })}
        >
            <View style={styles.reviewHeader}>
                {item.profilePhoto ? (
                    <Image source={{ uri: item.profilePhoto }} style={styles.reviewerAvatar} />
                ) : (
                    <View style={[styles.reviewerAvatar, { justifyContent: 'center', alignItems: 'center' }]}>
                        <AppText style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>
                            {item.user?.charAt(0) || 'S'}
                        </AppText>
                    </View>
                )}
                <View style={{ flex: 1 }}>
                    <AppText style={styles.reviewerName} weight="bold">{item.user}</AppText>
                    <View style={styles.row}>
                        <AppText style={styles.reviewDate}>{item.daysAgo}</AppText>
                        {/* {item.verifiedPurchase && (
                            <View style={styles.verifiedBadge}>
                                <Ionicons name="checkmark-seal" size={12} color="#10B981" />
                                <AppText style={styles.verifiedText}>Verified Learner</AppText>
                            </View>
                        )} */}
                    </View>
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
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Header */}
            <PageHeader
                title="Student Reviews"
                subtitle={`${data?.total || 0} Total Feedback`}
                onBackPress={() => navigation.goBack()}
            />

            {/* List */}
            <FlatList
                data={reviews}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#FFD700"
                    />
                }
                ListEmptyComponent={
                    <NoDataFound
                        message="No reviews yet for this note."
                        icon="chatbox-outline"
                    />
                }
                renderItem={renderReviewItem}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.colors.background,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Theme.colors.background,
    },
    listContent: {
        paddingHorizontal: 20,
        paddingVertical: 20,
        paddingBottom: 40,
        flexGrow: 1,
    },
    reviewCard: {
        backgroundColor: Theme.colors.card,
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: Theme.colors.border,
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
        backgroundColor: '#334155',
    },
    reviewerName: {
        color: 'white',
        fontSize: 15,
        marginBottom: 2,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    reviewDate: {
        color: '#64748B',
        fontSize: 12,
    },
    verifiedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
    },
    verifiedText: {
        color: '#10B981',
        fontSize: 10,
        fontWeight: 'bold',
    },
    ratingBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 215, 0, 0.1)',
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
        color: '#CBD5E1',
        fontSize: 14,
        lineHeight: 22,
    }
});

export default AllNoteReviews;
