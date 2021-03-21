<?php $request = $_SERVER['REQUEST_URI']; ?>

<main class="px-3">

    <?php
        switch($request) {
            case '/index.php': case '/':
                require __DIR__ . '/views/homepage.php'; break;
            case '/writeups.php':
                require __DIR__ . '/views/writeups.php'; break;
            default:
                http_response_code(400);
                require __DIR__ . '/views/404.php'; break;
        }

    ?>

</main>