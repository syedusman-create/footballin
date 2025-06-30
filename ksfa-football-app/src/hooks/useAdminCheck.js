import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../utils/firebase';

export function useAdminCheck(user) {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!user || !user.email) {
      setIsAdmin(false);
      return;
    }
    const check = async () => {
      const adminDoc = await getDoc(doc(db, 'admins', user.email));
      setIsAdmin(adminDoc.exists());
    };
    check();
  }, [user]);

  return isAdmin;
}