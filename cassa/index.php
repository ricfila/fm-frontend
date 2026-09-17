<!DOCTYPE html>
<html lang="it">
<head>
	<title>Cassa - Festival Management</title>

	<base href="../" />
	<?php include "../bootstrap.php" ?>

	<link href="cassa/style.css" rel="stylesheet" />
	<link href="media/heart-fill.png" rel="icon" type="image/png" />

	<script src="js/session.js"></script>
	<script src="cassa/js/main.js"></script>
	<script src="cassa/js/new_order.js"></script>
	<script src="cassa/js/load_order.js"></script>
	<script src="cassa/js/inputs.js"></script>
	<script src="cassa/js/save_order.js"></script>
	<script src="cassa/js/print.js"></script>
	<script src="cassa/js/edit_order.js"></script>
</head>
<!--
DA FARE:
* Finestra di riepilogo degli ordini modificati
* Correggere il totale: per gli ordini omaggio il totale deve restare 0 anche dopo la modifica
-->
<body style="height: 100vh;">
	<div class="container-lg h-100" style="padding-top: 53px; max-width: 100%;">
		<nav class="fixed-top navbar navbar-expand-md navbar-dark bg-danger">
			<div class="container-lg">
				<span class="navbar-brand">
					<i class="bi bi-heart-fill me-3"></i><span class="username"></span>
				</span>
				<button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarColor01" aria-controls="navbarColor01" aria-expanded="false" aria-label="Toggle navigation">
					<span class="navbar-toggler-icon"></span>
				</button>

				<div class="collapse navbar-collapse" id="navbarColor01">
					<ul class="navbar-nav me-auto">
						<li class="nav-item">
							<span class="nav-link" style="cursor: pointer;" id="newOrderItem"><i class="bi bi-plus-circle me-2"></i>Nuovo ordine</span>
						</li>
						<li class="nav-item dropdown" id="dropdownOrdersContainer">
							<a class="nav-link dropdown-toggle" href="#" id="dropdownOrders" role="button" data-bs-toggle="dropdown" aria-expanded="false">
								<i class="bi bi-clock-history me-2"></i>Ordini recenti
							</a>
							<ul class="dropdown-menu" id="dropdownOrdersMenu" aria-labelledby="dropdownOrders"></ul>
						</li>
						<li class="nav-item">
							<span class="nav-link" style="cursor: pointer;" onclick="searchOrder();"><i class="bi bi-search me-2"></i>Cerca per ID</span>
						</li>
					</ul>
					<?php //menuturno(); ?>
					<ul class="navbar-nav">
						<li class="nav-item">
							<span class="nav-link" style="cursor: pointer;" onclick="logout();"><i class="bi bi-box-arrow-right me-2"></i>Logout</span>
						</li>
					</ul>
				</div>
			</div>
		</nav>
	
		<div class="tab-content h-100 px-0 px-md-3 px-lg-4">
			<div id="tabneworder" class="tab-pane fade flex-column active show d-flex h-100">
				<div class="tab-content d-flex flex-column h-100">
					<div class="row h-100" style="overflow-x: hidden;">
						<!-- COLONNA SINISTRA -->
						<div class="col-md-6 h-100 d-flex flex-column">
							<div class="pt-2 mb-2 d-none row" id="infoHeader">
									<div class="col-md">
										<h4>N° <strong id="order-id"></strong><span id="parent-order-info"></span></h4>
										<p>
											<i class="bi bi-cart3 me-2"></i>Emesso da <i id="order-user"></i> <span id="order-created_at"></span>
											<span id="order-confirmed_at"></span>
										</p>
										<p id="ticket-list"></p>
									</div>
									<div class="col-md-auto text-end">
										<button class="btn btn-sm btn-outline-primary mb-2" id="print-btn" onclick="printOrder();"><i class="bi bi-printer-fill me-2"></i>Ristampa ricevuta</button><br>
										<span id="adding-order-btn"><button class="btn btn-sm btn-outline-success mb-2" onclick="addingOrder();"><i class="bi bi-plus-circle-fill me-2"></i>Aggiunta</button><br></span>
										<span id="delete-order-btn"></span>
									</div>
							</div>

							<div id="productList" class="px-3 pt-2 pb-3">
								<div class="row">
									<div class="col-auto spinner-border m-3"></div>
									<div class="col my-auto">Caricamento in corso...</div>
								</div>
							</div>
						</div>

						<!-- COLONNA DESTRA -->
						<div class="col-md-6 h-100 d-flex flex-column" id="orderContainer" style="transition: 0.2s;">
							<div id="orderHeaderInputs" class="pt-3 mb-2">
								<div class="row">
									<div class="col-6">
										<div class="row">
											<div class="col-auto my-auto">Nome:</div>
											<div class="col"><input id="customer" type="text" class="form-control form-control-sm d-inline mb-1" maxlength="31" autocomplete="off"></div>
										</div>
									</div>
									<div class="col-6">
										<div class="row">
											<div class="col-3 my-auto">Coperti:</div>
											<div class="col"><input id="guests" type="number" class="form-control form-control-sm d-inline" min="0" autocomplete="off"></div>
											<div class="col my-auto">
												<div class="form-check"><input class="form-check-input" type="checkbox" id="is_voucher"><label class="form-check-label" for="is_voucher">Omaggio</label></div>
											</div>
										</div>
									</div>
								</div>
								<div class="row">
									<div class="col-3 pe-1">
										<input type="checkbox" class="btn-check" id="is_take_away" autocomplete="off">
										<label class="btn btn-sm btn-outline-success w-100" for="is_take_away"><i class="bi bi-handbag-fill me-2"></i>Asporto</label>
									</div>
									<div class="col-3 ps-1">
										<input type="checkbox" class="btn-check" id="is_fast_order" autocomplete="off">
										<label class="btn btn-sm btn-outline-primary w-100" for="is_fast_order"><i class="bi bi-lightning-charge-fill me-2"></i>Flash</label>
									</div>
									<div class="col-6">
										<div class="row">
											<div class="col-3 my-auto">Tavolo:</div>
											<div class="col"><input id="table" type="text" class="form-control form-control-sm d-inline mb-1" maxlength="31" autocomplete="off"></div>
											<div class="col my-auto">
												<div class="form-check"><input class="form-check-input" type="checkbox" id="is_for_service"><label class="form-check-label" for="is_for_service">Servizio</label></div>
											</div>
										</div>
									</div>
								</div>
								<div class="row">
									<div class="col-auto my-auto">Note:</div>
									<div class="col"><input id="notes" type="text" class="form-control form-control-sm d-inline mb-1" maxlength="63" autocomplete="off"></div>
								</div>
							</div>

							<div id="orderProductsContainer" class="flex-fill mb-3">
								<div id="orderProducts" class="px-4 bg-white"></div>
								<div id="divtoast" class="toast-container bottom-0 end-0 pe-3" style="z-index: 1100; position: absolute;"></div>
							</div>
							<div class="px-3 py-2" id="orderFooter">
								<div class="row mb-2">
									<div class="col my-auto"><strong>Totale:</strong><span id="totalChangeInstructions" class="ms-3"></span></div>
									<div class="col-auto">
										<div class="lead p-1 border border-dark rounded-3 bg-light"><strong id="totalPrice"></strong></div>
									</div>
								</div>
								<div class="row">
									<div class="col-8 my-auto">
										<div class="row">
											<div class="col-auto my-auto">Pagamento:</div>
											<div class="col">
												<select id="paymentMethod" class="form-select form-select-sm">
													<option value="" disabled selected>Seleziona un'opzione</option>
												</select>
											</div>
										</div>
									</div>
									<div class="col">
										<button class="btn btn-success w-100" id="save-btn" onclick="saveOrder();"><i class="bi bi-save me-2"></i>SALVA e STAMPA</button>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div id="tabordinirecenti" class="tab-pane fade flex-column">
				<div class="tab-content flex-grow-1 colonnadx" style="overflow-y: auto;">
					<div class="row">
						<div class="col-auto">
							<h4><i class="bi bi-clock-history me-2"></i>Ordini recenti</h4>
						</div>
						<div class="col">
							<button class="btn btn-light" onclick="ultimiordini();"><i class="bi bi-arrow-clockwise me-2"></i>Aggiorna</button>
						</div>
					</div>
					<hr>
					<small>Legenda:&emsp;<span class="badge rounded-pill bg-success">&emsp;</span>&nbsp;Servito in sala&emsp;<span class="badge rounded-pill bg-info">&emsp;</span>&nbsp;Asporto&emsp;<i class="bi bi-cart3"></i>&nbsp;Ordinato&emsp;<i class="bi bi-check-circle"></i>&nbsp;Evaso</small>
					<br><br>
					<div id="bodyhome"></div>
				</div>
			</div>
			<div id="tabmodificaordine" class="tab-pane fade flex-column">
				<div class="tab-content flex-grow-1 colonnadx" style="overflow-y: auto;">
					<div class="row">
						<div class="col-auto">
							<h4><i class="bi bi-pencil me-2"></i>Modifica ordine</h4>
						</div>
						<div class="col-4">
							<div class="input-group">
								<input class="form-control idprog" id="numordine" placeholder="" type="number" min="0" onkeyup="if (event.keyCode == 13) apriordine();" />
								<button class="btn btn-success" onclick="apriordine();"><i class="bi bi-search"></i></button>
							</div>
						</div>
					</div><hr>
					<div id="modificaordine"></div>
				</div>
			</div>
			<div id="tabultimevendite" class="tab-pane fade flex-column">
				<div class="tab-content flex-grow-1 colonnadx" style="overflow-y: auto;">
					<h4><i class="bi bi-cart me-2"></i>Ultime vendite</h4><hr>
					<div class="row">
						<div class="col-6">
							Cerca tra gli ordini non evasi degli ultimi <strong id="ingminuti"></strong> minuti
							<input type="range" id="rangeminuti" class="form-range" min="1" max="60" oninput="range(61 - $(this).val());"/>
							<button class="btn btn-success btn-sm" onclick="ultimevendite();"><i class="bi bi-arrow-clockwise me-2"></i>Ricarica vendite</button>
						</div>
						<div class="col-6">
							<strong>Tempi di servizio di questo turno</strong>&emsp;<button class="btn btn-light btn-sm" onclick="statristrette();"><i class="bi bi-arrow-clockwise"></i></button><br>
							<span id="statristrette"></span>
						</div>
					</div>
					<hr>
					<div id="ingredienti"></div>
				</div>
			</div>
	<?php
	/*
	include "php/menuturno.php";
	include "php/strumenti/modificaordine.php";
	include "php/strumenti/statistiche.php";
	include "php/strumenti/chiudicassa.php";
	include "php/strumenti/bonifica.php";
	include "php/strumenti/ingredienti.php";
	*/
	?>
	<!--script src="js/ordinirecenti.js"></script-->
	<!--script src="js/ultimevendite.js"></script-->
			<div id="tabstatistiche" class="tab-pane fade flex-column">
				<div class="tab-content flex-grow-1 colonnadx h-100">
					<div class="d-flex h-100 flex-column">
						<div class="row">
							<div class="col-auto"><h4><i class="bi bi-bar-chart"></i> Statistiche sul servizio</h4></div>
							<div class="col"><button class="btn btn-light" onclick="caricastatistiche('#statistichebody');"><i class="bi bi-arrow-clockwise me-2"></i>Aggiorna</button></div>
						</div>
						<hr />
						<div id="statistichebody" class="d-flex" style="padding-top: 0px; padding-right: 0px; padding-bottom: 0px; overflow-x: hidden;"></div>
					</div>
				</div>
			</div>
			<div id="tabchiudicassa" class="tab-pane fade flex-column">
				<div class="tab-content flex-grow-1 colonnadx" style="overflow-y: auto;">
					<h4><i class="bi bi-printer me-2"></i>Stampa rapporti</h4><hr>
					<div id="chiudicassabody"></div>
				</div>
			</div>
			<div id="tabdatabase" class="tab-pane fade flex-column">
				<div class="tab-content flex-grow-1 colonnadx" style="overflow-y: auto;">
					<h4><i class="bi bi-clipboard-check me-2"></i>Azioni di bonifica del database</h4><hr>
					<?php //echo azionibonifica(); ?><br>
				</div>
			</div>
			<div id="tabingredienti" class="tab-pane fade flex-column">
				<div class="tab-content flex-grow-1 colonnadx" style="overflow-y: auto;">
					<h4><i class="bi bi-list-task me-2"></i>Anagrafica degli ingredienti e giacenze</h4><hr>
					<div class="row">
						<div class="col-auto input-group mb-3 w-50">
							<input type="text" class="form-control" id="filtraingredienti" onkeyup="filtraingredienti();" placeholder="Cerca tra gli ingredienti..."/>
							<button class="btn btn-danger" onclick="$('#filtraingredienti').val(''); filtraingredienti();"><i class="bi bi-x-lg"></i></button>
						</div>
						<div class="col">
							<button class="btn btn-success" onclick="modificaing(null);"><i class="bi bi-plus-lg me-2"></i>Nuovo ingrediente</button>
						</div>
					</div>
					<div id="ingredientibody"></div>
				</div>
			</div>
		</div>
	</div>
	
	<?php include "../js/toast.php"; ?>

	<script>
	function accessoalturno() {
		apritab('#tabordinirecenti');
	}
	
	$('.nav-link').on('shown.bs.tab', function () {
		$($(this).attr('data-bs-target')).addClass('d-flex');
		$($(this).attr('data-bs-target')).addClass('h-100');
	})
	.on('hidden.bs.tab', function() {
		$($(this).attr('data-bs-target')).removeClass('d-flex');
		$($(this).attr('data-bs-target')).removeClass('h-100');
	});
	
	function apritab(nome) {
		var tab = new bootstrap.Tab(document.querySelector('.nav-pills a[data-bs-target="' + nome + '"]'));
		tab.show();
	}
	</script>

</body>
</html>
