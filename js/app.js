
$(document).ready(function(){	
	// SET TODAY DATE
    let today = new Date().toISOString().split("T")[0];
    $("#datetime").val(today);
	// CLICK ANYWHERE ON INPUT → OPEN DATE PICKER
	$("#datetime").on("focus click", function(){
		this.showPicker();
	});


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

		if(!price || !amount || !datetime){
			$("#dspMsg")
			  .removeClass("label-success")
			  .addClass("label-error")
			  .text("Please fill all fields.")
			  .fadeIn(200).delay(1600).fadeOut(700);
			return;
		}

		try {

			// 🔥 GET ALL DATA
			let snapshot = await getDocs(collection(db, "trades"));

			let maxId = 0;

			snapshot.forEach(doc => {
				let data = doc.data();
				if (data.ID > maxId) maxId = data.ID;
			});

			// 🔥 SAVE NEW RECORD
			await addDoc(collection(db, "trades"), {
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