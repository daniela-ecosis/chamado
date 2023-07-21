import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: "AIzaSyCIomQnyIW5_IcJkJywWycr7TWPvkrkkZo",
  authDomain: "tickets-be7e2.firebaseapp.com",
  projectId: "tickets-be7e2",
  storageBucket: "tickets-be7e2.appspot.com",
  messagingSenderId: "855344555705",
  appId: "1:855344555705:web:2f376b9c43c951009c1d68",
  measurementId: "G-2YY3PGZXSE"
};
 
const firebaseApp = initializeApp(firebaseConfig);

const auth = getAuth(firebaseApp); 
const db = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);

export { auth, db, storage };    