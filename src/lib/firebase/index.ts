 import { initializeApp } from "firebase/app"
import {
  FacebookAuthProvider,
  GoogleAuthProvider,
  sendEmailVerification as _sendEmailVerification,
  browserLocalPersistence,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  getAuth,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth"

export * from "firebase/auth"
import {
  getMessaging as getFirebaseMessaging,
  getToken as getFirebaseToken,
  onMessage,
} from "firebase/messaging"
/* cSpell:disable */
  
const firebaseConfig = {
    "apiKey": "AIzaSyAtPrygGbOONq5DDGOZrgIpLe6edfTKggg",
    "authDomain": "shirleys-dev.firebaseapp.com",
    "projectId": "shirleys-dev",
    "storageBucket": "shirleys-dev.firebasestorage.app",
    "messagingSenderId": "45146878531",
    "appId": "1:45146878531:web:f257fddf8dd2253085daf6"
  }
/* cSpell:enable */
// Initialize Firebase
export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)

export function getMessaging() {
  return getFirebaseMessaging(app)
}

export async function getMessagingToken() {
  let deviceToken = null
  try {
    const status = await Notification.requestPermission()
    if (status && status === "granted") {
      const messaging = getMessaging()
      deviceToken = await getFirebaseToken(messaging, {
        vapidKey: firebaseConfig.vapid,
      })
    }
  } catch {
    deviceToken = null
  }

  return deviceToken
}

export const listenForMessages = (handleMessage: (payload: any) => void) => {
  onMessage(getMessaging(), (payload) => {
    if (handleMessage) {
      handleMessage(payload)
    }
  })
}

export async function getToken() {
  if (!auth.currentUser) {
    return
  }
  return await auth.currentUser.getIdToken()
}

export function checkLogin() {
  return !!auth.currentUser
}

export function getUser() {
  return auth.currentUser
}

export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider()
  provider.setCustomParameters({
    prompt: "select_account",
  })
  const result = await signInWithPopup(auth, provider)
  // This gives you a Google Access Token. You can use it to access the Google API.
  const credential = GoogleAuthProvider.credentialFromResult(result)
  if (!credential) {
    throw new Error("No credential")
  }
  // The signed-in user info.
  const user = result.user
  // IdP data available using getAdditionalUserInfo(result)

  return user
}

export async function signInWithFacebook() {
  const provider = new FacebookAuthProvider()
  provider.setCustomParameters({
    prompt: "select_account",
  })
  const result = await signInWithPopup(auth, provider)
  const credential = GoogleAuthProvider.credentialFromResult(result)
  if (!credential) {
    throw new Error("No credential")
  }
  // The signed-in user info.
  const user = result.user
  // IdP data available using getAdditionalUserInfo(result)
  return user
}

export async function signInWithEmailPassword(
  email: string,
  password: string,
  rememberMe = true
) {
  const persistence = rememberMe
    ? browserLocalPersistence
    : browserSessionPersistence

  await setPersistence(auth, persistence)
  const result = await signInWithEmailAndPassword(auth, email, password)

  return result.user
}

export async function signUpWithEmailPassword(email: string, password: string) {
  await setPersistence(auth, browserLocalPersistence)
  const signInMethod = await fetchSignInMethodsForEmail(auth, email)

  const result = await createUserWithEmailAndPassword(auth, email, password)

  await _sendEmailVerification(result.user)
  return result.user
}

export async function sendEmailVerification() {
  if (!auth.currentUser) {
    throw new Error("No current user")
  }
  await _sendEmailVerification(auth.currentUser)
}

export async function sendEmailPasswordReset(email: string) {
  await sendPasswordResetEmail(auth, email)
}

export async function signOut() {
  await auth.signOut()
}
