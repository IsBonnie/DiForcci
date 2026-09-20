<?php
declare(strict_types=1);

// Dados do servidor MySQL/MariaDB.
$host = 'localhost';
$porta = '3306';
$banco = 'diforcci';
$usuario = 'root';
$senha = 'Isa30112004!';

function conectarBanco(): PDO
{
    global $host, $porta, $banco, $usuario, $senha;
    $dsn = "mysql:host={$host};port={$porta};dbname={$banco};charset=utf8mb4";
    return new PDO($dsn, $usuario, $senha, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
}
