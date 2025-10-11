<!DOCTYPE html>
<html lang="it">
<head>
	<title>Monitor - Festival Management</title>

	<base href="../" />
	<?php include "../bootstrap.php" ?>

	<link href="media/display-fill.png" rel="icon" type="image/png" />

	<script src="js/session.js"></script>
	<script src="monitor/js/main.js"></script>
</head>
<body>
	<div class="container-lg h-100" style="padding-top: 53px;">
		<nav class="fixed-top navbar navbar-expand-lg navbar-dark bg-warning">
			<div class="container-lg">
				<span class="navbar-brand">
					<a href="monitor/" class="navbar-brand"><i class="bi bi-display-fill"></i> Monitor cucina</a>
				</span>
				
				<ul class="navbar-nav text-end">
					<li class="nav-item">
						<span class="nav-link" onclick="update();"><i class="bi bi-arrow-clockwise"></i> Aggiorna</a>
					</li>
				</ul>
			</div>
		</nav>

		<div id="body" class="pt-3">
			<h5>Seleziona il reparto degli ingredienti che vuoi controllare</h5>
			<div id="ward-list"></div>
		</div>

	</div>
</body>
</html>