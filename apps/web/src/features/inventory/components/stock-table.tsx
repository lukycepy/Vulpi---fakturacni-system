
export function StockTable({ stocks }: { stocks: any[] }) {
    return (
        <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                    <th className="p-2">Produkt</th>
                    <th className="p-2 text-right">Množství</th>
                    <th className="p-2 text-right">Rezervováno</th>
                    <th className="p-2 text-right">Dostupné</th>
                </tr>
            </thead>
            <tbody>
                {stocks.map((stock: any) => (
                    <tr key={stock.id} className="border-b">
                        <td className="p-2">{stock.product.name}</td>
                        <td className="p-2 text-right font-bold">{stock.quantity}</td>
                        <td className="p-2 text-right text-orange-500">{stock.reserved}</td>
                        <td className="p-2 text-right text-green-600">{stock.quantity - stock.reserved}</td>
                    </tr>
                ))}
                {stocks.length === 0 && <tr><td colSpan={4} className="p-4 text-center text-gray-500">Sklad je prázdný.</td></tr>}
            </tbody>
        </table>
    );
}
