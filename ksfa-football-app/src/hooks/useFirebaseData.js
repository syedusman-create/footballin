// src/hooks/useFirebaseData.js
import { useState, useEffect } from 'react';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../utils/firebase';

export const useFirebaseAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Attempt to get or create user document
        const userDocRef = doc(db, 'users', currentUser.uid);
        setDoc(userDocRef, { lastLogin: new Date() }, { merge: true })
          .then(() => console.log('User document updated/created'))
          .catch(e => console.error('Error setting user document:', e));
      } else {
        // Sign in anonymously if no user is logged in
        signInAnonymously(auth)
          .then(() => console.log('Signed in anonymously'))
          .catch((e) => {
            console.error('Anonymous sign-in failed:', e);
            setError('Failed to sign in anonymously. Check Firebase configuration and network.');
          });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, loading, error };
};

