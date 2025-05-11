<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Rapport PDF</title>
    <style>
        body { font-family: sans-serif; }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        th, td {
            border: 1px solid #aaa;
            padding: 8px;
            text-align: center;
        }
        th {
            background-color: #eee;
        }
    </style>
</head>
<body>

<h2>Détails du Rapport</h2>
<p><strong>Date:</strong> {{ $report->created_at->format('Y-m-d') }}</p>
<p><strong>Heure:</strong> {{ $report->created_at->format('H:i') }}</p>
<p><strong>Fait par:</strong> {{ $report->user->name }}</p>

<h3>Poids des Briques</h3>

@php
    // Gather all zone names
    $zones = $report->brickWeights->pluck('zone')->unique()->values();

    // Reorganize data as: row index => [zone1 => value, zone2 => value, ...]
    $structured = [];

    foreach ($zones as $zone) {
        $zoneValues = $report->brickWeights->where('zone', $zone)->values();
        foreach ($zoneValues as $i => $entry) {
            $structured[$i][$zone] = $entry->weight . ' kg';
        }
    }
@endphp

<table>
    <thead>
        <tr>
            <th>#</th>
            @foreach ($zones as $zone)
                <th>{{ ucfirst($zone) }}</th>
            @endforeach
        </tr>
    </thead>
    <tbody>
        @foreach ($structured as $i => $row)
            <tr>
                <td>{{ $i + 1 }}</td>
                @foreach ($zones as $zone)
                    <td>{{ $row[$zone] ?? '-' }}</td>
                @endforeach
            </tr>
        @endforeach
    </tbody>
</table>

</body>
</html>
