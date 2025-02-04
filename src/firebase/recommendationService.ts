import { db } from '../firebase/firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  onSnapshot,
  query,
  where,
  Timestamp,
} from 'firebase/firestore';

interface RecommendationRequest {
  injury: string;
  location: string;
  priceRangeStart: number;
  priceRangeEnd: number;
  timestamp: Timestamp;
  status: 'pending' | 'completed';
}

interface TherapistData {
  id: string;
  specialization: string;
  clinicAddress: string;
  fee: number;
  licenseDate: Timestamp;  // Add the license date
  status: string;
  [key: string]: string | number | boolean | Timestamp;
}

export class RecommendationService {
  private weights: {
    specialization: number;
    location: number;
    fee: number;
    experience: number; // Add experience to weights
    therapistRating: number; // Add rating to weights
  } = {
    specialization: 60,
    location: 20,
    fee: 20,
    experience: 10,
    therapistRating: 10,
  };

  constructor() {
    this.init();
  }

  private async init() {
    await this.loadWeights();
    this.listenToRequests();
  }

  public async loadWeights() {
    const weightsDoc = await getDoc(doc(db, 'weights', 'recommendationWeights'));
    if (weightsDoc.exists()) {
      const weightsData = weightsDoc.data();
      if (
        weightsData.specialization !== undefined &&
        weightsData.location !== undefined &&
        weightsData.fee !== undefined &&
        weightsData.experience !== undefined &&
        weightsData.therapistRating !== undefined
      ) {
        this.weights = weightsData as typeof this.weights;
      }
    }
  }

  private calculateExperienceYears(licenseDate: Timestamp | Date): number {
    const currentDate = new Date();
    const startDate = licenseDate instanceof Timestamp ? licenseDate.toDate() : new Date(licenseDate);
    const diffTime = currentDate.getTime() - startDate.getTime();
    const diffYears = diffTime / (1000 * 3600 * 24 * 365);
    return Math.floor(diffYears); // Round down to whole years
  }

  private async calculateAverageRating(therapistId: string): Promise<number> {
    const ratingsRef = collection(db, 'therapistRatings');
    const ratingsQuery = query(
      ratingsRef,
      where('therapistId', '==', therapistId),
      where('isArchived', '==', false)
    );
    const querySnapshot = await getDocs(ratingsQuery);
    const ratings = querySnapshot.docs.map((doc) => doc.data() as { rating: number });

    if (ratings.length === 0) return 0; // Return 0 if no ratings

    const sumRatings = ratings.reduce((sum, rating) => sum + rating.rating, 0);
    return sumRatings / ratings.length; // Average rating
  }

  private async calculateRecommendations(
    request: RecommendationRequest,
    therapists: TherapistData[]
  ) {
    const recommendations = await Promise.all(therapists.map(async (therapist) => {
      const experienceYears = this.calculateExperienceYears(therapist.licenseDate); // Get experience in years
      const averageRating = await this.calculateAverageRating(therapist.id); // Get therapist rating

      const specializationScore =
        therapist.specialization?.toLowerCase() === request.injury.toLowerCase() ? 1 : 0;

      const locationScore =
        therapist.clinicAddress?.split(',')[0] === request.location.split(',')[0] ? 1 : 0;

      const fee = parseFloat(therapist.fee.toString());
      const feeScore =
        fee >= request.priceRangeStart && fee <= request.priceRangeEnd ? 1 : 0;

      const experienceScore = experienceYears / 10; // Normalize experience to scale
      const ratingScore = averageRating / 5; // Normalize rating to scale

      const totalScore =
        (specializationScore * this.weights.specialization) / 100 +
        (locationScore * this.weights.location) / 100 +
        (feeScore * this.weights.fee) / 100 +
        (experienceScore * this.weights.experience) / 100 +
        (ratingScore * this.weights.therapistRating) / 100;

      return {
        therapistId: therapist.id,
        score: totalScore,
        details: therapist,
        matches: {
          specialization: specializationScore === 1,
          location: locationScore === 1,
          fee: feeScore === 1,
        },
      };
    }));

    return recommendations.sort((a, b) => b.score - a.score);
  }

  private async processRequest(requestId: string, request: RecommendationRequest) {
    try {
      const therapistsSnapshot = await getDocs(
        query(
          collection(db, 'users'),
          where('accountType', '==', 'therapist'),
          where('status', '==', 'Active')
        )
      );

      const therapists = therapistsSnapshot.docs.map((doc) => ({
        therapistId: doc.id,
        ...(doc.data() as TherapistData),
      }));

      const recommendations = await this.calculateRecommendations(request, therapists);

      await setDoc(doc(db, 'recommendations', requestId), {
        therapists: recommendations,
        timestamp: Timestamp.now(),
        requestData: request,
      });

      await setDoc(
        doc(db, 'recommendationRequests', requestId),
        {
          ...request,
          status: 'completed',
        },
        { merge: true }
      );
    } catch (error) {
      console.error('Error processing recommendation request:', error);
    }
  }

  private listenToRequests() {
    const requestsQuery = query(
      collection(db, 'recommendationRequests'),
      where('status', '==', 'pending')
    );

    onSnapshot(requestsQuery, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added' || change.type === 'modified') {
          const request = change.doc.data() as RecommendationRequest;
          try {
            this.processRequest(change.doc.id, request);
          } catch (error) {
            console.error('Error in request listener:', error);
          }
        }
      });
    });
  }
}

export const recommendationService = new RecommendationService();
