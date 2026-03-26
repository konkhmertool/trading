/* GITHUB API token
// 👉 https://github.com/settings/tokens 
✔ Use: “Classic token (Personal access tokens classic)”
👉 Select permissions: ✔ repo (FULL access)
// Result TOKEN ID: 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
*/

// ===============================
// 🔴 CONFIG (PUT YOUR TOKEN HERE)
// ===============================
const githubToken = "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"; // your token
const owner = "konkhmertool";
const repo = "trading";
const path = "data.txt";

// IMPORTANT: force main branch
const getUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=main`;
const putUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

$(document).ready(function(){	
// SET TODAY DATE
    let today = new Date().toISOString().split("T")[0];
    $("#datetime").val(today);
	// CLICK ANYWHERE ON INPUT → OPEN DATE PICKER
$("#datetime").on("focus click", function(){
    this.showPicker();
});
// ===============================
// 🔁 HELPER FUNCTION (AUTO TOKEN)
// ===============================
function githubFetch(url, options = {}) {	
    return fetch(url, {
        ...options,
        headers: {
            Authorization: `token ${githubToken}`,
            "Content-Type": "application/json",
            ...(options.headers || {})
        }
    });
}

	$("#menuToggle").on("click", function () {
    $("#mainMenu").toggleClass("show");
  });

/*
AREA Firebase GOOGLE
*/
// FIREBASE INIT
const firebaseConfig = {
  apiKey: "AIzaSyDXtKjKkzWFIgid3xgXq4dBl12FFGuAalk",
  authDomain: "trading-app-215a6.firebaseapp.com",
  projectId: "trading-app-215a6",
  storageBucket: "trading-app-215a6.firebasestorage.app",
  messagingSenderId: "838378906372",
  appId: "1:838378906372:web:def69c013e774281a4e651"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

/*
AREA Firebase GOOGLE
*/
// FIREBASE INIT
  $(document).on("click", function (e) {
    if (!$(e.target).closest("#menuToggle, #mainMenu").length) {
      $("#mainMenu").removeClass("show");
    }
  });    

    // =====================
    // LOAD TOKENS
    // =====================
    $.each(tokenList["Token Name"], function(i, obj){
        let key = Object.keys(obj)[0];
        let value = obj[key];
        $("#token").append(`<option value="${value}">${value.toUpperCase()}</option>`);
    });

    // ===============================
    // SAVE BUTTON
    // ===============================
    $("#save").click(async function(){

		let token = $("#token").val();
		let price = $("#price").val();
		let amount = $("#amount").val();
		let datetime = $("#datetime").val();
		let type = $("#type").val();

		if(!price || !amount || !datetime){
			$("#dspMsg")
			  .removeClass("label-success")
			  .addClass("label-error")
			  .text("Please fill all fields.")
			  .fadeIn(200).delay(1600).fadeOut(700);
			return;
		}

		try {

			// GET MAX ID
			let snapshot = await db.collection("trades").get();
			let maxId = 0;

			snapshot.forEach(doc => {
				let data = doc.data();
				if (data.ID > maxId) maxId = data.ID;
			});

			// SAVE DATA
			await db.collection("trades").add({
				ID: maxId + 1,
				TokenName: token.toUpperCase(),
				Type: type,
				Price: Number(price),
				Amount: Number(amount),
				Total: Number(price) * Number(amount),
				Date: datetime
			});

			$("#dspMsg")
			  .removeClass("label-error")
			  .addClass("label-success")
			  .text("Saved successfully!")
			  .fadeIn(200).delay(1600).fadeOut(700);

		} catch (e) {
			console.error(e);

			$("#dspMsg")
			  .removeClass("label-success")
			  .addClass("label-error")
			  .text("Error occurred")
			  .fadeIn(200).delay(1600).fadeOut(700);
		}

	});
//end save button


});