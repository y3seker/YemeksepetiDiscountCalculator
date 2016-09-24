var SUBTOTAL_VALUE_SELECTOR = "td.tdTotalValues > div.subTotal",
    TOTAL_VALUE_SELECTOR = "td.tdTotalValues > div.total",
    TOTAL_TEXT_SELECTOR = "td.tdTotalText > div.total",
    PRICE_REGEX = /[1-9]*[1-9]*[0-9],[0-9][0-9]/;

function hasDiscount() {
    return $(SUBTOTAL_VALUE_SELECTOR).children().size() !== 0;
}

var selectedTotal = 0;
var selectedCounts = [];
var $selectedTotal;

$(document.body).ready(function () {
    if (hasDiscount()) {
        clearSelectedTotal();
        calculate();
    }
});

function clearSelectedTotal() {
    for (var x = 0; x < selectedCounts.length; x++) {
        selectedCounts[x] = 0;
    }
    $(".tdOrderCount").each(function (index) {
        if (index !== 0) {
            $(this).children().first().text(0);
        }
    });
    selectedTotal = 0;
    updateSelectedTotal();
}

function updateSelectedTotal() {
    if ($selectedTotal !== undefined)
        $selectedTotal.text((selectedTotal.toFixed(2) + " TL").replace("-", ""));
}

function calculate() {
    var stString = PRICE_REGEX.exec($(SUBTOTAL_VALUE_SELECTOR).text())[0];
    var tString = PRICE_REGEX.exec($(TOTAL_VALUE_SELECTOR).text())[0];
    var subTotal = parseFloat(stString.replace(',', '.'));
    var total = parseFloat(tString.replace(',', '.'));

    var selectedTotalText = $(TOTAL_TEXT_SELECTOR).clone();
    selectedTotalText.empty().append("<br>").append("SEÇİLEN TOPLAM:");
    $('.tdTotalText').append(selectedTotalText);

    $selectedTotal = $("div.total:eq(1)").clone();
    var $clearButton = $("div.total:eq(1)").clone();
    $clearButton.empty().append("<p style=\"cursor: pointer; color:#505050;\">Temizle</p>");
    $clearButton.click(clearSelectedTotal);
    updateSelectedTotal();
    $(".tdTotalValues").append($selectedTotal);
    $(".tdTotalValues").append($clearButton);

    $(".tdOrderPrice").each(function (index) {
        var selected = false;
        if (index !== 0) {
            selectedCounts.push(0);
            var priceString = $(this).text().substring(0, $(this).text().length - 3).replace(',', '.');
            var price = parseFloat(priceString);
            var discountPrice = (total * price) / subTotal;
            $(this).empty();
            $(this).append("<b><s>" + price.toFixed(2) + " TL </s><p style=\"color:#48912a;\">" + discountPrice.toFixed(2) + " TL</p></b>");
            var count = parseInt($(this).next().text().trim());
            var countDiv = $(this).next();
            countDiv.append("<div>" + selectedCounts[index - 1]);
            if ($(this).next().next().children().size() === 0)
                $(this).next().next().append("<p style=\"color:#48912a;\">" + (count * discountPrice).toFixed(2) + " TL</p></b>");
            $(this).prev().append("<div id=\"plus\"><b style=\"background-color: none; cursor: pointer; float: left; padding: 3px 5px; color:#000;\"> + </b>");
            $(this).prev().find("#plus").click(function () {
                if (selectedCounts[index - 1] < count) {
                    selectedTotal += discountPrice
                    selectedCounts[index - 1]++;
                    countDiv.children().first().text(selectedCounts[index - 1]);
                    updateSelectedTotal();
                }
            });

            $(this).prev().append("<div id=\"minus\"><b style=\"background-color: none; cursor: pointer; float: left; padding: 3px 6px; color:#000;\"> - </b> ");
            $(this).prev().find("#minus").click(function () {
                if (selectedCounts[index - 1] > 0) {
                    selectedTotal -= discountPrice
                    selectedCounts[index - 1]--;
                    countDiv.children().first().text(selectedCounts[index - 1]);
                    updateSelectedTotal();
                }
            });
        }
    });
};
