<?php $writeups = require $_SERVER['DOCUMENT_ROOT'] . '/data/writeups_data.php'; ?>

<!doctype html>
<html lang="en" class="h-100">
  
    <?php require "resources/head.php"; ?>

	<body class="d-flex h-100 text-center text-white bg-dark">
    
		<div class="cover-container d-flex w-100 h-100 p-3 mx-auto flex-column">
			<?php require "resources/header.php"; ?>

			<?php require "resources/main.php"; ?>

			<?php require "resources/footer.php"; ?>	
		</div>	
	</body>
</html>
