import { getFirestore, collection, getDocs } from "firebase/firestore";

export const fetchEmails = async (): Promise<string[]> => {
  const db = getFirestore();
  const usersCollection = collection(db, "users");

  try {
    const querySnapshot = await getDocs(usersCollection);
    return querySnapshot.docs.map((doc) => doc.data().email);
  } catch (error) {
    console.error("❌ Error fetching emails:", error);
    return [];
  }
};