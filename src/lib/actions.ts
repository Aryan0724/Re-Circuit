'use server';

import { doc, addDoc, updateDoc, collection, serverTimestamp } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';
import type { PickupStatus } from '@/types';

export async function approveRecycler(uid: string, approved: boolean) {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, { approved });
    return { success: true };
  } catch (error) {
    console.error("Error approving recycler: ", error);
    return { success: false, error: (error as Error).message };
  }
}

export async function createPickupRequest(
    data: {
        citizenId: string;
        citizenName: string;
        category: string;
        description: string;
        photoDataUrl: string;
        address: string;
    }
) {
    try {
        // 1. Upload image to Firebase Storage
        const storageRef = ref(storage, `pickups/${Date.now()}-${Math.random().toString(36).substring(2)}`);
        // The photoDataUrl is a Data URL, we need to extract the Base64 part
        const uploadResult = await uploadString(storageRef, data.photoDataUrl, 'data_url');
        const photoURL = await getDownloadURL(uploadResult.ref);

        // 2. Create pickup request document in Firestore
        await addDoc(collection(db, 'pickups'), {
          citizenId: data.citizenId,
          citizenName: data.citizenName,
          category: data.category,
          description: data.description,
          location: {
            displayAddress: data.address,
            // Mock coordinates for now
            lat: 0, 
            lon: 0,
          },
          photoURL: photoURL,
          status: 'pending',
          createdAt: serverTimestamp(),
        });
        
        return { success: true };
    } catch (error) {
        console.error("Error creating pickup request: ", error);
        return { success: false, error: (error as Error).message };
    }
}


export async function updatePickupStatus(pickupId: string, status: PickupStatus, recyclerId?: string, citizenId?: string) {
    try {
        const pickupRef = doc(db, 'pickups', pickupId);
        const updateData: any = { status };

        if (status === 'accepted' && recyclerId) {
            updateData.recyclerId = recyclerId;
        }

        await updateDoc(pickupRef, updateData);

        // Award credits for completed pickups
        if (status === 'completed' && citizenId) {
            const userRef = doc(db, 'users', citizenId);
            const userSnap = await (await import('firebase/firestore')).getDoc(userRef);
            if (userSnap.exists()) {
                const currentCredits = userSnap.data().credits ?? 0;
                await updateDoc(userRef, { credits: currentCredits + 50 }); // Award 50 credits
            }
        }
        
        return { success: true };
    } catch (error) {
        console.error("Error updating pickup status: ", error);
        return { success: false, error: (error as Error).message };
    }
}
