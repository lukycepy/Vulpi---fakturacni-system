
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

export function StockTable({ stocks }: { stocks: any[] }) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Produkt</TableHead>
                    <TableHead className="text-right">Množství</TableHead>
                    <TableHead className="text-right">Rezervováno</TableHead>
                    <TableHead className="text-right">Dostupné</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {stocks.map((stock: any) => (
                    <TableRow key={stock.id}>
                        <TableCell className="font-medium">{stock.product.name}</TableCell>
                        <TableCell className="text-right font-bold">{stock.quantity}</TableCell>
                        <TableCell className="text-right text-orange-500">{stock.reserved}</TableCell>
                        <TableCell className="text-right text-green-600">{stock.quantity - stock.reserved}</TableCell>
                    </TableRow>
                ))}
                {stocks.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                            Sklad je prázdný.
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );
}
