<!DOCTYPE html>
<html lang="it">
<head>
	<?php include "bootstrap.php" ?>
	<title>Home - Festival Management</title>
	<link rel="icon" type="image/png" href="media/festival-management-logo.png" />

	<script src="js/session.js"></script>
</head>
<body>
	<div class="container">
		<div class="row justify-content-center">
			<div class="col-12 col-md-8 col-lg-6">
				<img src="media/festival-management-extended-logo.png" class="w-100" />

				<span id="loginInfo"></span>

				<a href="cassa/" class="btn btn-lg btn-outline-danger mb-3 w-100"><i class="bi bi-heart-fill me-2"></i>Cassa</a>
				<a href="palmare/" class="btn btn-lg btn-outline-success mb-3 w-100"><i class="bi bi-compass-fill me-2"></i>Palmare</a>
				<a href="cucina/" class="btn btn-lg btn-outline-warning mb-3 w-100"><i class="bi bi-display-fill me-2"></i>Cucina</a>
			</div>
		</div>
	</div>

	<script>
	$(document).one('fm:sessionReady', function () {
		if (username == null) {
			$('#loginInfo').html('<div class="row mb-5"><div class="col my-auto">Accesso non eseguito</div><div class="col-auto"><a href="login/" class="btn btn-info"><i class="bi bi-box-arrow-in-right me-2"></i>Accedi</a>');
		} else {
			$('#loginInfo').html('<div class="row mb-5"><div class="col my-auto">Accesso eseguito come <strong>' + username + '</strong></div><div class="col-auto"><button onclick="logout();" class="btn btn-dark"><i class="bi bi-box-arrow-right me-2"></i>Disconnettiti</a>');
		}
	});
	</script>

	<div id="divtoast" class="toast-container bottom-0 end-0 p-3" style="z-index: 1100; position: fixed;"></div>
	<?php include "js/toast.php"; ?>
</body>
</html>