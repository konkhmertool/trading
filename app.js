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

		// VALIDATION (KEEP YOUR UI)
		if(!price || !amount || !datetime){
			$("#dspMsg")
			  .removeClass("label-success")
			  .addClass("label-error")
			  .text("Please fill all fields.")
			  .stop(true,true).fadeIn(200).delay(1600).fadeOut(700);
			return;
		}

		// FORMAT DATE
		let months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
		let d = new Date(datetime);
		let formatted = d.getFullYear() + "-" + months[d.getMonth()] + "-" + d.getDate();

		try {

			// ===============================
			// 1. GET FILE (WITH TOKEN)
			// ===============================
			let res = await fetch(getUrl, {
				headers: {
					Authorization: "token " + githubToken
				}
			});

			let fileData = await res.json();

			console.log("GET STATUS:", res.status);
			console.log("GET DATA:", fileData);

			// ===============================
			// 2. PARSE JSON
			// ===============================
			let json = [];

			if (fileData.content) {
				try {
					let content = atob(fileData.content);
					json = JSON.parse(content);
				} catch {
					json = [];
				}
			}

			// ===============================
			// 3. MAX ID
			// ===============================
			let maxId = 0;
			json.forEach(x => {
				if (x.ID > maxId) maxId = x.ID;
			});

			// ===============================
			// 4. CREATE RECORD
			// ===============================
			let newRecord = {
				ID: maxId + 1,
				TokenName: token.toUpperCase(),
				Type: type,
				Price: Number(price),
				Amount: Number(amount),
				Total: Number(price) * Number(amount),
				Date: formatted
			};

			json.push(newRecord);

			console.log("NEW JSON:", json);

			// ===============================
			// 5. SAVE FILE (FIXED AUTH)
			// ===============================
			let saveRes = await fetch(putUrl, {
				method: "PUT",
				headers: {
					Authorization: "token " + githubToken, // 🔴 THIS IS THE KEY
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					message: "update data.txt",
					content: btoa(JSON.stringify(json, null, 2)),
					sha: fileData.sha,
					branch: "main"
				})
			});

			let result = await saveRes.json();

			console.log("SAVE STATUS:", saveRes.status);
			console.log("SAVE RESULT:", result);

			// ===============================
			// RESULT UI
			// ===============================
			if (saveRes.status === 200 || saveRes.status === 201) {
				$("#dspMsg")
				  .removeClass("label-error")
				  .addClass("label-success")
				  .text("Saved successfully!")
				  .stop(true,true).fadeIn(200).delay(1600).fadeOut(700);
			} else {
				$("#dspMsg")
				  .removeClass("label-success")
				  .addClass("label-error")
				  .text(result.message || "Save failed")
				  .stop(true,true).fadeIn(200).delay(1600).fadeOut(700);
			}

		} catch (e) {
			console.error(e);

			$("#dspMsg")
			  .removeClass("label-success")
			  .addClass("label-error")
			  .text("Error occurred")
			  .stop(true,true).fadeIn(200).delay(1600).fadeOut(700);
		}

	});
//end save button


});
