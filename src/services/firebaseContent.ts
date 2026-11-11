import { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { firestore } from './firebaseClient';

// Bundled content remains available on first load and without a connection.
export function useFirebaseCollection<T>(name: string, bundled: T[], valid: (item: T) => boolean): T[] {
  const [items, setItems] = useState(bundled);

  useEffect(() => {
    if (!firestore) return;
    return onSnapshot(collection(firestore, name), (snapshot) => {
      if (snapshot.empty) return;
      const remote = snapshot.docs.map((document) => document.data() as T);
      if (remote.every(valid)) {
        const key = (item: T) => {
          const record = item as Record<string, unknown>;
          return String(record.number ?? record.id ?? record.type);
        };
        const combined = new Map(bundled.map((item) => [key(item), item]));
        remote.forEach((item) => combined.set(key(item), item));
        setItems([...combined.values()]);
      }
    }, (error) => console.warn(`Tidak dapat memuat ${name} dari Firebase:`, error));
  }, [name]);

  return items;
}
