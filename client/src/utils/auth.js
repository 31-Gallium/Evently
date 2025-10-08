import { auth } from '../firebase';

/**
 * A function that returns a promise that resolves with the current user.
 * If no user is logged in, it resolves with null.
 * This helps manage the race condition where API calls are made before Firebase has initialized.
 */
const getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      unsubscribe();
      resolve(user);
    }, reject);
  });
};

export const getAuthHeader = async () => {
  let user = auth.currentUser;
  // If the user is not immediately available, wait for the auth state to be resolved
  if (!user) {
    user = await getCurrentUser();
  }

  // If there's still no user, return empty headers
  if (!user) {
    return {};
  }

  try {
    // Force refresh the token to avoid sending an expired token
    const token = await user.getIdToken(true);
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  } catch (error) {
    console.error("Error getting auth token:", error);
    return {};
  }
};