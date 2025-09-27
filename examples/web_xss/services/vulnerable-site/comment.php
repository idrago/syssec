<?php
// Simulate stored XSS by writing to a simple file
$course = $_POST['course'] ?? '';
$name = $_POST['name'] ?? '';
$comment = $_POST['comment'] ?? '';

if (!empty($comment)) {
    $timestamp = date('Y-m-d H:i:s');
    $entry = "[$timestamp] $name ($course): $comment\n";
    file_put_contents('comments.txt', $entry, FILE_APPEND | LOCK_EX);
}

// Read and display all comments
$comments = file_exists('comments.txt') ? file('comments.txt', FILE_IGNORE_NEW_LINES) : [];
?>
<!DOCTYPE html>
<html>
<head>
    <title>Course Reviews</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 20px auto; padding: 20px; }
        .container { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .warning { background: #fff3cd; color: #856404; padding: 15px; border-radius: 6px; margin-bottom: 20px; }
        .comment { background: #f8f9fa; padding: 15px; margin: 10px 0; border-left: 4px solid #007bff; }
        a { color: #007bff; text-decoration: none; }
    </style>
</head>
<body>
    <div class="container">
        <div class="warning">
            <strong>Stored XSS Vulnerability:</strong> Comments are stored and displayed without sanitization
        </div>
        
        <h2>Course Reviews</h2>
        
        <?php if (!empty($comment)): ?>
            <div style="background: #d4edda; color: #155724; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
                Review submitted successfully!
            </div>
        <?php endif; ?>
        
        <div>
            <?php foreach (array_reverse($comments) as $commentLine): ?>
                <div class="comment">
                    <?php echo $commentLine; ?>
                </div>
            <?php endforeach; ?>
        </div>
        
        <?php if (empty($comments)): ?>
            <p>No reviews yet. Be the first to leave a review!</p>
        <?php endif; ?>
        
        <p><a href="index.html">← Back to Forms</a></p>
    </div>
</body>
</html>