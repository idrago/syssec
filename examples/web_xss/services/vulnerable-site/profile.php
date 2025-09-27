<?php
$display_name = $_POST['display_name'] ?? '';
$bio = $_POST['bio'] ?? '';
$quote = $_POST['quote'] ?? '';
$homepage = $_POST['homepage'] ?? '';
?>
<!DOCTYPE html>
<html>
<head>
    <title>Profile Updated</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 20px auto; padding: 20px; }
        .container { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .warning { background: #fff3cd; color: #856404; padding: 15px; border-radius: 6px; margin-bottom: 20px; }
        .profile-section { background: #f8f9fa; padding: 15px; margin: 15px 0; border-radius: 6px; }
        a { color: #007bff; text-decoration: none; }
    </style>
</head>
<body>
    <div class="container">
        <div class="warning">
            <strong>Multiple XSS Vulnerabilities:</strong> All profile fields are vulnerable to XSS injection
        </div>
        
        <h2>Profile Updated Successfully</h2>
        
        <div class="profile-section">
            <h3>Your Profile</h3>
            <p><strong>Display Name:</strong> <?php echo $display_name; ?></p>
            <p><strong>Bio:</strong> <?php echo $bio; ?></p>
            <p><strong>Favorite Quote:</strong> <em><?php echo $quote; ?></em></p>
            <p><strong>Homepage:</strong> <a href="<?php echo $homepage; ?>"><?php echo $homepage; ?></a></p>
        </div>
        
        <p><a href="index.html">← Back to Forms</a></p>
    </div>
</body>
</html>