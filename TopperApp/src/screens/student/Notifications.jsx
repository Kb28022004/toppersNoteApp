import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PageHeader from '../../components/PageHeader';
import AppText from '../../components/AppText';
import { useGetNotificationsQuery, useMarkAsReadMutation, useDeleteNotificationMutation } from '../../features/api/notificationApi';
import { NotificationSkeleton } from '../../components/skeletons/HomeSkeletons';

import useTheme from '../../hooks/useTheme';
import { useMemo } from 'react';

export default function Notifications({ navigation }) {
    const { theme, isDarkMode } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const [page, setPage] = useState(1);
    const { data: notificationsData, isLoading, isFetching, refetch } = useGetNotificationsQuery({ page, limit: 15 });
    const [markAsRead] = useMarkAsReadMutation();
    const [deleteNotification] = useDeleteNotificationMutation();
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = async () => {
        setRefreshing(true);
        setPage(1);
        await refetch();
        setRefreshing(false);
    };

    // Mark all as read when opening page
    useEffect(() => {
        if (notificationsData?.data?.unreadCount > 0) {
            markAsRead([]).catch(e => console.log('Mark Read Error:', e));
        }
    }, [notificationsData?.data?.unreadCount]);

    const handleLoadMore = () => {
        if (!isLoading && !isFetching && notificationsData?.data?.pagination?.page < notificationsData?.data?.pagination?.totalPages) {
            setPage(prev => prev + 1);
        }
    };

    const renderIcon = (type) => {
        switch (type) {
            case 'NEW_SALE': return <Ionicons name="cash" size={24} color={theme.colors.success} />;
            case 'NOTE_APPROVED': return <Ionicons name="checkmark-circle" size={24} color={theme.colors.success} />;
            case 'NOTE_REJECTED': return <Ionicons name="close-circle" size={24} color={theme.colors.danger} />;
            case 'NEW_FOLLOWER': return <Ionicons name="person-add" size={24} color={theme.colors.primary} />;
            case 'PURCHASE_SUCCESS': return <Ionicons name="bag-check" size={24} color={theme.colors.primary} />;
            default: return <Ionicons name="notifications" size={24} color={theme.colors.textMuted} />;
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteNotification(id).unwrap();
        } catch (error) {
            console.error("Failed to delete notification", error);
        }
    };

    const handleNotificationPress = (item) => {
        if (!item.metadata) return;

        switch (item.type) {
            case 'NEW_SALE':
            case 'PURCHASE_SUCCESS':
                if (item.metadata.orderId) {
                    navigation.navigate('OrderDetails', { orderId: item.metadata.orderId });
                }
                break;
            case 'NOTE_APPROVED':
            case 'NOTE_REJECTED':
                navigation.navigate('MyUploads');
                break;
            case 'NEW_FOLLOWER':
                navigation.navigate('TopperProfile');
                break;
            default:
                break;
        }
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={[styles.notificationCard, !item.isRead && styles.unread]}
            activeOpacity={0.7}
            onPress={() => handleNotificationPress(item)}
        >
            <View style={styles.iconContainer}>
                {renderIcon(item.type)}
            </View>
            <View style={styles.content}>
                <AppText style={styles.title} weight="bold">{item.title}</AppText>
                <AppText style={styles.body}>{item.body}</AppText>
                <AppText style={styles.time} weight="medium">{new Date(item.createdAt).toLocaleString()}</AppText>
            </View>
            <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDelete(item._id)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
                <Ionicons name="trash-outline" size={20} color={theme.colors.danger} />
            </TouchableOpacity>
        </TouchableOpacity>
    );


    return (
        <View style={styles.container}>
            <PageHeader
                title="Notifications"
                onBackPress={() => navigation.goBack()}
            />

            <FlatList
                data={(isLoading && page === 1) ? [] : (notificationsData?.data?.notifications || [])}
                keyExtractor={(item, index) => item._id || index.toString()}
                renderItem={renderItem}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
                }
                ListEmptyComponent={() => {
                    if (isLoading && page === 1) {
                        const dynamicCount = notificationsData?.data?.notifications?.length > 0 ? notificationsData.data.notifications.length : 8;
                        return (
                            <View>
                                {[...Array(dynamicCount)].map((_, i) => (
                                    <NotificationSkeleton key={i} />
                                ))}
                            </View>
                        );
                    }
                    return (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="notifications-off-outline" size={60} color={theme.colors.textSubtle} />
                            <AppText style={styles.emptyText} weight="medium">You're all caught up!</AppText>
                        </View>
                    );
                }}
                ListFooterComponent={() => (
                    (isFetching && page > 1) ? <ActivityIndicator style={{ padding: 20 }} color={theme.colors.primary} /> : null
                )}
            />
        </View>
    );
}

const createStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
        paddingBottom: theme.layout.screenPadding,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
    },
    notificationCard: {
        flexDirection: 'row',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border + '40',
        backgroundColor: theme.colors.background,
    },
    unread: {
        backgroundColor: theme.colors.card + '50',
    },
    iconContainer: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
        backgroundColor: theme.colors.card,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
        borderWidth: 1,
        borderColor: theme.colors.border + '40',
    },
    content: {
        flex: 1
    },
    title: {
        color: theme.colors.text,
        fontSize: 16,
        marginBottom: 4
    },
    body: {
        color: theme.colors.textMuted,
        fontSize: 14,
        lineHeight: 20
    },
    time: {
        color: theme.colors.textSubtle,
        fontSize: 12,
        marginTop: 6
    },
    deleteButton: {
        padding: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 10,
    },
    emptyContainer: {
        padding: 50,
        alignItems: 'center'
    },
    emptyText: {
        color: theme.colors.textMuted,
        marginTop: 15,
        fontSize: 16,
    }
});
