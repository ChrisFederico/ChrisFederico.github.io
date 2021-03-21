

<h1 class="mt-5">Write-ups</h1>
<p class="lead">
	Here there are some CTFs walkthroughs from <a href="https://www.hackthebox.eu/">HackTheBox</a>, <a href="https://tryhackme.com/">TryHackMe</a> and other sites I completed.
</p>

<div class="container mt-5">
	<div class="row">
		<?php foreach($writeups as $writeup): ?>

			<?php 
				$description = "";
			?>
			<div class="col-md-4">
				<div class="card" style="width: 18rem;">
					<img class="card-img-top" src="<?=$writeup['image']?>" alt="Card image cap">
					<div class="card-body">
						<h5 class="card-title text-dark"><?=$writeup['name']?></h5>
						<p class="card-text text-dark">
							<b>Details:</b> <a href="<?=$writeup['link']?>"><?=$writeup['name']?></a><br>
							<b>Type: </b> <?=$writeup['type']?><br>
							<b>Difficulty: </b> <?=$writeup['difficulty']?>
						</p>
						<a href="<?=$writeup['path']?>" class="btn btn-primary">Go to Write-up</a>
					</div>
				</div>
			</div>
		<?php endforeach; ?>	
	</div>
	
</div>