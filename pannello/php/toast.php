
<div class="modal fade" id="modalconfirm">
	<div class="modal-dialog" role="document">
		<div class="modal-content">
			<div class="modal-header">
				<h5 class="modal-title" id="mctitolo"></h5>
				<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close">
					<span aria-hidden="true"></span>
				</button>
			</div>
			<div class="modal-body" id="mcbody"></div>
			<div class="modal-footer">
				<button type="button" class="btn btn-danger" data-bs-dismiss="modal">Annulla</button>
				<button type="button" class="btn btn-success" id="mcok">OK</button>
			</div>
		</div>
	</div>
</div>

<script>
var tok = 0;
var tno = 0;

function showToast(type, msg, time = false) {
	if (type) {
		$('#divtoast').append('<div class="toast bg-success text-white" id="tok' + (tok) + '" role="alert" style="border-radius: 10px; margin: 10px 0px 0px 0px;" data-bs-delay="' + (time == false ? '1500' : time * 1000) + '"><div class="d-flex">' +
		'<div class="toast-body">' + msg + '</div>' +
		'<button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button></div></div>');
		$("#tok" + tok).toast("show");
		tok++;
	} else {
		$('#divtoast').append('<div class="toast bg-danger text-white" id="tno' + (tno) + '" role="alert" style="border-radius: 10px; margin: 10px 0px 0px 0px;" data-bs-delay="' + (time == false ? '3000' : time * 1000) + '"><div class="d-flex">' +
		'<div class="toast-body">' + msg + '</div>' +
		'<button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button></div></div>');
		$("#tno" + tno).toast("show");
		tno++;
	}
}

var modconfirm = new bootstrap.Modal(document.getElementById('modalconfirm'));

var modalConfirmTransitioning = false;
$('#modalconfirm').on('show.bs.modal', function() { modalConfirmTransitioning = true; });
$('#modalconfirm').on('shown.bs.modal', function() { modalConfirmTransitioning = false; });
$('#modalconfirm').on('hide.bs.modal', function() { modalConfirmTransitioning = true; });
$('#modalconfirm').on('hidden.bs.modal', function() { modalConfirmTransitioning = false; });

function modalConfirm(title, message) {
	return new Promise(function(resolve) {
		let resolved = false;

		$('#mcok').off('click.confirm');
		$('#modalconfirm').off('hide.bs.modal.confirm');
		$('#modalconfirm .btn-danger').off('click.confirm');

		$('#mcok').on('click.confirm', function() {
			if (resolved) return;
			resolved = true;
			resolve(true);
			modconfirm.hide();
		});

		$('#modalconfirm .btn-danger').on('click.confirm', function() {
			if (resolved) return;
			resolved = true;
			resolve(false);
			// modal will be hidden by data-bs-dismiss
		});

		$('#modalconfirm').on('hide.bs.modal.confirm', function() {
			if (resolved) return;
			resolved = true;
			resolve(false);
		});

		if (modalConfirmTransitioning && $('#modalconfirm').hasClass('show') === false) {
			$('#modalconfirm').one('hidden.bs.modal.waitShow', function() {
				prepareModalConfirm(title, message);
			});
		} else {
			prepareModalConfirm(title, message);
		}
	});
}

function prepareModalConfirm(title, message) {
	$('#mctitolo').html(title);
	$('#mcbody').html(message);
	modconfirm.show();
}
</script>