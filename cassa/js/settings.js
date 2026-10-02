// file for settings for checkout UI

//se non esistono le impostazioni le creo con valori di default
if (localStorage.getItem('FM_show_menu_tabs') == null) {
    localStorage.setItem('FM_show_menu_tabs', 'false');
}

if (localStorage.getItem('FM_suggest_change') == null) {
    localStorage.setItem('FM_suggest_change', 'true');
}

//funzione per caricare le impostazioni nella modale
function loadCheckoutSettings() {
    if (localStorage.getItem('FM_show_menu_tabs') == 'true') {
        $('#flagShowMenuTabs').prop('checked', true);
    }

    if (localStorage.getItem('FM_suggest_change') == 'true') {
        $('#flagSuggestChange').prop('checked', true);
    }
}

//funzione per salvare la preferenza di visualizzare i prodotti come tabs o come lista
function updateShowProductsTabs() {
    if ($('#flagShowMenuTabs').is(':checked')) {
        localStorage.setItem('FM_show_menu_tabs', 'true');
    } else {
        localStorage.setItem('FM_show_menu_tabs', 'false');
    }

    loadProducts();
}

//funzione per salvare opzione di suggerire il resto
function updateSuggestChange() {
    if ($('#flagSuggestChange').is(':checked')) {
        localStorage.setItem('FM_suggest_change', 'true');
    } else {
        localStorage.setItem('FM_suggest_change', 'false');
    }
}

console.log('Settings loaded: FM_show_menu_tabs = ' + localStorage.getItem('FM_show_menu_tabs') + ', FM_suggest_change = ' + localStorage.getItem('FM_suggest_change'));