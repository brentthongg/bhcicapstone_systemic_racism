const firebaseConfig = {
  apiKey: "AIzaSyDiI3lnDbIEqgc-4dhXziI0WFkLUYkjXSI",
  authDomain: "bhci-capstone-project-4.firebaseapp.com",
  projectId: "bhci-capstone-project-4",
  storageBucket: "bhci-capstone-project-4.appspot.com",
  messagingSenderId: "1010203821828",
  appId: "1:1010203821828:web:3e0b2be6ea3826bfd4b251",
  measurementId: "G-620FYSBZSV"
};

var db;
var user;
$(document).ready(function() {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
});


// CITATION: https://www.aspsnippets.com/Articles/Download-JSON-object-Array-as-File-from-Browser-using-JavaScript.aspx
function convertToJson(arr, sessionId) {
    if (!user) {
      return;
    }
    let json = JSON.stringify(arr, null, 4); // spacing level is 4
    json = [json];
    var blob = new Blob(json, { type: "text/plain;charset=utf-8" });
    var url = window.URL || window.webkitURL;
    link = url.createObjectURL(blob);

    if (document.getElementById("a-download-link")) {
      $("#a-download-link").remove();
    }

    var a = document.createElement("a");
    a.id = "a-download-link";
    a.download = `${sessionId}_session_data.json`;
    a.href = link;
    
    var button = document.createElement("button");
    button.type = 'button';
    button.classList.add("btn");
    button.classList.add("btn-outline-dark");
    button.innerText = "Click to download";

    a.appendChild(button)
    a.onclick = () => $(a).remove();

    var mainDiv = document.getElementById("main-container-download");
    mainDiv.appendChild(a)

}

function dataDownload() {
    if (!user) {
      return;
    }
    let sessionId = document.getElementById('session-id-input').value;
    var arr = [];

    if (sessionId == "" || typeof sessionId == 'undefined') {
      db.collection("sessions").get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            if (doc.exists) {
                if (Object.keys(doc.data()).length > 0) {
                  let session = {
                    id: doc.id,
                    data: doc.data()
                  };
                  arr.push(session);
                }
            } else {
                alert("No data found for session. Please make sure the session id is correct.");
            }
        });
      })
      .then(() => {
        convertToJson(arr, "all");
      });
    } else {
      db.collection("sessions").doc(sessionId).get().then((docRef) => {
        arr.push(docRef.data());
      })
      .then(() => {
        convertToJson(arr, sessionId);
      })
    }
}

// CITATION: https://firebase.google.com/docs/auth/web/start
function signIn() {
  let email = document.getElementById("email-input").value;
  let password = document.getElementById("password-input").value;
  firebase.auth().signInWithEmailAndPassword(email, password)
      .then((userCredentials) => {
          user = userCredentials.user;
          console.log(`Successful sign in with user: ${user}`);
          document.getElementById("signin").style.display = 'none';
          document.getElementById("main-container-download").style.display = 'block';
      })
      .catch((error) => {
          // Failed sign-in.
          var errorCode = error.code;
          var errorMessage = error.message;
          console.error(errorCode);
          console.error(errorMessage);
          var errorElement = document.createElement("p");
          errorElement.id = "signin-error-txt"
          errorElement.style.color = 'red';
          errorElement.innerText = errorMessage;
          let prevErrorElem = document.getElementById("signin-error-txt");
          if (prevErrorElem) {
              $(prevErrorElem).remove();
          }
          document.getElementById("signin").appendChild(errorElement);
      })
}

