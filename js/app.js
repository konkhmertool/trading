/* GITHUB API token
// 👉 https://github.com/settings/tokens 
✔ Use: “Classic token (Personal access tokens classic)”
👉 Select permissions: ✔ repo (FULL access)
// Result TOKEN ID: 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
*/
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

		let months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
		let d = new Date(datetime);
		let formatted = d.getFullYear() + "-" + months[d.getMonth()] + "-" + d.getDate();

		// ===============================
		// GITHUB CONFIG
		// ===============================
		const githubToken = "ghp_xxxxxxxxxxxxx"; // 🔴 PUT YOUR TOKEN
		const owner = "konkhmertool";
		const repo = "trading";
		const path = "data.txt";

		const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

		try {

			// ===============================
			// 1. GET FILE FROM GITHUB
			// ===============================
			let res = await fetch(url, {
				headers: {
					Authorization: `token ${githubToken}`
				}
			});

			if(res.status === 401){
				throw new Error("Unauthorized (check token)");
			}

			let data = await res.json();

			// ===============================
			// 2. DECODE + PARSE JSON
			// ===============================
			let content = atob(data.content);

			let json = [];
			try {
				json = JSON.parse(content);
			} catch (e) {
				console.warn("File empty or invalid JSON → reset");
				json = [];
			}

			// ===============================
			// 3. AUTO INCREMENT ID
			// ===============================
			let maxId = 0;
			if (json.length > 0) {
				maxId = Math.max(...json.map(item => item.ID || 0));
			}
			let newId = maxId + 1;

			// ===============================
			// 4. CREATE RECORD
			// ===============================
			let newRecord = {
				ID: newId,
				TokenName: token.toUpperCase(),
				Type: type,
				Price: parseFloat(price),
				Amount: parseFloat(amount),
				Total: parseFloat(price) * parseFloat(amount),
				Date: formatted
			};

			json.push(newRecord);

			// ===============================
			// 5. SAVE BACK TO GITHUB
			// ===============================
			await fetch(url, {
				method: "PUT",
				headers: {
					Authorization: `token ${githubToken}`,
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					message: "Add new record",
					content: btoa(JSON.stringify(json, null, 2)),
					sha: data.sha
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
