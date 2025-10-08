import React from 'react';
import styles from './UsersTable.module.css';
import RoleDropdown from './RoleDropdown';

const UsersTable = ({ users, onRoleChange, currentUser }) => {
    return (
        <div className={styles.tableContainer}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th></th>
                        <th>Email</th>
                        <th>Organization</th>
                        <th>Joined</th>
                        <th>Role</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.id}>
                            <td>
                                <div className={styles.avatar}>
                                    {user.email.charAt(0).toUpperCase()}
                                </div>
                            </td>
                            <td>{user.email}</td>
                            <td>{user.organizationName || 'N/A'}</td>
                            <td>{new Date(user.createdAt).toLocaleDateString('en-IN')}</td>
                            <td>
                                <RoleDropdown 
                                    role={user.role} 
                                    onChange={(newRole) => onRoleChange(user.id, newRole)} 
                                    disabled={user.firebaseUid === currentUser.uid}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default UsersTable;
