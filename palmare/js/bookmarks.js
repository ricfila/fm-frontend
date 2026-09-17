async function bookmarks() {
	lastMenuFunction = bookmarks;
	updateHeader('info', 'caret-left-fill', 'initList();', 'Segnalibri');

	let bookmarked = [];
	for (let i = 0; i < localStorage.length; i++) {
		let k = localStorage.key(i);

		if (k.startsWith('bookmark_')) {
			let id = localStorage.getItem(k);
			if (confirmed[id] == null) {
				confirmed[id] = await fetchOrder(id, required_for_summary);
			}
			bookmarked[id] = confirmed[id];
		}
	}

	$('#page-body').html('');
	if (bookmarked.length > 0) {
		$('#page-body').append('<div class="text-end mb-3"><button class="btn btn-sm btn-outline-danger" onclick="removeAllBookmarks();"><i class="bi bi-bookmark-x-fill me-2"></i>Rimuovi tutti</button></div>');

		let delay = 0;
		bookmarked.forEach(order => {
			$('#page-body').append(btnOrder(order, delay));
			delay += 0.02;
		});
	} else {
		$('#page-body').append('Nessun segnalibro salvato in questo dispositivo.');
	}
}


function isBookmarked(id) {
	return localStorage.getItem('bookmark_' + id) != null;
}


function toggleBookmark(id) {
	if (isBookmarked(id))
		localStorage.removeItem('bookmark_' + id);
	else
		localStorage.setItem('bookmark_' + id, id);
	$('#btnBookmark').html(btnBookmark());
}


function btnBookmark() {
	let bookmarked = isBookmarked(current_id);
	return '<button class="btn btn-sm btn-' + (bookmarked ? 'warning' : 'success') + ' me-2" onclick="toggleBookmark(' + current_id + ');"><i class="bi bi-bookmark' + (bookmarked ? '-fill' : '') + ' me-2"></i>' + (bookmarked ? 'Rimuovi' : 'Aggiungi') + ' segnalibro</button>';
}


async function removeAllBookmarks() {
	let ok = await modalConfirm('Elimina i segnalibri', 'Sei sicuro di voler eliminare tutti i segnalibri salvati?');
	if (ok) {
		const bookmarkKeys = [];
		for (let i = 0; i < localStorage.length; i++) {
			const k = localStorage.key(i);
			if (k && k.startsWith('bookmark_'))
				bookmarkKeys.push(k);
		}

		bookmarkKeys.forEach(k => localStorage.removeItem(k));
		bookmarks();
	}
}
