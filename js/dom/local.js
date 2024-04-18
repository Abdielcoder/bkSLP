const authUser = sessionStorage.getItem("user");

if (authUser === undefined || authUser === null || authUser === "") {
  window.location.replace("../index.html");
}
