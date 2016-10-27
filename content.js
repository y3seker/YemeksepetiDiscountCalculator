var SUBTOTAL_VALUE_SELECTOR = "td.tdTotalValues > div.subTotal",
    TOTAL_VALUE_SELECTOR = "td.tdTotalValues > div.total",
    TOTAL_TEXT_SELECTOR = "td.tdTotalText > div.total",
    PRICE_REGEX = /[1-9]*[1-9]*[0-9],[0-9][0-9]/;

var selectedTotal = 0;
var selectedCounts = [];
var $selectedTotal;
var ceptetebSelected = false;

$(document.body).ready(function () {
    if (hasDiscount())
        inject();
});

function hasDiscount() {
    return $(SUBTOTAL_VALUE_SELECTOR).children().size() !== 0;
}

function toTL(price) {
    return (price.toFixed(2) + " TL").replace("-", "");
}

function parsePrice(priceText) {
    var priceString = PRICE_REGEX.exec(priceText.trim())[0];
    return parseFloat(priceString.replace(',', '.'));
}

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
        $selectedTotal.text(toTL(selectedTotal));
}

function inject() {
    var subTotal = parsePrice($(SUBTOTAL_VALUE_SELECTOR).text());
    var total = parsePrice($(TOTAL_VALUE_SELECTOR).text());

    // Selected total label
    var selectedTotalText = $(TOTAL_TEXT_SELECTOR).clone();
    selectedTotalText.empty().append("<br>").append("SEÇİLEN TOPLAM:");
    $('.tdTotalText').append(selectedTotalText);

    $selectedTotal = $("div.total:eq(1)").clone();
    updateSelectedTotal();

    // Clear button
    var $clearButton = $("div.total:eq(1)").clone();
    $clearButton.empty().append("<p style=\"cursor: pointer; color:#505050;\">Temizle</p>");
    $clearButton.click(clearSelectedTotal);

    $(".tdTotalValues").append($selectedTotal);
    $(".tdTotalValues").append($clearButton);

    // Append cepteteb checkbox
    $(".ys-basket > h3").append("<b style=\"position: absolute; right: 10px;\"><input type=\"checkbox\" id=\"ceptetebCheckbox\">Cepteteb</b>");	
    $('#ceptetebCheckbox').change(function() {
	    ceptetebSelected = this.checked;
    });
    injectItems(total, subTotal);
};

function injectItems(total, subTotal) {
    $(".tdOrderPrice").each(function (index) {
        var selected = false;
        if (index !== 0) {
            selectedCounts.push(0);
            var price = parsePrice($(this).text());
            var discountPrice = (total * price) / subTotal;

            // Append old and new prices
            $(this).empty();
            $(this).append("<b><s>" + toTL(price) + " </s><p style=\"color:#48912a;\">" +
                toTL(discountPrice) + "</p></b>");

            var count = parseInt($(this).next().text().trim());
            var countDiv = $(this).next();
            countDiv.append("<div>" + selectedCounts[index - 1]);

            // Plus button
            $(this).prev().append("<div id=\"plus\"><b style=\"background-color: none; cursor: pointer; float: left; padding: 3px 5px; color:#000;\"> + </b>");
            $(this).prev().find("#plus").click(function () {
                if (selectedCounts[index - 1] < count) {
                    selectedTotal += discountPrice
                    selectedCounts[index - 1]++;
                    countDiv.children().first().text(selectedCounts[index - 1]);
                    updateSelectedTotal();
                }
            });

            // Minus button
            $(this).prev().append("<div id=\"minus\"><b style=\"background-color: none; cursor: pointer; float: left; padding: 3px 6px; color:#000;\"> - </b> ");
            $(this).prev().find("#minus").click(function () {
                if (selectedCounts[index - 1] > 0) {
                    selectedTotal -= discountPrice
                    selectedCounts[index - 1]--;
                    countDiv.children().first().text(selectedCounts[index - 1]);
                    updateSelectedTotal();
                }
            });

            // Append item's total price
            if ($(this).next().next().children().size() === 0)
                $(this).next().next().append("<p style=\"color:#48912a;\">" + toTL(count * discountPrice) + "</p></b>");
        }
    });
}
