import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}
const db = admin.firestore();

/**
 * Interface for the data structure of a pickup request.
 */
interface PickupRequest {
  status: 'pending' | 'completed' | 'cancelled';
  userId: string;
  category: string;
  impact: {
    co2: number;
    materials: number;
    landfill: number;
  };
}

/**
 * Interface for the user profile data structure.
 */
interface UserProfile {
  uid: string;
  badges: string[];
}

/**
 * Aggregated statistics for a single user's contributions.
 */
interface UserContributionStats {
  completedPickupCount: number;
  totalCo2Reduced: number;
  totalMaterialsRecovered: number;
  totalWasteDiverted: number;
  categoryCounts: Record<string, number>;
}

/**
 * Defines the criteria and metadata for each badge.
 */
const BADGE_CRITERIA: Record<string, (stats: UserContributionStats, existingBadges: string[]) => boolean> = {
  'first-contribution': (stats) => stats.completedPickupCount >= 1,
  'laptop-recycler': (stats) => stats.categoryCounts['Laptop'] >= 1,
  'mobile-master': (stats) => stats.categoryCounts['Mobile'] >= 5,
  'landfill-hero-10kg': (stats) => stats.totalWasteDiverted >= 10,
};
type BadgeId = keyof typeof BADGE_CRITERIA;


/**
 * Cloud Function that triggers when a pickup document is updated.
 * It handles aggregating community-wide statistics and awarding badges to users
 * when a pickup's status changes to 'completed'.
 */
export const onPickupCompleted = functions.firestore
  .document('pickups/{pickupId}')
  .onUpdate(async (change) => {
    const before = change.before.data() as PickupRequest;
    const after = change.after.data() as PickupRequest;

    // Exit if status didn't change to 'completed'
    if (before.status === 'completed' || after.status !== 'completed') {
      return null;
    }

    const { userId, impact } = after;
    if (!userId || !impact) {
      functions.logger.error('Missing userId or impact data on pickup.', { id: change.after.id });
      return null;
    }

    // --- 1. Aggregate Community Statistics ---
    const communityStatsRef = db.doc('stats/communityImpact');
    const increment = admin.firestore.FieldValue.increment;
    try {
      await communityStatsRef.set({
        totalCo2Reduced: increment(impact.co2),
        totalMaterialsRecovered: increment(impact.materials),
        totalWasteDiverted: increment(impact.landfill),
      }, { merge: true });
      functions.logger.log('Community stats updated successfully.');
    } catch (error) {
      functions.logger.error('Error updating community stats:', error);
    }

    // --- 2. Award Badges ---
    const userRef = db.doc(`users/${userId}`);
    const userPickupsQuery = db.collection('pickups')
      .where('userId', '==', userId)
      .where('status', '==', 'completed');

    try {
      await db.runTransaction(async (transaction) => {
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists) {
          throw new Error(`User document ${userId} not found.`);
        }
        const existingBadges = (userDoc.data() as UserProfile).badges || [];
        const newBadges: BadgeId[] = [];

        // Calculate user's total contributions
        const pickupsSnapshot = await transaction.get(userPickupsQuery);
        const userStats: UserContributionStats = {
          completedPickupCount: 0,
          totalCo2Reduced: 0,
          totalMaterialsRecovered: 0,
          totalWasteDiverted: 0,
          categoryCounts: {},
        };

        pickupsSnapshot.docs.forEach(doc => {
          const pickup = doc.data() as PickupRequest;
          userStats.completedPickupCount += 1;
          userStats.totalCo2Reduced += pickup.impact?.co2 || 0;
          userStats.totalMaterialsRecovered += pickup.impact?.materials || 0;
          userStats.totalWasteDiverted += pickup.impact?.landfill || 0;
          userStats.categoryCounts[pickup.category] = (userStats.categoryCounts[pickup.category] || 0) + 1;
        });

        // Check for new badges
        for (const badgeId of Object.keys(BADGE_CRITERIA) as BadgeId[]) {
          if (!existingBadges.includes(badgeId)) {
            if (BADGE_CRITERIA[badgeId](userStats, existingBadges)) {
              newBadges.push(badgeId);
            }
          }
        }

        // Update user document if new badges were earned
        if (newBadges.length > 0) {
          functions.logger.log(`Awarding new badges to user ${userId}:`, newBadges);
          transaction.update(userRef, {
            badges: admin.firestore.FieldValue.arrayUnion(...newBadges)
          });
        }
      });
    } catch (error) {
      functions.logger.error(`Error in badge awarding transaction for user ${userId}:`, error);
    }

    return null;
  });
