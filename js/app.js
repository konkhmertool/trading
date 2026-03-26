// GITHUB API token
// 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


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
		// GITHUB CONFIG (EDIT THIS)
		// ===============================
		const githubToken = "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";
		const owner = "konkhmertool";
		const repo = "trading";
		const path = "data.txt";

		const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

		try {
			// ===============================
			// 1. GET CURRENT FILE
			// ===============================
			let res = await fetch(url, {
				headers: {
					Authorization: `token ${githubToken}`
				}
			});

			let data = await res.json();

			let content = atob(data.content);
			let json = JSON.parse(content);

			// ===============================
			// 2. GET MAX ID
			// ===============================
			let maxId = 0;
			if (json.length > 0) {
				maxId = Math.max(...json.map(item => item.ID || 0));
			}
			let newId = maxId + 1;

			// ===============================
			// 3. CREATE NEW RECORD
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
			// 4. SAVE BACK TO GITHUB
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
			  .text("Saved to GitHub!")
			  .fadeIn(200).delay(1600).fadeOut(700);

		} catch (err) {
			console.error(err);
			$("#dspMsg")
			  .removeClass("label-success")
			  .addClass("label-error")
			  .text("Error saving!")
			  .fadeIn(200).delay(1600).fadeOut(700);
		}
	});


});