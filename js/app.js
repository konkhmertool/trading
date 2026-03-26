let isSaving = false;
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

		// 🚫 BLOCK IF ALREADY SAVING
		if(isSaving) return;

		isSaving = true;

		let btn = $("#save");

		// 🔄 START LOADING
		btn.prop("disabled", true);
		btn.find(".btn-text").text("Saving...");
		btn.find(".btn-loader").show();

		let token = $("#token").val();
		let price = $("#price").val().trim();
		let amount = $("#amount").val().trim();
		let total = $("#total").val().trim();
		let datetime = $("#datetime").val();
		let type = $("#type").val();

		// VALIDATION
		if(!price || !amount || !datetime){

			$("#dspMsg")
			  .removeClass("label-success")
			  .addClass("label-error")
			  .text("Please fill all fields.")
			  .fadeIn(200).delay(1600).fadeOut(700);

			// 🔁 UNLOCK
			isSaving = false;
			btn.prop("disabled", false);
			btn.find(".btn-text").text("SAVE");
			btn.find(".btn-loader").hide();

			return;
		}

		try {

			let snapshot = await getDocs(collection(db, "trades"));

			let maxId = 0;
			snapshot.forEach(doc => {
				let data = doc.data();
				if (data.ID > maxId) maxId = data.ID;
			});

			await addDoc(collection(db, "trades"), {
				ID: maxId + 1,
				TokenName: token.toUpperCase(),
				Type: type,
				Price: price,
				Amount: amount,
				Total: total,
				Date: datetime
			});

			$("#dspMsg")
			  .removeClass("label-error")
			  .addClass("label-success")
			  .text("Saved successfully!")
			  .fadeIn(200).delay(1600).fadeOut(700);

			// RESET (your style)
			let selectedToken = $("#token").val();
			let selectedType = $("#type").val();

			$("#promptForm")[0].reset();
			$("#token").val(selectedToken);
			$("#type").val(selectedType);

			let today = new Date().toISOString().split("T")[0];
			$("#datetime").val(today);

			$("#price").focus();

		} catch (e) {
			console.error(e);

			$("#dspMsg")
			  .removeClass("label-success")
			  .addClass("label-error")
			  .text("Error occurred")
			  .fadeIn(200).delay(1600).fadeOut(700);
		}

		// 🔓 ALWAYS UNLOCK
		isSaving = false;
		btn.prop("disabled", false);
		btn.find(".btn-text").text("SAVE");
		btn.find(".btn-loader").hide();

	});
//end save button
$("#promptForm").on("submit", function(e){
	if(isSaving) e.preventDefault();
});

// 🔥 MATCH DATE WIDTH TO TOTAL INPUT TEXT
function adjustDateWidth(){

	let totalVal = $("#total").val() || "000000.000000";

	// create temp span to measure text width
	let temp = $("<span>").text(totalVal).css({
		visibility:"hidden",
		position:"absolute",
		"font-size":$("#total").css("font-size"),
		"font-family":$("#total").css("font-family")
	}).appendTo("body");

	let width = temp.width() + 20; // add padding

	temp.remove();

	$("#datetime").css("width", width + "px");
}

// run on load
adjustDateWidth();
// run when total changes
$("#total").on("input", adjustDateWidth);
// 🔄 UPDATE ON WINDOW RESIZE / ROTATE
$(window).on("resize", function(){
	adjustDateWidth();
});

});