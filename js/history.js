$(document).ready(async function () {

	let allData = []; // ✅ MUST BE HERE
	let sortState = { asc: true };	
	window.lastGoldPrice = null;

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
		d._id = doc.id;
		allData.push(d);
	});

	// 🔥 FORCE NUMERIC SORT (SAFE)
	allData.sort((a,b)=> parseInt(a.ID) - parseInt(b.ID));
	
	renderTable(allData); 
	// 🔥 CALL ONLY ONCE HERE
	loadGoldPrice();
	loadBalanceInBinance();
	// 🔥 SHOW TOKEN ARROW DEFAULT
	$('th[data-sort="token"]').find(".sort-icon").text("▲");

	// =====================
	// RENDER TABLE
	// =====================
	function renderTable(data) {		
		
		let buyAmount = 0, sellAmount = 0;
		let buyTotal = 0, sellTotal = 0;

		let html = "";

		data.forEach(d => {

			let price = parseFloat(d.Price) || 0;
			let amount = parseFloat(d.Amount) || 0;
			let total = parseFloat(d.Total) || 0;

			if (d.Type.toUpperCase() === "BUY") {
				buyAmount += amount;
				buyTotal += total;
			} else {
				sellAmount += amount;
				sellTotal += total;
			}

			html += `
<tr>
	<td>
		<div>${d.TokenName}</div>		
		<div class="token-date">${formatDate(d.Date)}</div>
	</td>
	<td>${d.Price}</td>
	<td class="amount-tooltip-td" data-amount="${amount}" data-total="${total}" data-prepriceounce="${d.Price}">
		<span class="${d.Type.toUpperCase() === 'BUY' ? 'buy-text' : 'sell-text'}">
			(${d.Type.toUpperCase() === 'BUY' ? 'ទិញ' : 'លក់'})
		</span>
		${d.Amount}
		<span class="amount-info-icon">!</span>
	</td>
	<td>${d.Total}</td>
	<td><span class="delete-btn" data-id="${d._id}">×</span></td>
</tr>`;
		});

		// 🔥 ADD LINE AS LAST ROW
html += `
<tr>
	<td colspan="5" style="height:1px;background:#f6d246;padding:0;"></td>
</tr>`;

		$("#historyTable").html(html);

		// BALANCE
		let balance = buyAmount - sellAmount;
		$("#balance").text(balance.toFixed(6));
		
		updateBalanceApprox();

		// TOTAL
		let totalFinal = buyTotal - sellTotal;				
		$("#totalValue").text("$" + totalFinal.toFixed(6));

		window.currentBalance = balance;
		window.currentTotal = totalFinal;

		// 🔥 UPDATE PROFIT WITHOUT API CALL		
		if(window.lastGoldPrice){
			calculateProfit(window.lastGoldPrice);
		}

	} // End function renderTable

	$(document).on("click", ".amount-tooltip-td", function (e) {
		e.stopPropagation();

		let prepriceounce = parseFloat($(this).attr("data-prepriceounce")) || 0;
		let amount = parseFloat($(this).attr("data-amount")) || 0;
		let total = parseFloat($(this).attr("data-total")) || 0;
		
		let goldPrice = window.lastGoldPrice || parseFloat($("#goldPrice").text()) || 0;
		
		let currentMarket = goldPrice * amount;
		
		let profitLoss = currentMarket - total;
		let profit5percentOunce = prepriceounce * 1.05;
		let profit5percentDollar = total * 0.05;
		
		let statusText = profitLoss >= 0 ? '<span style="color:#4caf50">ចំណេញ</span>' : '<span style="color:#ff5252">ខាត</span>';
		let statusTextPercent = 'ចង់ចំណេញ 5% ≈ ';
		
		let tooltip = $("#marketTooltip");
		
		tooltip
			.html(
				amount.toFixed(3) +	" ≈ $" + currentMarket.toFixed(2) +	" តម្លៃបច្ចុប្បន្ន" +
				"<br>" +
				statusText + " $" +	Math.abs(profitLoss).toFixed(2) +
				"<br>" +
				statusTextPercent +"<span style='color:#2bff00'>"+ Math.abs(profit5percentDollar).toFixed(2) + "</span> ឬ Gold Price: " +"<span style='color:#2bff00'>"+ Math.abs(profit5percentOunce).toFixed(2) + "</span>"
			)
			.addClass("show");
	
		let rect = this.getBoundingClientRect();
	
		let left = rect.left + rect.width / 2;		
		let top = rect.top - (tooltip.outerHeight() - 25) ;
	
		if (top < 10) {
			top = rect.bottom + 10;
		}
	
		tooltip.css({
			left: left + "px",
			top: top + "px",
			transform: "translateX(-50%)"
		});
	});
	
	$(document).on("click", function () {
		$("#marketTooltip").removeClass("show");
	});
	
	$(window).on("scroll resize", function () {
		$("#marketTooltip").removeClass("show");
	});

	// =====================
	// SORT
	// =====================
	$("th[data-sort='token']").click(function(){

		// toggle sort direction
		sortState.asc = !sortState.asc;

		// clear all arrows
		$(".sort-icon").text("");

		// set arrow on token
		let icon = sortState.asc ? "▲" : "▼";
		$(this).find(".sort-icon").text(icon);

		// sort by token
		let sorted = [...allData].sort((a,b)=>{

			let valA = a.TokenName.toLowerCase();
			let valB = b.TokenName.toLowerCase();

			if(valA < valB) return sortState.asc ? -1 : 1;
			if(valA > valB) return sortState.asc ? 1 : -1;
			return 0;
		});

		renderTable(sorted);
	});

	// =====================
	// DELETE
	// =====================
	$(document).on("click", ".delete-btn", async function () {

		let id = $(this).data("id");		
		if (!confirm("Delete this record?")) return;
		try {		
			// ASK PASSWORD
			let inputPwd = prompt("Enter Password");

			if(!inputPwd){
				alert("Password required");
				return;
			}

			// CHECK PASSWORD
			let authSnap = await getDocs(collection(db, "authentication"));

			let validPwd = false;

			authSnap.forEach(docSnap => {

				let data = docSnap.data();

				if(data.pwd == inputPwd){
					validPwd = true;
				}

			});

			if(!validPwd){
				alert("Wrong Password");
				return;
			}// end check pwd

			// 🔥 DELETE FROM FIREBASE
			await deleteDoc(doc(db, "trades", id));

			// 🔥 REMOVE FROM UI (REAL-TIME)
			$(this).closest("tr").remove();

			// 🔥 ALSO REMOVE FROM ARRAY
			allData = allData.filter(item => item._id !== id);

			// 🔥 RECALCULATE BALANCE + TOTAL
			renderTable(allData);

		} catch (e) {
			console.error(e);
			alert("Delete failed");
		}

	});

	function formatDate(dateStr){

		let d = new Date(dateStr);

		let day = d.getDate().toString().padStart(2,'0');

		let months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
		let month = months[d.getMonth()];

		let year = d.getFullYear();

		return `${day}/${month}/${year}`;
	}

	async function loadGoldPrice(){
		try{
			let res = await fetch("https://api.gold-api.com/price/XAU");
			let data = await res.json();

			let goldPrice = data.price;

			// 🔥 SAVE PRICE
			window.lastGoldPrice = goldPrice;
			calculateProfit(goldPrice);
			// 🔥 SHOW PRICE
			$("#goldPrice").text(goldPrice.toFixed(2));

			// 🔥 UPDATE APPROX AFTER PRICE READY
			updateBalanceApprox();

		}catch(e){
			console.error("Gold price error", e);
			$("#goldPrice").text("Error");
		}
	}
	function calculateProfit(goldPrice){

		let balance = window.currentBalance || 0;
		let total = window.currentTotal || 0;
		let profit = (goldPrice * balance) - total;		
		$("#profitValue").text("$" + profit.toFixed(2));
	}
	function updateBalanceApprox(){

		let balance = parseFloat($("#balance").text());

		if(!balance || !window.lastGoldPrice){
			$("#balanceApprox").text("");
			return;
		}

		let approx = balance * window.lastGoldPrice;

		$("#balanceApprox").text("≈ (" + approx.toFixed(2) + ")");

		// Balance in Binance = Firestore balance - balanceApprox
		if(window.binanceBalance !== undefined){
			let finalBinance = window.binanceBalance - approx;
			$("#balance_in_binance").text("$" + finalBinance.toFixed(3));
		}
	} // end updateBalanceApprox


	async function loadBalanceInBinance() {
		try {
			let snapshot = await getDocs(collection(db, "balance"));
			let totalBalance = 0;

			snapshot.forEach(docSnap => {
				let data = docSnap.data();
				let amount = data.Amount ?? data.amount ?? 0;

				amount = parseFloat(amount);

				if (!isNaN(amount)) {
					totalBalance += amount;
				}
			});

			// save original balance from Firestore
			window.binanceBalance = totalBalance;

			// calculate again if gold price already loaded
			updateBalanceApprox();
			
			//$("#balance_in_binance").text("$" + totalBalance.toFixed(3));

		} catch (error) {
			console.error("Error loading Balance:", error);
			$("#balance_in_binance").text("$0.000");
		}
	} // end loadBalanceInBinance
});
