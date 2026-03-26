/* GITHUB API token
// 👉 https://github.com/settings/tokens 
✔ Use: “Classic token (Personal access tokens classic)”
👉 Select permissions: ✔ repo (FULL access)
// Result TOKEN ID: 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
*/

// ===============================
// 🔴 CONFIG (PUT YOUR TOKEN HERE)
// ===============================
const githubToken = "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";
const owner = "konkhmertool";
const repo = "trading";
const path = "data.txt";

const baseUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=main`;

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

$(document).ready(function(){	

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

    // =====================
    // TAB SWITCH
    // =====================
    

    // =====================
    // SAVE DATA
    // =====================
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

		// ===============================
		// FORMAT DATE
		// ===============================
		let months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
		let d = new Date(datetime);
		let formatted = d.getFullYear() + "-" + months[d.getMonth()] + "-" + d.getDate();

		try {

			// ===============================
			// 1. GET FILE FROM GITHUB
			// ===============================
			let res = await githubFetch(baseUrl);
			let data = await res.json();

			// ===============================
			// 2. DECODE + PARSE
			// ===============================
			let json = [];

			if (data.content) {
				try {
					let content = atob(data.content);
					json = JSON.parse(content);
				} catch (e) {
					console.warn("Invalid JSON → reset");
					json = [];
				}
			} else {
				console.warn("Empty file → start new");
				json = [];
			}

			// ===============================
			// 3. AUTO INCREMENT ID
			// ===============================
			let maxId = 0;
			if (json.length > 0) {
				maxId = Math.max(...json.map(item => item.ID || 0));
			}

			let newRecord = {
				ID: maxId + 1,
				TokenName: token.toUpperCase(),
				Type: type,
				Price: parseFloat(price),
				Amount: parseFloat(amount),
				Total: parseFloat(price) * parseFloat(amount),
				Date: formatted
			};

			json.push(newRecord);

			// ===============================
			// 4. SAVE BACK TO GITHUB
			// ===============================
			await githubFetch(baseUrl, {
				method: "PUT",
				body: JSON.stringify({
					message: "Add new record",
					content: btoa(JSON.stringify(json, null, 2)),
					sha: fileData.sha,
					branch: "main"
				})
			});

			$("#dspMsg")
			  .removeClass("label-error")
			  .addClass("label-success")
			  .text("Saved successfully!")
			  .fadeIn(200).delay(1600).fadeOut(700);

		} catch (err) {
			console.error(err);

			$("#dspMsg")
			  .removeClass("label-success")
			  .addClass("label-error")
			  .text("Error: " + err.message)
			  .fadeIn(200).delay(1600).fadeOut(700);
		}

	}); //end save button


});
