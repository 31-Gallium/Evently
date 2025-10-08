import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './UsersView.module.css';
import cardStyles from './Card.module.css';
import useDebounce from '../../hooks/useDebounce';
import UsersTable from './UsersTable';
import { IconGrid, IconList } from '../../utils/Icons';
import RoleDropdown from './RoleDropdown';
import { getAuthHeader } from '../../utils/auth';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const UsersView = ({ user }) => {
    const [users, setUsers] = useState([]);
    const [userSearch, setUserSearch] = useState('');
    const [userRoleFilter, setUserRoleFilter] = useState('all');
    const [organizationFilter, setOrganizationFilter] = useState('');
    const [sortOrder, setSortOrder] = useState('email-asc');
    const [isLoading, setIsLoading] = useState(true);
    const [visibleUsers, setVisibleUsers] = useState(10);
    const [viewMode, setViewMode] = useState('grid');

    const debouncedUserSearch = useDebounce(userSearch, 300);
    const debouncedOrganizationFilter = useDebounce(organizationFilter, 300);

    const fetchData = useCallback(async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            const headers = await getAuthHeader();
            const usersRes = await fetch(`${API_BASE_URL}/admin/users`, { headers });
            if (!usersRes.ok) throw new Error('Failed to fetch users');
            setUsers(await usersRes.json());
        } catch (error) {
            console.error("Failed to fetch users:", error);
        }
        setIsLoading(false);
    }, [user]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleRoleChange = async (userId, newRole) => {
        try {
            const headers = await getAuthHeader();
            const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/role`, {
                method: 'PUT',
                headers,
                body: JSON.stringify({ role: newRole })
            });
            if (!response.ok) throw new Error((await response.json()).error || 'Failed to update role');
            fetchData(); // Refetch users to show the change
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    };

    const filteredAndSortedUsers = useMemo(() => {
        return users
            .filter(u =>
                (debouncedUserSearch === '' || u.email.toLowerCase().includes(debouncedUserSearch.toLowerCase())) &&
                (userRoleFilter === 'all' || u.role === userRoleFilter) &&
                (debouncedOrganizationFilter === '' || (u.organizationName && u.organizationName.toLowerCase().includes(debouncedOrganizationFilter.toLowerCase())))
            )
            .sort((a, b) => {
                const [field, order] = sortOrder.split('-');
                const factor = order === 'asc' ? 1 : -1;
                if (a[field] < b[field]) return -1 * factor;
                if (a[field] > b[field]) return 1 * factor;
                return 0;
            });
    }, [users, debouncedUserSearch, userRoleFilter, debouncedOrganizationFilter, sortOrder]);

    const currentUsers = filteredAndSortedUsers.slice(0, visibleUsers);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <div className={styles.usersViewContainer}>
            <div className={styles.header}>
                <h2>User Management</h2>
                <div className={styles.viewToggle}>
                    <button onClick={() => setViewMode('grid')} className={viewMode === 'grid' ? styles.active : ''}><IconGrid /></button>
                    <button onClick={() => setViewMode('table')} className={viewMode === 'table' ? styles.active : ''}><IconList /></button>
                </div>
                <div className={styles.filters}>
                    <input type="search" placeholder="Search by email..." className={styles.searchInput} value={userSearch} onChange={e => setUserSearch(e.target.value)} />
                    <input type="search" placeholder="Filter by organization..." className={styles.searchInput} value={organizationFilter} onChange={e => setOrganizationFilter(e.target.value)} />
                    <select className={styles.filterSelect} value={userRoleFilter} onChange={e => setUserRoleFilter(e.target.value)}>
                        <option value="all">All Roles</option>
                        <option value="ADMIN">Admin</option>
                        <option value="ORGANIZER">Organizer</option>
                        <option value="USER">User</option>
                    </select>
                    <select className={styles.filterSelect} value={sortOrder} onChange={e => setSortOrder(e.target.value)}>
                        <option value="email-asc">Email (A-Z)</option>
                        <option value="email-desc">Email (Z-A)</option>
                        <option value="createdAt-asc">Joined (Oldest)</option>
                        <option value="createdAt-desc">Joined (Newest)</option>
                    </select>
                </div>
            </div>
            <div className={styles.mainContent}>
                {viewMode === 'grid' ? (
                    <motion.div layout variants={containerVariants} initial="hidden" animate="visible" className={cardStyles.grid}>
                        <AnimatePresence>
                            {isLoading ? (
                                <p>Loading...</p>
                            ) : currentUsers.length === 0 ? (
                                <p>No users found.</p>
                            ) : (
                                currentUsers.map(u => (
                                    <motion.div
                                        variants={itemVariants}
                                        key={u.id}
                                        className={cardStyles.card}
                                    >
                                                                                <div className={cardStyles.cardHeader}>
                                                                                    <div className={styles.avatar}>
                                                                                        {u.email.charAt(0).toUpperCase()}
                                                                                    </div>
                                                                                    <span className={styles.userEmail}>{u.email}</span>
                                                                                    <div className={styles.roleDropdownWrapper}>
                                                                                        <RoleDropdown 
                                                                                            role={u.role} 
                                                                                            onChange={(newRole) => handleRoleChange(u.id, newRole)} 
                                                                                            disabled={u.firebaseUid === user.uid}
                                                                                        />
                                                                                    </div>                                        </div>
                                        <div className={cardStyles.cardBody}>
                                            <p>Organization: {u.organizationName || 'N/A'}</p>
                                            <p>Joined: {new Date(u.createdAt).toLocaleDateString('en-IN')}</p>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    </motion.div>
                ) : (
                    <UsersTable users={currentUsers} onRoleChange={handleRoleChange} currentUser={user} />
                )}
            </div>
            {visibleUsers < filteredAndSortedUsers.length && (
                <button className={styles.loadMoreButton} onClick={() => setVisibleUsers(prev => prev + 10)}>
                    Load More
                </button>
            )}
        </div>
    );
};
