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
	// UPDATE DISPLAY
	// =========================
	function updatePriceDisplay(){

        if(!currentPrice) return;

        let price = currentPrice;

        // 🔥 ONLY CONVERT HERE
        if(currentUnit === "KG"){
            price = currentPrice * 32.1507;
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
			height: 500,
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

	$(".metal-group .btn").click(function(){

        // remove active from BOTH buttons
        $(".metal-group .btn").removeClass("active");

        // add active only to clicked one
        $(this).addClass("active");

        // switch symbol
        if(this.id === "btnGold"){
            currentSymbol = "XAUUSD";
        }else{
            currentSymbol = "XAGUSD";
        }

        loadPrice();
        loadChart();
    });

	$("#unit").change(function(){
        currentUnit = $(this).val();

        // 🔥 DO NOT FETCH AGAIN
        updatePriceDisplay();
    });

    // 🔥 LOAD REAL GOLD / SILVER PRICE
    async function loadPrice(){

        let url = currentSymbol === "XAUUSD"
            ? "https://api.gold-api.com/price/XAU"
            : "https://api.gold-api.com/price/XAG";

        try{
            let res = await fetch(url);
            let data = await res.json();

            // 🔥 STORE ORIGINAL OZ PRICE
            currentPrice = data.price;

            updatePriceDisplay();

        }catch(e){
            console.error("Price error:", e);
            $("#priceValue").text("Error");
        }
    }

	// =========================
	// INIT
	// =========================	
    loadPrice();
	loadChart();

});