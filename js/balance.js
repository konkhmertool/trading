$(document).ready(function () {

	$("#menuToggle").on("click", function () {
		$("#mainMenu").toggleClass("show");
	});

	$(document).on("click", function (e) {
		if (!$(e.target).closest("#menuToggle, #mainMenu").length) {
			$("#mainMenu").removeClass("show");
		}
	});

	function showMsg(text, ok){
		$("#balanceMsg")
			.removeClass("label-success label-error")
			.addClass(ok ? "label-success" : "label-error")
			.text(text)
			.fadeIn(200).delay(1600).fadeOut(700);
	}

	function safeName(d, id){
		let name = d.TokenName || d.Name ||	d.name || d.Token || d.token || id;
	    name = String(name);
	    return name.charAt(0).toUpperCase() + name.slice(1);
	}

	async function loadBalance(){
		try{
			let snapshot = await getDocs(collection(db, "balance"));
			let html = "";

			if(snapshot.empty){
				$("#balanceTable").html('<tr><td colspan="3">No balance data found.</td></tr>');
				return;
			}

			snapshot.forEach(docSnap => {
				let d = docSnap.data();
				let id = docSnap.id;
				let amount = d.Amount ?? d.amount ?? "";

				html += `
<tr data-id="${id}">
	<td>${safeName(d, id)}</td>
	<td>
		<input type="number" step="any" class="form-control balance-amount" value="${amount}">
	</td>
	<td>
		<button type="button" class="btn save-balance">SAVE</button>
	</td>
</tr>`;
			});

			$("#balanceTable").html(html);

		}catch(e){
			console.error(e);
			$("#balanceTable").html('<tr><td colspan="3">Error loading balance.</td></tr>');
		}
	}

	$(document).on("click", ".save-balance", async function(){
		let btn = $(this);
		let row = btn.closest("tr");
		let id = row.data("id");
		let amount = row.find(".balance-amount").val().trim();

		if(amount === ""){
			showMsg("Please enter Amount.", false);
			return;
		}

		try{
			btn.prop("disabled", true).text("Saving...");

			await updateDoc(doc(db, "balance", id), {
				amount: amount
			});

			showMsg("Balance updated successfully!", true);

		}catch(e){
			console.error(e);
			showMsg("Update failed.", false);
		}

		btn.prop("disabled", false).text("SAVE");
	});

	loadBalance();

});