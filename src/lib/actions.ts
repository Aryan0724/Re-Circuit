'use server';

import { doc, setDoc, addDoc, collection, updateDoc, serverTimestamp, getDocs, query, where, getDoc } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';
import type { PickupRequest, UserProfile, UserRole, PickupStatus, PickupLocation } from '@/types';

export async function approveRecycler(uid: string, approved: boolean) {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, { approved });
    return { success: true };
  } catch (error) {
    console.error('Error approving recycler:', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function createPickupRequest(
    data: {
        citizenId: string;
        citizenName: string;
        category: string;
        description: string;
        location: PickupLocation;
        photoDataUrl: string;
    }
) {
    try {
        const docRef = await addDoc(collection(db, 'pickups'), {
            citizenId: data.citizenId,
            citizenName: data.citizenName,
            category: data.category,
            description: data.description,
            location: data.location,
            photoURL: '', // Will be updated after upload
            status: 'pending',
            createdAt: serverTimestamp(),
        });

        const imageRef = ref(storage, `pickup-images/${docRef.id}`);
        const uploadResult = await uploadString(imageRef, data.photoDataUrl, 'data_url');
        const photoURL = await getDownloadURL(uploadResult.ref);

        await updateDoc(docRef, { photoURL });

        return { success: true, id: docRef.id };
    } catch (error) {
        console.error('Error creating pickup request:', error);
        return { success: false, error: (error as Error).message };
    }
}


export async function updatePickupStatus(pickupId: string, status: PickupStatus, recyclerId?: string) {
    try {
        const pickupRef = doc(db, 'pickups', pickupId);
        const updateData: { status: PickupStatus, recyclerId?: string } = { status };
        if (recyclerId && (status === 'accepted')) {
            updateData.recyclerId = recyclerId;
        }

        await updateDoc(pickupRef, updateData);
        
        // If completed, award credits to citizen
        if (status === 'completed') {
            const pickupDoc = (await getDoc(pickupRef)).data();
            if (pickupDoc) {
                const userRef = doc(db, 'users', pickupDoc.citizenId);
                const userDoc = await getDoc(userRef);
                if(userDoc.exists()) {
                    const currentCredits = userDoc.data().credits || 0;
                    await updateDoc(userRef, { credits: currentCredits + 10 });
                }
            }
        }
        
        return { success: true };
    } catch (error) {
        console.error('Error updating pickup status:', error);
        return { success: false, error: (error as Error).message };
    }
}
