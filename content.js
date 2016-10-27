var SUBTOTAL_VALUE_SELECTOR = "td.tdTotalValues > div.subTotal",
    TOTAL_VALUE_SELECTOR = "td.tdTotalValues > div.total",
    TOTAL_TEXT_SELECTOR = "td.tdTotalText > div.total",
    PRICE_REGEX = /[1-9]*[1-9]*[0-9],[0-9][0-9]/;

var cepteteb = null;
var discount = null;

$(document.body).ready(function () {
    cepteteb = new Cepteteb();
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

function inject() {
    // Create discount object
    discount = new Discount();

    // Inject items
    $(".tdOrderPrice").each(function (index) {
        if (index !== 0) {
            var discountItem = new DiscountItem($(this), index);
            discountItem.appendCount($(this).next());
            discountItem.appendPrice($(this));
            discountItem.appendTotalPrice($(this).next().next());
            discountItem.appendButtons($(this).prev());
            discount.items.push(discountItem);
        }
    });
};

class Discount {
    constructor() {
        this.subTotalPrice = parsePrice($(SUBTOTAL_VALUE_SELECTOR).text());
        this.totalPrice = parsePrice($(TOTAL_VALUE_SELECTOR).text());;
        this.selectedPrice = 0.0;
        this.items = [];
        this.inject();
    }

    inject() {
        if ($(".tdNote").children().size() > 0) $(".tdNote").append("<br><br>");
        $(".tdNote").append("<span style=\"color:#48912a; padding-right: 6px\"><b>SEÇİLEN TOPLAM:</span>");
        $(".tdNote").append("<b style=\"color:#48912a;\" id=\"selectedTotal\">0.00 TL</b>");
        $(".tdNote").append("<b style=\"background:#f0f0f0;cursor: pointer;color:#707070;margin-left: 10px;padding:5px;\" id=\"clearButton\">Temizle</button>");
        var that = this;
        $("#clearButton").click(function () {
            that.clearSelection();
        });
    }

    getTotalPrice() {
        return cepteteb.isEnabled() ? this.totalPrice * 0.8 : this.totalPrice;
    };

    updateSelectedTotal(increment) {
        this.selectedPrice += increment;
        this.update(this.selectedPrice);
    };

    update(total) {
        $("#selectedTotal").text(toTL(total));
    };

    clearSelection() {
        this.selectedPrice = 0.0;
        this.update(0);
        for (var i = 0; i < this.items.length; i++) {
            this.items[i].clearSelection();
        }
    };

    calculate() {
        this.selectedPrice = 0.0;
        for (var i = 0; i < this.items.length; i++) {
            this.selectedPrice += this.items[i].getSelectedPrice();
            this.items[i].update();
        }
        this.update(this.selectedPrice);
    };
};

class DiscountItem {
    constructor($$, index) {
        this.oldPrice = parsePrice($$.text());;
        this.newPrice = (discount.totalPrice * this.oldPrice) / discount.subTotalPrice;
        this.count = parseInt($$.next().text().trim());
        this.index = index;
        this.selectedCount = 0;
        this.countSelector = "";
        this.priceSelector = "";
        this.totalPriceSelector = "";
    }

    appendPrice($$) {
        this.priceSelector = "#itemPrice" + this.index;
        $$.empty();
        $$.append("<b><s>" + toTL(this.oldPrice) + " </s><p id=\"" +
            this.priceSelector.replace("#", "") + "\" style=\"color:#48912a;\">" +
            toTL(this.newPrice) + "</p></b>");
    };

    appendCount($$) {
        this.selectedCount = 0;
        this.countSelector = "#itemCount" + this.index;
        $$.append("<div id=\"" + this.countSelector.replace("#", "") + "\"> 0");
    };

    appendTotalPrice($$) {
        this.totalPriceSelector = "#itemTotalPrice" + this.index;
        $$.empty();
        $$.append("<s style=\"color:#000;\">" + toTL(this.oldPrice * this.count) + "</s>");
        $$.append("<p id=\"" + this.totalPriceSelector.replace("#", "") +
            "\" style=\"color:#48912a;\">" + toTL(this.count * this.newPrice) + "</p></b>");
    };

    appendButtons($$) {
        var that = this;
        // Plus button
        $$.append("<div id=\"plus\"><b style=\"background-color: none; cursor: pointer; float: left; padding: 3px 5px; color:#000;\"> + </b>");
        $$.find("#plus").click(function () {
            that.add();
        });

        // Minus button
        $$.append("<div id=\"minus\"><b style=\"background-color: none; cursor: pointer; float: left; padding: 3px 6px; color:#000;\"> - </b> ");
        $$.find("#minus").click(function () {
            that.remove();
        });
    };
    getSelectedPrice() {
        return this.selectedCount * this.getPrice();
    };

    getPrice() {
        return cepteteb.isEnabled() ? this.newPrice * 0.8 : this.newPrice;
    }

    update() {
        $(this.countSelector).text(this.selectedCount + "");
        $(this.priceSelector).text(toTL(this.getPrice()));
        $(this.totalPriceSelector).text(toTL(this.count * this.getPrice()));
    };

    add() {
        if (this.selectedCount < this.count) {
            this.selectedCount++;
            this.update();
            discount.updateSelectedTotal(this.getPrice());
        }
    };

    remove() {
        if (this.selectedCount > 0) {
            this.selectedCount--;
            this.update();
            discount.updateSelectedTotal(this.getPrice() * -1);
        }
    };

    clearSelection() {
        this.selectedCount = 0;
        this.update();
    };
}

class Cepteteb {

    constructor() {
        this.enabled = false;
        this.total = parsePrice($(TOTAL_VALUE_SELECTOR).text());
        this.newTotal = this.total * 0.8;
        this.profit = this.total - this.newTotal;
        this.inject();
    }

    inject() {
        var that = this;
        // Append cepteteb checkbox
        $(".ys-basket > h3").append("<b style=\"position: absolute; right: 10px;\"><input class=\"optionCheck\" type=\"checkbox\" id=\"ceptetebCheckbox\">Cepteteb</b>");
        $('#ceptetebCheckbox').change(function () {
            that.setEnabled(this.checked);
        });

        // Append total label
        this.totalLabel = $(TOTAL_TEXT_SELECTOR).clone().hide();
        this.totalLabel.empty().append("<br>").append("CEPTETEB:");
        // Append profit label
        this.profitLabel = $(TOTAL_TEXT_SELECTOR).clone().hide();
        this.profitLabel.empty().append("<br><br>").append("KAZANÇ:");
        // Append total value
        this.totalValue = $("div.total:eq(1)").clone().hide();
        this.totalValue.text(toTL(this.newTotal));
        // Append profit value
        this.profitValue = $("div.total:eq(1)").clone().hide();
        this.profitValue.text(toTL(this.profit));

        $('.tdTotalText').append(this.totalLabel);
        $('.tdTotalText').append(this.profitLabel);
        $(".tdTotalValues").append(this.totalValue);
        $(".tdTotalValues").append(this.profitValue);
    }

    isEnabled() {
        return this.enabled;
    }

    setEnabled(val) {
        this.enabled = val;
        if (this.enabled) {
            this.totalLabel.show(100);
            this.totalValue.show(100);
            this.profitLabel.show(100);
            this.profitValue.show(100);
        } else {
            this.totalLabel.hide(100);
            this.totalValue.hide(100);
            this.profitLabel.hide(100);
            this.profitValue.hide(100);
        }
        if (discount !== null)
            discount.calculate();
    }

}