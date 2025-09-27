<?php
// Deliberately vulnerable - NO input sanitization
$query = $_GET['query'] ?? '';
?>
<!DOCTYPE html>
<html>
<head>
    <title>Search Results</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 20px auto; padding: 20px; }
        .container { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .warning { background: #fff3cd; color: #856404; padding: 15px; border-radius: 6px; margin-bottom: 20px; }
        .results { background: #f8f9fa; padding: 15px; border-radius: 6px; margin: 20px 0; }
        a { color: #007bff; text-decoration: none; }
        a:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <div class="container">
        <div class="warning">
            <strong>Reflected XSS Vulnerability:</strong> User input is directly echoed without sanitization
        </div>
        
        <h2>Search Results</h2>
        
        <?php if (!empty($query)): ?>
            <div class="results">
                <h3>You searched for: <?php echo $query; ?></h3>
                <p>Here are the courses matching "<strong><?php echo $query; ?></strong>":</p>
                
                <ul>
                    <li>CS101 - Introduction to Programming (if <?php echo $query; ?> matches)</li>
                    <li>MATH200 - Calculus II</li>
                    <li>PHYS150 - General Physics</li>
                </ul>
                
                <p>Search term was processed: <em><?php echo $query; ?></em></p>
            </div>
        <?php else: ?>
            <p>Please enter a search term.</p>
        <?php endif; ?>
        
        <p><a href="index.html">← Back to Search</a></p>
    </div>
</body>
</html>