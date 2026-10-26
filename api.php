<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

const ACTIVITIES = [
    'Football match',
    'Picnic',
    'Coffee & catch-up',
    'Dinner out',
    'Movie night',
    'Hiking',
    'Game night',
    'Beach day',
    'Live music',
    'Friends hangout',
];

const SAMPLE_FRIENDS = [
    ['jamie-01', 'Jamie Rivera', '+1 (555) 014-2861', 'Pro footballer · midfielder', 'Mon–Fri after 6 pm', 'Premium', ['Football match', 'Picnic', 'Coffee & catch-up', 'Friends hangout']],
    ['maya-02', 'Maya Chen', '+1 (555) 017-3492', 'Photographer & weekend explorer', 'Weekends, usually free', 'Mid-range', ['Picnic', 'Hiking', 'Coffee & catch-up', 'Friends hangout']],
    ['alex-03', 'Alex Thompson', '+1 (555) 012-7054', 'Product designer · football fan', 'Evenings after 5 pm', 'Budget-friendly', ['Football match', 'Game night', 'Movie night', 'Friends hangout']],
    ['sofia-04', 'Sofia Martinez', '+1 (555) 019-6382', 'Chef in training · foodie', 'Tue & Thu evenings', 'Mid-range', ['Dinner out', 'Picnic', 'Coffee & catch-up', 'Friends hangout']],
    ['noah-05', 'Noah Williams', '+1 (555) 013-9207', 'Software engineer · game-night host', 'Friday nights & weekends', 'Budget-friendly', ['Game night', 'Football match', 'Movie night', 'Friends hangout']],
    ['ava-06', 'Ava Johnson', '+1 (555) 016-4518', 'Yoga instructor & trail lover', 'Weekday mornings, Sundays', 'Budget-friendly', ['Hiking', 'Picnic', 'Beach day', 'Friends hangout']],
    ['liam-07', 'Liam Patel', '+1 (555) 011-8743', 'Music producer · live-show regular', 'Thursday–Saturday evenings', 'Premium', ['Live music', 'Dinner out', 'Coffee & catch-up', 'Friends hangout']],
    ['isabella-08', 'Isabella Brooks', '+1 (555) 018-2065', 'Teacher · movie buff', 'Weekends & school breaks', 'Budget-friendly', ['Movie night', 'Picnic', 'Game night', 'Friends hangout']],
    ['ethan-09', 'Ethan Kim', '+1 (555) 015-7924', 'Semi-pro footballer · fitness coach', 'Wed evenings & Sunday', 'Mid-range', ['Football match', 'Hiking', 'Beach day', 'Friends hangout']],
    ['zoe-10', 'Zoe Carter', '+1 (555) 010-5369', 'Illustrator · beach enthusiast', 'Most Saturdays, after noon', 'Premium', ['Beach day', 'Live music', 'Dinner out', 'Picnic', 'Friends hangout']],
];

function respond(array $data, int $status = 200): never
{
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
    exit;
}

function getDatabase(): PDO
{
    $host = getenv('GATHER_DB_HOST') ?: '127.0.0.1';
    $port = getenv('GATHER_DB_PORT') ?: '3306';
    $database = getenv('GATHER_DB_NAME') ?: 'hangout';
    $username = getenv('GATHER_DB_USER') ?: 'root';
    $password = getenv('GATHER_DB_PASS') ?: '';

    $pdo = new PDO(
        "mysql:host={$host};port={$port};dbname={$database};charset=utf8mb4",
        $username,
        $password,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]
    );

    $tableExists = (bool) $pdo->query(
        "SELECT EXISTS (
            SELECT 1 FROM information_schema.tables
            WHERE table_schema = DATABASE() AND table_name = 'friends'
        )"
    )->fetchColumn();

    $pdo->exec(
        'CREATE TABLE IF NOT EXISTS friends (
            id VARCHAR(64) NOT NULL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            phone VARCHAR(30) NOT NULL,
            role VARCHAR(120) NOT NULL DEFAULT \'\',
            availability VARCHAR(120) NOT NULL DEFAULT \'\',
            budget VARCHAR(32) NOT NULL DEFAULT \'Budget-friendly\',
            activities JSON NOT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci'
    );

    if (!$tableExists) {
        seedFriends($pdo);
    }
    return $pdo;
}

function seedFriends(PDO $pdo): void
{
    if ((int) $pdo->query('SELECT COUNT(*) FROM friends')->fetchColumn() > 0) {
        return;
    }

    $insert = $pdo->prepare(
        'INSERT IGNORE INTO friends (id, name, phone, role, availability, budget, activities)
         VALUES (:id, :name, :phone, :role, :availability, :budget, :activities)'
    );

    foreach (SAMPLE_FRIENDS as [$id, $name, $phone, $role, $availability, $budget, $activities]) {
        $insert->execute([
            'id' => $id,
            'name' => $name,
            'phone' => $phone,
            'role' => $role,
            'availability' => $availability,
            'budget' => $budget,
            'activities' => json_encode($activities, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR),
        ]);
    }
}

