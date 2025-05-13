<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
        }

        h2 {
            text-align: center;
            color: #8B4513;
        }

        p {
            font-size: 14px;
            margin: 5px 0;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            font-size: 14px;
        }

        th, td {
            border: 1px solid #999;
            padding: 8px;
            text-align: center;
        }

        th {
            background-color: #F2D7D5;
        }

        tfoot {
            font-weight: bold;
            background-color: #f0f0f0;
        }
    </style>
</head>
<body>
    @php
    use Carbon\Carbon;
   @endphp
    <h2>Rapport de Poids des Briques</h2>

    <p><strong>Date :</strong> {{ Carbon::parse($report->created_at)->format('d/m/Y') }}</p>
    <p><strong>Heure :</strong> {{ Carbon::parse($report->created_at)->format('H:i') }}</p>
    <p><strong>Fait par :</strong> {{ $report->user->name ?? 'Inconnu' }}</p>

    @if(!empty($groupedWeights) && count($groupedWeights))
        <table>
            <thead>
                <tr>
                    @foreach($groupedWeights as $zone => $weights)
                        <th>{{ $zone }}</th>
                    @endforeach
                </tr>
            </thead>
            <tbody>
                @for ($i = 0; $i < $maxRows; $i++)
                    <tr>
                        @foreach($groupedWeights as $zone => $weights)
                            <td>{{ $weights[$i] ?? '' }}</td>
                        @endforeach
                    </tr>
                @endfor
            </tbody>
        </table>
    @else
        <p><em>Aucune donnée de poids disponible.</em></p>
    @endif
</body>
</html>
