'use client';

import { api } from '@/utils/api';

export default function ExportPage() {
    const handleExportCSV = () => {
        api.exportCSV();
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Export Data</h1>

            <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">CSV Export</h2>
                <p className="text-gray-600 mb-4">
                    Download all metrics data as a CSV file for analysis in external tools.
                </p>
                <button
                    onClick={handleExportCSV}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    📥 Download CSV
                </button>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Export Options</h2>
                <ul className="space-y-2 text-gray-600">
                    <li>• Includes all historical metrics data</li>
                    <li>• Data is formatted for easy import into spreadsheets</li>
                    <li>• Timestamps are in ISO 8601 format</li>
                    <li>• All numeric values are preserved with full precision</li>
                </ul>
            </div>
        </div>
    );
}
