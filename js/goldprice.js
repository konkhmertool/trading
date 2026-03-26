$(document).ready(function(){

	let currentSymbol = "XAUUSD"; // GOLD default
	let currentUnit = "OZ";
	let currentPrice = 0;

	// MENU
	$("#menuToggle").on("click", function () {
		$("#mainMenu").toggleClass("show");
	});

	$(document).on("click", function (e) {
		if (!$(e.target).closest("#menuToggle, #mainMenu").length) {
			$("#mainMenu").removeClass("show");
		}
	});

	// =========================
	// LOAD PRICE FROM API
	// =========================
	async function loadPrice(){

        try{
            let res = await fetch("https://api.metals.live/v1/spot");
            let data = await res.json();

            let gold = data.find(x => x.gold)?.gold || 0;
            let silver = data.find(x => x.silver)?.silver || 0;

            currentPrice = currentSymbol === "XAUUSD" ? gold : silver;

            updatePriceDisplay();

        }catch(e){
            console.error("Price API error", e);
        }
    }

	// =========================
	// UPDATE DISPLAY
	// =========================
	function updatePriceDisplay(){

        if(!currentPrice) return; // 🛑 prevent wrong calc

        let price = currentPrice;

        if(currentUnit === "KG"){
            price = price * 32.1507;
        }

        $("#priceValue").text(price.toFixed(2));
    }

	// =========================
	// LOAD CHART
	// =========================
	function loadChart(){

		$("#tradingview_chart").html("");

		new TradingView.widget({
			container_id: "tradingview_chart",
			width: "100%",
			height: 400,
			symbol: "OANDA:" + currentSymbol,
			interval: "15",
			timezone: "Asia/Bangkok",
			theme: "light",
			style: "1",
			locale: "en"
		});
	}

	// =========================
	// EVENTS
	// =========================

	$("#btnGold").click(function(){
		currentSymbol = "XAUUSD";
		$(".btn").removeClass("active");
		$(this).addClass("active");

		loadPrice();
		loadChart();
	});

	$("#btnSilver").click(function(){
		currentSymbol = "XAGUSD";
		$(".btn").removeClass("active");
		$(this).addClass("active");

		loadPrice();
		loadChart();
	});

	$("#unit").change(function(){
        currentUnit = $(this).val();

        // 🔥 FORCE RECALCULATE
        updatePriceDisplay();
    });

	// =========================
	// INIT
	// =========================
	loadPrice();
	loadChart();

});