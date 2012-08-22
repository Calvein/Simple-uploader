<?php
die(file_put_contents('/donnees/workspaces/upload/'.$_SERVER['HTTP_X_FILE_NAME'], file_get_contents("php://input")));