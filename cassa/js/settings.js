// file for settings for checkout UI

function initSettings() {
    //se non esistono le impostazioni le creo con valori di default
    if (localStorage.getItem('FM_show_menu_tabs') == null) {
        localStorage.setItem('FM_show_menu_tabs', false);
    }

    if (localStorage.getItem('FM_suggest_change') == null) {
        localStorage.setItem('FM_suggest_change', true);
    }

    take_away_categories = getTakeAwayCategories();
    if (take_away_categories.length > 0) {
        $('#form-choose-mods').show();

        take_away_categories.forEach(cat => {
            $('#mod-list').append('\
            <div class="form-check">\
                <input class="form-check-input flagShowTakeAway" type="checkbox" value="' + cat.take_away_type + '" id="show_take_away_' + cat.take_away_type + '" onclick="toggleShowTakeAway(' + cat.take_away_type + ');">\
                <label class="form-check-label" for="show_take_away_' + cat.take_away_type + '">\
                    ' + cat.name.charAt(0).toUpperCase() + cat.name.slice(1) + '\
                </label>\
            </div>');
        });
	} else {
        $('#form-choose-mods').hide();
    }

    console.log('Settings loaded: FM_show_menu_tabs = ' + localStorage.getItem('FM_show_menu_tabs') + ', FM_suggest_change = ' + localStorage.getItem('FM_suggest_change'));
}

//funzione per caricare le impostazioni nella modale
$(document).on('show.bs.modal', '#modalCheckoutSettings', () => {
    $('#flagShowMenuTabs').prop('checked', localStorage.getItem('FM_show_menu_tabs') == 'true');
    $('#flagSuggestChange').prop('checked', localStorage.getItem('FM_suggest_change') == 'true');
    $('.flagShowTakeAway').each(function() {
        $(this).prop('checked', localStorage.getItem('FM_show_take_away_' + $(this).val()) != 'false');
    });
});

//funzione per salvare la preferenza di visualizzare i prodotti come tabs o come lista
function updateShowProductsTabs() {
    localStorage.setItem('FM_show_menu_tabs', $('#flagShowMenuTabs').is(':checked').toString());
    loadProducts();
}

//funzione per salvare opzione di suggerire il resto
function updateSuggestChange() {
    localStorage.setItem('FM_suggest_change', $('#flagSuggestChange').is(':checked').toString());
}

function toggleShowTakeAway(type) {
    let key = 'FM_show_take_away_' + type;
    if (localStorage.getItem(key) == 'false')
        localStorage.removeItem(key);
    else
        localStorage.setItem(key, 'false');
    updateTakeAwayButtons();
}