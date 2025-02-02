import { db } from './firebase';
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
  experience: string;
  averageRating: number;
  status: string;
  [key: string]: string | number | boolean;
}

export class RecommendationService {
  private weights: {
    specialization: number;
    location: number;
    fee: number;
  } = {
    specialization: 60,
    location: 20,
    fee: 20,
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
        weightsData.fee !== undefined
      ) {
        this.weights = weightsData as typeof this.weights;
      }
    }
  }

  private async calculateRecommendations(
    request: RecommendationRequest,
    therapists: TherapistData[]
  ) {
    const recommendations = therapists.map((therapist) => {
      const specializationScore =
        therapist.specialization?.toLowerCase() === request.injury.toLowerCase() ? 1 : 0;

      const locationScore =
        therapist.clinicAddress?.split(',')[0] === request.location.split(',')[0] ? 1 : 0;

      const fee = parseFloat(therapist.fee.toString());
      const feeScore =
        fee >= request.priceRangeStart && fee <= request.priceRangeEnd ? 1 : 0;

      const totalScore =
        (specializationScore * this.weights.specialization) / 100 +
        (locationScore * this.weights.location) / 100 +
        (feeScore * this.weights.fee) / 100;

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
    });

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
