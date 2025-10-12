<?php
session_start();

if (!isset($_SESSION['user'])) {
    $_SESSION['user'] = 'Alice';
    $_SESSION['balance'] = 10000;
    $_SESSION['secret'] = rand(1000000, 9999999);
}

$protection = getenv('PROTECTION') ?: 'none';

if ($protection === 'xframe') {
    header("X-Frame-Options: DENY");
} elseif ($protection === 'csp') {
    header("Content-Security-Policy: frame-ancestors 'self'");
}

$message = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['action'])) {
        if ($_POST['action'] === 'delete_account') {
            $message = '<div style="color: red; padding: 10px; background: #fee;">Account DELETED (Simulated)</div>';
            $_SESSION['balance'] = 0;
        } elseif ($_POST['action'] === 'transfer') {
            $amount = $_POST['amount'] ?? 0;
            $_SESSION['balance'] -= $amount;
            $message = '<div style="color: green; padding: 10px; background: #efe;">Transferred $' . $amount . '</div>';
        }
    }
}
?>
<!DOCTYPE html>
<html>
<head>
    <title>Bank32 - Secure Banking</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        .protection-badge {
            display: inline-block;
            padding: 5px 10px;
            background: rgba(255,255,255,0.2);
            border-radius: 4px;
            font-size: 12px;
        }
        .card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            margin-bottom: 20px;
        }
        .balance {
            font-size: 32px;
            color: #667eea;
            font-weight: bold;
        }
        button {
            background: #667eea;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 4px;
            cursor: pointer;
            margin: 5px;
        }
        button.danger {
            background: #dc3545;
        }
        input[type="number"] {
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
            width: 150px;
        }
        .secret {
            background: #fff3cd;
            padding: 10px;
            border-radius: 4px;
            font-family: monospace;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Bank32 Online Banking</h1>
        <div class="protection-badge">Protection: <?php echo strtoupper($protection); ?></div>
    </div>

    <?php echo $message; ?>

    <div class="card">
        <h2>Welcome, <?php echo htmlspecialchars($_SESSION['user']); ?></h2>
        <p>Your account balance:</p>
        <div class="balance">$<?php echo number_format($_SESSION['balance'], 2); ?></div>
    </div>

    <div class="card">
        <h3>Your Secret Code</h3>
        <div class="secret">Secret: <?php echo $_SESSION['secret']; ?></div>
    </div>

    <div class="card">
        <h3>Quick Transfer</h3>
        <form method="POST">
            <input type="hidden" name="action" value="transfer">
            <input type="number" name="amount" value="1000" step="100">
            <button type="submit">Transfer Money</button>
        </form>
    </div>

    <div class="card">
        <h3>Account Management</h3>
        <form method="POST">
            <input type="hidden" name="action" value="delete_account">
            <button type="submit" class="danger">Delete Account</button>
        </form>
    </div>

    <div class="card" style="background: #e9ecef; font-size: 12px;">
        <strong>Security Info:</strong><br>
        Protection: <?php echo $protection === 'none' ? 'VULNERABLE' : 'PROTECTED'; ?>
        <?php if ($protection === 'xframe'): ?>
            <br>Header: X-Frame-Options: DENY
        <?php elseif ($protection === 'csp'): ?>
            <br>Header: Content-Security-Policy: frame-ancestors 'self'
        <?php endif; ?>
    </div>
</body>
</html>