$(document).ready(async function(){

	let allData = [];
	let sortState = { field: null, asc: true };

	// MENU
	$("#menuToggle").on("click", function () {
		$("#mainMenu").toggleClass("show");
	});

	$(document).on("click", function (e) {
		if (!$(e.target).closest("#menuToggle, #mainMenu").length) {
			$("#mainMenu").removeClass("show");
		}
	});

	// LOAD DATA
	let snapshot = await getDocs(collection(db, "trades"));

	snapshot.forEach(doc => {
		let d = doc.data();
		d._id = doc.id; // for delete
		allData.push(d);
	});

	renderTable(allData);

	// =====================
	// RENDER TABLE
	// =====================
	function renderTable(data){

		let buyAmount = 0, sellAmount = 0;
		let buyTotal = 0, sellTotal = 0;

		let html = "";

		data.forEach(d => {

			let price = parseFloat(d.Price) || 0;
			let amount = parseFloat(d.Amount) || 0;
			let total = parseFloat(d.Total) || 0;

			if(d.Type.toUpperCase() === "BUY"){
				buyAmount += amount;
				buyTotal += total;
			}else{
				sellAmount += amount;
				sellTotal += total;
			}

			html += `
			<tr>
				<td>${d.TokenName}</td>
				<td>${d.Date}</td>
				<td>${d.Price}</td>
				<td>${d.Amount}</td>
				<td>${d.Total}</td>
				<td><span class="delete-btn" data-id="${d._id}">🗑</span></td>
			</tr>`;
		});

		$("#historyTable").html(html);

		// BALANCE
		let balance = buyAmount - sellAmount;
		$("#balance").text(balance.toFixed(6));

		// TOTAL
		let totalFinal = buyTotal - sellTotal;
		$("#totalValue").text(totalFinal.toFixed(6));
	}

	// =====================
	// SORT
	// =====================
	$("th[data-sort]").click(function(){

		let field = $(this).data("sort");

		if(sortState.field === field){
			sortState.asc = !sortState.asc;
		}else{
			sortState.field = field;
			sortState.asc = true;
		}

		// CLEAR ICONS
		$(".sort-icon").text("");

		let icon = sortState.asc ? "▲" : "▼";
		$(this).find(".sort-icon").text(icon);

		let sorted = [...allData].sort((a,b)=>{

			let valA, valB;

			if(field === "token"){
				valA = a.TokenName;
				valB = b.TokenName;
			}else if(field === "date"){
				valA = a.Date;
				valB = b.Date;
			}

			if(valA < valB) return sortState.asc ? -1 : 1;
			if(valA > valB) return sortState.asc ? 1 : -1;
			return 0;
		});

		renderTable(sorted);
	});

	// =====================
	// DELETE
	// =====================
	$(document).on("click", ".delete-btn", async function(){

		let id = $(this).data("id");

		if(!confirm("Delete this record?")) return;

		try{

			// 🔥 DELETE FROM FIREBASE
			await deleteDoc(doc(db, "trades", id));

			// 🔥 REMOVE FROM UI (REAL-TIME)
			$(this).closest("tr").remove();

			// 🔥 ALSO REMOVE FROM ARRAY
			allData = allData.filter(item => item._id !== id);

			// 🔥 RECALCULATE BALANCE + TOTAL
			renderTable(allData);

		}catch(e){
			console.error(e);
			alert("Delete failed");
		}

	});

});