function requestBody(): array
{
    try {
        $data = json_decode(file_get_contents('php://input'), true, 512, JSON_THROW_ON_ERROR);
    } catch (JsonException) {
        respond(['error' => 'Request body must be valid JSON.'], 400);
    }

    if (!is_array($data)) {
        respond(['error' => 'Request body must be a JSON object.'], 400);
    }

    return $data;
}

function validateFriend(array $data): array
{
    $name = trim((string) ($data['name'] ?? ''));
    $phone = trim((string) ($data['phone'] ?? ''));
    $role = trim((string) ($data['role'] ?? ''));
    $availability = trim((string) ($data['availability'] ?? ''));
    $budget = (string) ($data['budget'] ?? '');
    $activities = $data['activities'] ?? null;

    if ($name === '' || mb_strlen($name) > 100 || $phone === '' || mb_strlen($phone) > 30) {
        respond(['error' => 'Enter a name (up to 100 characters) and phone number (up to 30 characters).'], 422);
    }
    if (mb_strlen($role) > 120 || mb_strlen($availability) > 120) {
        respond(['error' => 'Role and availability must be 120 characters or fewer.'], 422);
    }
    if (!in_array($budget, ['Budget-friendly', 'Mid-range', 'Premium'], true)) {
        respond(['error' => 'Choose a valid spending range.'], 422);
    }
    if (!is_array($activities) || count($activities) === 0) {
        respond(['error' => 'Choose at least one activity.'], 422);
    }

    $activities = array_values(array_unique($activities));
    foreach ($activities as $activity) {
        if (!is_string($activity) || !in_array($activity, ACTIVITIES, true)) {
            respond(['error' => 'One or more activities are not supported.'], 422);
        }
    }

    return [
        'name' => $name,
        'phone' => $phone,
        'role' => $role,
        'availability' => $availability,
        'budget' => $budget,
        'activities' => $activities,
    ];
}

function friendFromRow(array $row): array
{
    $row['activities'] = json_decode($row['activities'], true, 512, JSON_THROW_ON_ERROR);
    return $row;
}

try {
    $pdo = getDatabase();
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    $resource = $_GET['resource'] ?? '';
    $id = $_GET['id'] ?? '';

    if ($resource !== 'friends') {
        respond(['error' => 'Unknown API resource.'], 404);
    }

    if ($method === 'GET') {
        $rows = $pdo->query(
            'SELECT id, name, phone, role, availability, budget, activities
             FROM friends ORDER BY created_at ASC, name ASC'
        )->fetchAll();
        respond(array_map('friendFromRow', $rows));
    }

    if ($method === 'POST') {
        $friend = validateFriend(requestBody());
        $friend['id'] = 'friend-' . bin2hex(random_bytes(12));
        $insert = $pdo->prepare(
            'INSERT INTO friends (id, name, phone, role, availability, budget, activities)
             VALUES (:id, :name, :phone, :role, :availability, :budget, :activities)'
        );
        $insert->execute([
            ...$friend,
            'activities' => json_encode($friend['activities'], JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR),
        ]);
        respond($friend, 201);
    }

    if ($method === 'PUT') {
        if ($id === '') {
            respond(['error' => 'A friend ID is required.'], 400);
        }
        $friend = validateFriend(requestBody());
        $update = $pdo->prepare(
            'UPDATE friends
             SET name = :name, phone = :phone, role = :role, availability = :availability,
                 budget = :budget, activities = :activities
             WHERE id = :id'
        );
        $update->execute([
            ...$friend,
            'activities' => json_encode($friend['activities'], JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR),
            'id' => $id,
        ]);
        if ($update->rowCount() === 0) {
            $exists = $pdo->prepare('SELECT 1 FROM friends WHERE id = :id');
            $exists->execute(['id' => $id]);
            if (!$exists->fetchColumn()) {
                respond(['error' => 'Friend not found.'], 404);
            }
        }
        respond(['id' => $id, ...$friend]);
    }

    if ($method === 'DELETE') {
        if ($id === '') {
            respond(['error' => 'A friend ID is required.'], 400);
        }
        $delete = $pdo->prepare('DELETE FROM friends WHERE id = :id');
        $delete->execute(['id' => $id]);
        if ($delete->rowCount() === 0) {
            respond(['error' => 'Friend not found.'], 404);
        }
        respond(['deleted' => true]);
    }

    header('Allow: GET, POST, PUT, DELETE');
    respond(['error' => 'Method not allowed.'], 405);
} catch (PDOException $exception) {
    error_log('Gather database error: ' . $exception->getMessage());
    respond(['error' => 'Could not connect to or update the Hangout database. Check that Laragon MySQL is running and database settings are correct.'], 503);
} catch (JsonException $exception) {
    error_log('Gather JSON error: ' . $exception->getMessage());
    respond(['error' => 'The database returned invalid friend data.'], 500);
} catch (Throwable $exception) {
    error_log('Gather API error: ' . $exception->getMessage());
    respond(['error' => 'The request could not be completed.'], 500);
}
