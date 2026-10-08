//array con i tagli della valuta per il calcolo del resto, per mostrarne altri basta aggiungere un oggetto con value, label e icon
CURRENCY_CUTS = [
    { value: 0.01, label: "0,01", icon: "./media/euro/coin_1c.svg", show: false },
    { value: 0.02, label: "0,02", icon: "./media/euro/coin_2c.svg", show: false },
    { value: 0.05, label: "0,05", icon: "./media/euro/coin_5c.svg", show: false },
    { value: 0.1, label: "0,10", icon: "./media/euro/coin_10c.svg", show: true },
    { value: 0.2, label: "0,20", icon: "./media/euro/coin_20c.svg", show: true },
    { value: 0.5, label: "0,50", icon: "./media/euro/coin_50c.svg", show: true },
    { value: 1, label: "1,00", icon: "./media/euro/coin_1e.svg", show: true },
    { value: 2, label: "2,00", icon: "./media/euro/coin_2e.svg", show: true },
    { value: 5, label: "5,00", icon: "./media/euro/note_5.svg", show: true },
    { value: 10, label: "10,00", icon: "./media/euro/note_10.svg", show: true },
    { value: 20, label: "20,00", icon: "./media/euro/note_20.svg", show: true },
    { value: 50, label: "50,00", icon: "./media/euro/note_50.svg", show: true },
    { value: 100, label: "100,00", icon: "./media/euro/note_100.svg", show: true }
];

//init tagli modale per il resto
$(function () {
    CURRENCY_CUTS.forEach(cut => {
        if (cut.show) {
            $('#currencyCuts').append('\
        <div class="col-3 col-md-3 col-lg-3 text-center">\
            <button class="btn cut-btn" onclick="addCut(' + cut.value + ');">\
                <img src="' + cut.icon + '" alt="' + cut.label + '" class="cut-' + (cut.value >= 5 ? 'note' : 'coin') + '"><br>\
                <small>' + cut.label + '</small>\
            </button>\
        </div>');
        }
    });
});

//binding per mostrare la modale del resto quando si seleziona pagamento in contanti, a patto che sia attiva l'opzione di suggerire il resto e che l'importo dovuto sia positivo
$(document).on('change', '#paymentMethod', () => {
    $('#btn-change').prop('disabled', true);
    $('#paidAmount').val('').trigger('input');

    if ($('#paymentMethod').val() == 1 && localStorage.getItem('FM_suggest_change') == 'true' && escapeDecimal($('#dueAmount').val()) >= 0)
        $('#modalChange').modal('show');

});

//aggiunta di un taglio al totale pagato
function addCut(value) {
    let paid = escapeDecimal(Number($('#paidAmount').val()));
    console.log('paid: ' + paid + ', value: ' + value);
    paid += value;
    $('#paidAmount').val(paid.toFixed(2)).trigger('input');
}

//ricalcolo del resto quando cambia l'importo pagato
$(document).on('input', '#paidAmount', () => {

    const paid = escapeDecimal($('#paidAmount').val());
    const total = escapeDecimal($('#dueAmount').val());
    const change = paid - total;
    const invalid = isNaN(change) || change < 0;

    $('#dueChange')
        .val(isNaN(change) ? '' : change.toFixed(2))
        .toggleClass('change-ko', invalid)
        .toggleClass('change-ok', !invalid);
    $('#btn-change').prop('disabled', invalid);
});

//button per cancellare il resto inserito
function erasePaidAmount() {
    $('#paidAmount').val('').trigger('input');
}



