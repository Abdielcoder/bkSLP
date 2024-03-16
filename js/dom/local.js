const uid = localStorage.getItem('uid');

if (uid === undefined || uid === null || uid === "" || localStorage.length === 0) {
  window.location.replace('../index.html');
} 