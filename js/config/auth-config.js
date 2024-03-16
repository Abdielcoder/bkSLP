import { tokens } from './config.js';

const auth = firebase.auth();

const redirectToIndex = () => {
  window.location.replace('../index.html');
}

const revokeToken = uid => {
  tokens.child(uid).update({ isConnected: false, token: null });
}

export const logOut = async () => {
  const uid = localStorage.uid;
  revokeToken(uid);
  auth.signOut();
  localStorage.clear();
  redirectToIndex();
}

export const isSessionExpired = () => {
  const uid = localStorage.uid;

  if (uid === undefined || uid === null) { redirectToIndex(); }

  tokens.child(uid).once('value').then(snap => {
    const i = snap.val();
    if (i.isConnected === true && (i.token !== undefined || i.token !== null)) return;
    window.location.replace('../index.html');
  });
}