<!DOCTYPE html>
<html lang="it">
<head>
	<base href="../" />
	<?php include "../bootstrap.php" ?>
	<title>Login - Festival Management</title>
	<link rel="icon" type="image/png" href="media/heart-fill.png" />
</head>
<body>
	<div class="container">
		<div class="row justify-content-center">
			<div class="col-12 col-md-8 col-lg-6">
				<h1 class="mt-5 mb-3 text-center">Accedi</h1>

				<form id="loginForm">
					<div class="mb-3">
						<label for="username" class="form-label">Nome utente</label>
						<input type="text" class="form-control" id="username" name="username" required>
					</div>
					<div class="mb-3">
						<label for="password" class="form-label">Password</label>
						<input type="password" class="form-control" id="password" name="password" required>
					</div>

					<p id="message" class="mb-3 text-danger"></p>

					<button type="submit" class="btn btn-primary w-100">Login</button>
				</form>
			</div>
		</div>
	</div>

	<script>
	$(document).ready(function() {
		$('#loginForm').on('submit', function(event) {
			event.preventDefault();

			const formData = {
				username: $('#username').val(),
				password: $('#password').val()
			};

			$.ajax({
				url: '<?php echo $api_url; ?>/auth/token',
				type: 'POST',
				data: $.param(formData),
				contentType: 'application/x-www-form-urlencoded',
				success: function(response) {
					localStorage.setItem('jwt_token', response.access_token);
					page = getCookie('login_redirect');
					window.location.href = (page != '' ? page : 'index.html');
				},
				error: function(response) {
					if (response.status == 422) {
						$('#message').text('Errore di validazione: ' + response.detail[0].msg);
					} else {
						$('#message').text('Autenticazione fallita. Riprova.');
					}
				}
			});
		});
	});
	</script>
</body>
</html>